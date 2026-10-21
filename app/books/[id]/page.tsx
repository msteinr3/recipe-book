"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { commonStyles } from "@/styles/common";

const RECIPE_CATEGORIES = [
  "Appetizers",
  "Soups",
  "Salads",
  "Main Dishes",
  "Side Dishes",
  "Breads & Doughs",
  "Desserts",
  "Drinks",
  "Other",
];

type Book = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
};

type Recipe = {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
};

type BookRecipe = {
  book_id: string;
  recipe_id: string;
  position: number | null;
  recipe: Recipe;
};

type BookRecipeResult = Omit<BookRecipe, "recipe"> & {
  recipe: Recipe | Recipe[] | null;
};

type Member = {
  user_id: string;
  email: string;
  role: "owner" | "editor";
};

export default function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [bookRecipes, setBookRecipes] = useState<BookRecipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    { id: string; invited_email: string; expires_at: string }[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [pickerLoading, setPickerLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [pickerError, setPickerError] = useState("");

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setErrorMessage("");

      const resolvedParams = await params;
      const id = resolvedParams.id;

      if (cancelled) return;

      setBookId(id);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      let user = session?.user ?? null;

      if (!user) {
        const {
          data: { user: fetchedUser },
        } = await supabase.auth.getUser();

        user = fetchedUser;
      }

      if (!user) {
        if (!cancelled) {
          setErrorMessage("You must be logged in to view this book.");
          setLoading(false);
        }
        return;
      }

      if (cancelled) return;

      setCurrentUserId(user.id);

      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (bookError || !bookData) {
        if (!cancelled) {
          setErrorMessage("Book not found or you don't have access to it.");
          setLoading(false);
        }
        return;
      }

      if (cancelled) return;

      const typedBook = bookData as Book;

      setBook(typedBook);
      setTitleDraft(typedBook.title);

      const { data: bookRecipesData, error: bookRecipesError } = await supabase
        .from("book_recipes")
        .select(
          `
              book_id,
              recipe_id,
              position,
              recipe:recipes (
                id,
                title,
                category,
                image_url
              )
            `,
        )
        .eq("book_id", id);

      if (bookRecipesError) {
        if (!cancelled) {
          setErrorMessage(bookRecipesError.message);
          setLoading(false);
        }
        return;
      }

      if (cancelled) return;

      const recipeRows = (bookRecipesData ?? []) as BookRecipeResult[];
      const normalizedBookRecipes: BookRecipe[] = recipeRows
        .flatMap((item) => {
          const recipe = Array.isArray(item.recipe)
            ? item.recipe[0]
            : item.recipe;

          return recipe
            ? [
                {
                  book_id: item.book_id,
                  recipe_id: item.recipe_id,
                  position: item.position,
                  recipe,
                },
              ]
            : [];
        });

      setBookRecipes(normalizedBookRecipes);

      const { data: membersData, error: membersError } = await supabase.rpc(
        "get_book_members",
        {
          p_book_id: id,
        },
      );

      if (!cancelled && !membersError) {
        setMembers((membersData ?? []) as Member[]);
      }

      if (!cancelled && !membersError) {
        setMembers((membersData ?? []) as Member[]);
      }

      const { data: invitationsData, error: invitationsError } = await supabase
        .from("book_invitations")
        .select("id, invited_email, expires_at")
        .eq("book_id", id)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (!cancelled && !invitationsError) {
        setPendingInvitations(invitationsData ?? []);
      }

      if (!cancelled) {
        setLoading(false);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [params]);

  async function saveTitle() {
    if (!book || !bookId) return;

    const newTitle = titleDraft.trim();

    if (!newTitle) {
      setTitleDraft(book.title);
      setIsEditingTitle(false);
      return;
    }

    if (newTitle === book.title) {
      setIsEditingTitle(false);
      return;
    }

    const { error } = await supabase
      .from("books")
      .update({ title: newTitle })
      .eq("id", bookId);

    if (error) {
      setErrorMessage(error.message);
      setTitleDraft(book.title);
      setIsEditingTitle(false);
      return;
    }

    setBook((current) => (current ? { ...current, title: newTitle } : current));

    setTitleDraft(newTitle);
    setIsEditingTitle(false);
  }

  async function saveDescription() {
    if (!book || !bookId) return;

    const newDescription = descriptionDraft.trim();
    const currentDescription = book.description ?? "";

    if (newDescription === currentDescription) {
      setIsEditingDescription(false);
      return;
    }

    const { error } = await supabase
      .from("books")
      .update({ description: newDescription || null })
      .eq("id", bookId);

    if (error) {
      setErrorMessage(error.message);
      setDescriptionDraft(currentDescription);
      setIsEditingDescription(false);
      return;
    }

    setBook((current) =>
      current ? { ...current, description: newDescription || null } : current,
    );

    setIsEditingDescription(false);
  }

  function handleTitleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveTitle();
    }

    if (event.key === "Escape") {
      setTitleDraft(book?.title ?? "");
      setIsEditingTitle(false);
    }
  }

  async function openPicker() {
    setPickerError("");
    setSearch("");
    setPickerLoading(true);
    setIsPickerOpen(true);

    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, category, image_url")
      .order("title");

    if (error) {
      setPickerError(error.message);
      setPickerLoading(false);
      return;
    }

    setRecipes((data ?? []) as Recipe[]);
    setPickerLoading(false);
  }

  function closePicker() {
    setIsPickerOpen(false);
    setSearch("");
    setPickerError("");
  }

  async function handleAddRecipe(recipeId: string) {
    if (!bookId) return;

    setPickerError("");

    const alreadyAdded = bookRecipes.some(
      (bookRecipe) => bookRecipe.recipe_id === recipeId,
    );

    if (alreadyAdded) return;

    const { error } = await supabase.from("book_recipes").insert({
      book_id: bookId,
      recipe_id: recipeId,
      position: bookRecipes.length,
    });

    if (error) {
      setPickerError(error.message);
      return;
    }

    const recipe = recipes.find((item) => item.id === recipeId);

    if (recipe) {
      setBookRecipes((current) => [
        ...current,
        {
          book_id: bookId,
          recipe_id: recipe.id,
          position: current.length,
          recipe,
        },
      ]);
    }
  }

  async function handleRemoveRecipe(recipeId: string) {
    if (!bookId) return;

    const { error } = await supabase
      .from("book_recipes")
      .delete()
      .eq("book_id", bookId)
      .eq("recipe_id", recipeId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setBookRecipes((current) =>
      current.filter((item) => item.recipe_id !== recipeId),
    );
  }

  async function handleInvite() {
    if (!bookId) return;

    setInviteMessage("");

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setInviteMessage("Please enter an email address.");
      return;
    }

    const { error } = await supabase.rpc("create_book_invitation", {
      p_book_id: bookId,
      p_invited_email: email,
    });

    if (error) {
      setInviteMessage(error.message);
      return;
    }

    setInviteEmail("");
    setInviteMessage("Invitation created.");

    const { data } = await supabase
      .from("book_invitations")
      .select("id, invited_email, expires_at")
      .eq("book_id", bookId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      setPendingInvitations(data);
    }
  }

  async function handleRemoveEditor(member: Member) {
    if (!bookId || !isOwner) return;

    const confirmed = window.confirm(
      `Remove ${member.email} from this book? They will lose access to it.`,
    );

    if (!confirmed) return;

    setErrorMessage("");
    setInviteMessage("");

    const { error } = await supabase
      .from("book_members")
      .delete()
      .eq("book_id", bookId)
      .eq("user_id", member.user_id)
      .eq("role", "editor");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMembers((current) =>
      current.filter((item) => item.user_id !== member.user_id),
    );
  }

  const recipesByCategory = RECIPE_CATEGORIES.map((category) => ({
    category,
    recipes: bookRecipes
      .filter(
        (bookRecipe) => (bookRecipe.recipe.category ?? "Other") === category,
      )
      .sort((a, b) =>
        a.recipe.title.localeCompare(b.recipe.title, undefined, {
          sensitivity: "base",
        }),
      ),
  })).filter((section) => section.recipes.length > 0);

  const isOwner = book ? currentUserId === book.owner_id : false;

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <p>Loading book...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !book || !bookId) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <Link href="/profile" style={commonStyles.link}>
            ← Back to Profile
          </Link>

          <h1 style={commonStyles.messageTitle}>Book not found</h1>

          <p style={commonStyles.messageText}>
            {errorMessage ||
              "This book does not exist or you do not have access to it."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <Link href="/profile" style={commonStyles.link}>
            ← Back to Profile
          </Link>

          <div style={commonStyles.bookManage.header}>
            <div>
              {isEditingTitle ? (
                <input
                  autoFocus
                  type="text"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={handleTitleKeyDown}
                  style={commonStyles.bookManage.titleInput}
                />
              ) : (
                <h1
                  style={
                    isOwner
                      ? commonStyles.bookManage.bookTitleOwner
                      : commonStyles.bookManage.bookTitleReadOnly
                  }
                  onClick={() => {
                    if (isOwner) {
                      setTitleDraft(book.title);
                      setIsEditingTitle(true);
                    }
                  }}
                  title={isOwner ? "Click to edit" : undefined}
                >
                  {book.title}
                </h1>
              )}

              {isEditingDescription ? (
                <textarea
                  autoFocus
                  value={descriptionDraft}
                  onChange={(event) => setDescriptionDraft(event.target.value)}
                  onBlur={saveDescription}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setDescriptionDraft(book.description ?? "");
                      setIsEditingDescription(false);
                    }

                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      saveDescription();
                    }
                  }}
                  style={commonStyles.bookManage.descriptionInput}
                  placeholder="Add a book description..."
                />
              ) : (
                <p
                  style={
                    isOwner
                      ? commonStyles.bookManage.bookDescriptionOwner
                      : commonStyles.bookManage.bookDescriptionReadOnly
                  }
                  onClick={() => {
                    if (isOwner) {
                      setDescriptionDraft(book.description ?? "");
                      setIsEditingDescription(true);
                    }
                  }}
                  title={isOwner ? "Click to edit description" : undefined}
                >
                  {book.description ||
                    (isOwner ? "Add a book description..." : "")}
                </p>
              )}

              <div style={commonStyles.bookManage.role}>
                {isOwner ? "Owner" : "Editor"}
              </div>
            </div>
          </div>

          <div style={commonStyles.buttonRow}>
            <Link
              href={`/books/${book.id}/preview`}
              style={commonStyles.bookManage.previewButton}
            >
              Preview Book
            </Link>

            <button
              type="button"
              onClick={openPicker}
              style={commonStyles.bookManage.primaryButton}
            >
              Add Recipes
            </button>
          </div>

          {recipesByCategory.length === 0 ? (
            <div style={commonStyles.bookManage.emptyState}>
              <p>This book does not have any recipes yet.</p>

              <button
                type="button"
                onClick={openPicker}
                style={commonStyles.bookManage.primaryButton}
              >
                Add Your First Recipe
              </button>
            </div>
          ) : (
            <div style={commonStyles.bookManage.sections}>
              {recipesByCategory.map((section) => (
                <section
                  key={section.category}
                  style={commonStyles.bookManage.section}
                >
                  <h2 style={commonStyles.bookManage.sectionTitle}>
                    {section.category}
                  </h2>

                  <div style={commonStyles.bookManage.recipeList}>
                    {section.recipes.map((bookRecipe) => (
                      <div
                        key={bookRecipe.recipe_id}
                        style={commonStyles.bookManage.recipeRow}
                      >
                        <Link
                          href={`/recipes/${bookRecipe.recipe_id}`}
                          style={commonStyles.bookManage.recipeLink}
                        >
                          <div style={commonStyles.bookManage.recipeInfo}>
                            <h3 style={commonStyles.bookManage.recipeTitle}>
                              {bookRecipe.recipe.title}
                            </h3>

                            <p style={commonStyles.bookManage.recipeCategory}>
                              {bookRecipe.recipe.category ?? "Other"}
                            </p>
                          </div>

                          <img
                            src={
                              bookRecipe.recipe.image_url ||
                              "/images/default-food.jpg"
                            }
                            alt={bookRecipe.recipe.title}
                            style={commonStyles.bookManage.recipeImage}
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveRecipe(bookRecipe.recipe_id)
                          }
                          style={commonStyles.bookManage.removeButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {isOwner && (
            <section style={commonStyles.bookManage.collaborators}>
              <h2 style={commonStyles.bookManage.collaboratorsTitle}>
                Collaborators
              </h2>

              <div style={commonStyles.bookManage.memberList}>
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    style={commonStyles.bookManage.memberRow}
                  >
                    <div>
                      <strong>{member.email}</strong>
                      <span style={commonStyles.bookManage.memberRole}>
                        {member.role}
                      </span>
                    </div>

                    {member.role === "editor" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEditor(member)}
                        style={
                          commonStyles.bookManage.collaboratorRemoveButton
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pendingInvitations.length > 0 && (
                <div style={commonStyles.bookManage.memberList}>
                  <h3 style={commonStyles.bookManage.inviteTitle}>
                    Pending invitations
                  </h3>
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      style={commonStyles.bookManage.memberRow}
                    >
                      <div>
                        <strong>{invitation.invited_email}</strong>
                        <span style={commonStyles.bookManage.memberRole}>
                          Expires{" "}
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={commonStyles.bookManage.memberRole}>
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={commonStyles.bookManage.inviteBox}>
                <h3 style={commonStyles.bookManage.inviteTitle}>
                  Invite an editor
                </h3>

                <div style={commonStyles.bookManage.inviteRow}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="Friend's account email"
                    style={commonStyles.bookManage.input}
                  />

                  <button
                    type="button"
                    onClick={handleInvite}
                    style={commonStyles.bookManage.primaryButton}
                  >
                    Invite
                  </button>
                </div>

                {inviteMessage && (
                  <p style={commonStyles.bookManage.message}>{inviteMessage}</p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {isPickerOpen && (
        <div style={commonStyles.modalOverlay}>
          <div style={commonStyles.largeModal}>
            <div style={commonStyles.modalHeader}>
              <h2 style={commonStyles.sectionTitle}>Add Recipes</h2>

              <button
                type="button"
                onClick={closePicker}
                style={commonStyles.modalCloseButton}
              >
                ×
              </button>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search recipes..."
              style={commonStyles.searchInput}
            />

            {pickerError && (
              <p style={commonStyles.bookManage.error}>{pickerError}</p>
            )}

            {pickerLoading ? (
              <p>Loading recipes...</p>
            ) : filteredRecipes.length === 0 ? (
              <p>No recipes found.</p>
            ) : (
              <div style={commonStyles.verticalList}>
                {filteredRecipes.map((recipe) => {
                  const alreadyAdded = bookRecipes.some(
                    (bookRecipe) => bookRecipe.recipe_id === recipe.id,
                  );

                  return (
                    <div
                      key={recipe.id}
                      style={commonStyles.bookManage.pickerRow}
                    >
                      <div style={commonStyles.bookManage.pickerRecipeInfo}>
                        <img
                          src={recipe.image_url || "/images/default-food.jpg"}
                          alt={recipe.title}
                          style={commonStyles.bookManage.pickerImage}
                        />

                        <div>
                          <strong>{recipe.title}</strong>

                          <div style={commonStyles.bookManage.pickerCategory}>
                            {recipe.category ?? "Other"}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRecipe(recipe.id)}
                        disabled={alreadyAdded}
                        style={
                          alreadyAdded
                            ? commonStyles.bookManage.addedButton
                            : commonStyles.bookManage.addButton
                        }
                      >
                        {alreadyAdded ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
