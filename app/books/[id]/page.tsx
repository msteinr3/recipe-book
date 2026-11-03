"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";


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

          <div style={styles.bookManage.header}>
            <div>
              {isEditingTitle ? (
                <input
                  autoFocus
                  type="text"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={handleTitleKeyDown}
                  style={styles.bookManage.titleInput}
                />
              ) : (
                <h1
                  style={
                    isOwner
                      ? styles.bookManage.bookTitleOwner
                      : styles.bookManage.bookTitleReadOnly
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
                  style={styles.bookManage.descriptionInput}
                  placeholder="Add a book description..."
                />
              ) : (
                <p
                  style={
                    isOwner
                      ? styles.bookManage.bookDescriptionOwner
                      : styles.bookManage.bookDescriptionReadOnly
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

              <div style={styles.bookManage.role}>
                {isOwner ? "Owner" : "Editor"}
              </div>
            </div>
          </div>

          <div style={commonStyles.buttonRow}>
            <Link
              href={`/books/${book.id}/preview`}
              style={styles.bookManage.previewButton}
            >
              Preview Book
            </Link>

            <button
              type="button"
              onClick={openPicker}
              style={styles.bookManage.primaryButton}
            >
              Add Recipes
            </button>
          </div>

          {recipesByCategory.length === 0 ? (
            <div style={styles.bookManage.emptyState}>
              <p>This book does not have any recipes yet.</p>

              <button
                type="button"
                onClick={openPicker}
                style={styles.bookManage.primaryButton}
              >
                Add Your First Recipe
              </button>
            </div>
          ) : (
            <div style={styles.bookManage.sections}>
              {recipesByCategory.map((section) => (
                <section
                  key={section.category}
                  style={styles.bookManage.section}
                >
                  <h2 style={styles.bookManage.sectionTitle}>
                    {section.category}
                  </h2>

                  <div style={styles.bookManage.recipeList}>
                    {section.recipes.map((bookRecipe) => (
                      <div
                        key={bookRecipe.recipe_id}
                        style={styles.bookManage.recipeRow}
                      >
                        <Link
                          href={`/recipes/${bookRecipe.recipe_id}`}
                          style={styles.bookManage.recipeLink}
                        >
                          <div style={styles.bookManage.recipeInfo}>
                            <h3 style={styles.bookManage.recipeTitle}>
                              {bookRecipe.recipe.title}
                            </h3>

                            <p style={styles.bookManage.recipeCategory}>
                              {bookRecipe.recipe.category ?? "Other"}
                            </p>
                          </div>

                          <img
                            src={
                              bookRecipe.recipe.image_url ||
                              "/images/default-food.jpg"
                            }
                            alt={bookRecipe.recipe.title}
                            style={styles.bookManage.recipeImage}
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveRecipe(bookRecipe.recipe_id)
                          }
                          style={styles.bookManage.removeButton}
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
            <section style={styles.bookManage.collaborators}>
              <h2 style={styles.bookManage.collaboratorsTitle}>
                Collaborators
              </h2>

              <div style={styles.bookManage.memberList}>
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    style={styles.bookManage.memberRow}
                  >
                    <div>
                      <strong>{member.email}</strong>
                      <span style={styles.bookManage.memberRole}>
                        {member.role}
                      </span>
                    </div>

                    {member.role === "editor" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEditor(member)}
                        style={
                          styles.bookManage.collaboratorRemoveButton
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pendingInvitations.length > 0 && (
                <div style={styles.bookManage.memberList}>
                  <h3 style={styles.bookManage.inviteTitle}>
                    Pending invitations
                  </h3>
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      style={styles.bookManage.memberRow}
                    >
                      <div>
                        <strong>{invitation.invited_email}</strong>
                        <span style={styles.bookManage.memberRole}>
                          Expires{" "}
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span style={styles.bookManage.memberRole}>
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.bookManage.inviteBox}>
                <h3 style={styles.bookManage.inviteTitle}>
                  Invite an editor
                </h3>

                <div style={styles.bookManage.inviteRow}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="Friend's account email"
                    style={styles.bookManage.input}
                  />

                  <button
                    type="button"
                    onClick={handleInvite}
                    style={styles.bookManage.primaryButton}
                  >
                    Invite
                  </button>
                </div>

                {inviteMessage && (
                  <p style={styles.bookManage.message}>{inviteMessage}</p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {isPickerOpen && (
        <div style={commonStyles.modalOverlay}>
          <div style={styles.largeModal}>
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
              <p style={styles.bookManage.error}>{pickerError}</p>
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
                      style={styles.bookManage.pickerRow}
                    >
                      <div style={styles.bookManage.pickerRecipeInfo}>
                        <img
                          src={recipe.image_url || "/images/default-food.jpg"}
                          alt={recipe.title}
                          style={styles.bookManage.pickerImage}
                        />

                        <div>
                          <strong>{recipe.title}</strong>

                          <div style={styles.bookManage.pickerCategory}>
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
                            ? styles.bookManage.addedButton
                            : styles.bookManage.addButton
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

const bookDescriptionStyle = {
  fontSize: designTokens.typography.body,
  lineHeight: designTokens.typography.lineHeightRelaxed,
};

const styles = {
  bookManage: {
    header: {
      marginTop: designTokens.spacing.px28,
    },
    titleInput: {
      width: "100%",
      maxWidth: "700px",
      boxSizing: "border-box",
      fontSize: designTokens.typography.headingMedium,
      fontWeight: designTokens.typography.weightBold,
      padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
      border: `1px solid ${designTokens.colors.lightGray}`,
      borderRadius: "8px",
      outline: "none",
    },
    description: {
      ...bookDescriptionStyle,
      color: designTokens.colors.gray,
      marginTop: designTokens.spacing.compact,
    },
    descriptionInput: {
      display: "block",
      width: "100%",
      maxWidth: "700px",
      minHeight: "90px",
      boxSizing: "border-box",
      ...bookDescriptionStyle,
      padding: designTokens.spacing.sm,
      border: `1px solid ${designTokens.colors.lightGray}`,
      borderRadius: "8px",
      resize: "vertical",
    },
    role: {
      display: "inline-block",
      marginTop: designTokens.spacing.md,
      padding: `5px ${designTokens.spacing.compact}`,
      borderRadius: "999px",
      background: designTokens.colors.veryLightGray,
      color: designTokens.colors.gray,
      fontSize: designTokens.typography.caption,
      fontWeight: designTokens.typography.weightSemibold,
    },
    previewButton: {
      display: "inline-block",
      padding: `${designTokens.spacing.compact} ${designTokens.spacing.lg}`,
      borderRadius: "8px",
      fontWeight: designTokens.typography.weightSemibold,
      background: designTokens.colors.black,
      color: designTokens.colors.white,
      textDecoration: "none",
    },
    primaryButton: {
      padding: `${designTokens.spacing.compact} ${designTokens.spacing.lg}`,
      borderRadius: "8px",
      fontWeight: designTokens.typography.weightSemibold,
      border: "none",
      background: designTokens.colors.black,
      color: designTokens.colors.white,
      cursor: "pointer",
    },
    emptyState: {
      marginTop: designTokens.spacing.section,
      padding: designTokens.spacing.wide,
      borderRadius: "12px",
      background: designTokens.colors.veryLightGray,
    },
    sections: {
      marginTop: designTokens.spacing.section,
    },
    section: {
      marginBottom: designTokens.spacing.sectionLarge,
    },
    sectionTitle: {
      fontSize: designTokens.typography.headingSmall,
      marginBottom: designTokens.spacing.lgPlus,
    },
    recipeList: {
      display: "flex",
      flexDirection: "column",
      gap: designTokens.spacing.md,
    },
    recipeRow: {
      display: "flex",
      alignItems: "center",
      gap: designTokens.spacing.md,
      padding: designTokens.spacing.md,
      border: `1px solid ${designTokens.colors.lightGray}`,
      borderRadius: "10px",
    },
    recipeLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: designTokens.spacing.roomy,
      flex: 1,
      textDecoration: "none",
      color: "inherit",
    },
    recipeInfo: {
      minWidth: 0,
    },
    recipeTitle: {
      margin: 0,
      fontSize: designTokens.typography.lead,
    },
    recipeCategory: {
      margin: `${designTokens.spacing.px5} 0 0`,
      color: designTokens.colors.gray,
      fontSize: designTokens.typography.caption,
    },
    recipeImage: {
      width: "90px",
      height: "70px",
      objectFit: "cover",
      flexShrink: 0,
      borderRadius: "8px",
    },
    removeButton: {
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      borderRadius: "8px",
      border: `1px solid ${designTokens.colors.lightGray}`,
      background: designTokens.colors.white,
      cursor: "pointer",
    },
    collaborators: {
      marginTop: designTokens.spacing.xxxl,
      paddingTop: designTokens.spacing.px35,
      borderTop: `1px solid ${designTokens.colors.lightGray}`,
    },
    collaboratorsTitle: {
      fontSize: designTokens.typography.headingSmall,
      marginBottom: designTokens.spacing.roomy,
    },
    memberList: {
      display: "flex",
      flexDirection: "column",
      gap: designTokens.spacing.compact,
    },
    memberRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: designTokens.spacing.roomy,
      padding: `${designTokens.spacing.md} 14px`,
      border: `1px solid ${designTokens.colors.lightGray}`,
      borderRadius: "8px",
    },
    memberRole: {
      marginLeft: designTokens.spacing.compact,
      color: designTokens.colors.gray,
      fontSize: designTokens.typography.caption,
    },
    inviteBox: {
      marginTop: designTokens.spacing.xxl,
    },
    inviteTitle: {
      fontSize: designTokens.typography.lead,
      marginBottom: designTokens.spacing.md,
    },
    inviteRow: {
      display: "flex",
      gap: designTokens.spacing.compact,
      flexWrap: "wrap",
    },
    input: {
      flex: 1,
      minWidth: "250px",
      padding: `${designTokens.spacing.compact} ${designTokens.spacing.md}`,
      borderRadius: "8px",
      border: `1px solid ${designTokens.colors.lightGray}`,
    },
    message: {
      marginTop: designTokens.spacing.compact,
      color: designTokens.colors.gray,
    },
    error: {
      marginTop: designTokens.spacing.roomy,
      color: designTokens.colors.red,
    },
    pickerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: designTokens.spacing.mdPlus,
      padding: designTokens.spacing.compact,
      border: `1px solid ${designTokens.colors.lightGray}`,
      borderRadius: "8px",
    },
    pickerRecipeInfo: {
      display: "flex",
      alignItems: "center",
      gap: designTokens.spacing.md,
      minWidth: 0,
    },
    pickerImage: {
      width: "60px",
      height: "50px",
      objectFit: "cover",
      flexShrink: 0,
      borderRadius: "8px",
    },
    pickerCategory: {
      marginTop: designTokens.spacing.xs,
      color: designTokens.colors.gray,
      fontSize: designTokens.typography.caption,
    },
    addButton: {
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      borderRadius: "8px",
      border: "none",
      background: designTokens.colors.black,
      color: designTokens.colors.white,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    addedButton: {
      padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
      borderRadius: "8px",
      border: `1px solid ${designTokens.colors.lightGray}`,
      background: designTokens.colors.veryLightGray,
      color: designTokens.colors.gray,
      cursor: "default",
      whiteSpace: "nowrap",
    },
    collaboratorRemoveButton: {
      padding: `6px ${designTokens.spacing.md}`,
      border: `1px solid ${designTokens.colors.lightGray}`,
      borderRadius: "6px",
      background: designTokens.colors.white,
      cursor: "pointer",
    },
    bookTitleOwner: {
      ...commonStyles.title,
      cursor: "text",
    },
    bookTitleReadOnly: {
      ...commonStyles.title,
      cursor: "default",
    },
    bookDescriptionOwner: {
      ...bookDescriptionStyle,
      color: designTokens.colors.gray,
      marginTop: designTokens.spacing.compact,
      cursor: "text",
    },
    bookDescriptionReadOnly: {
      ...bookDescriptionStyle,
      color: designTokens.colors.gray,
      marginTop: designTokens.spacing.compact,
      cursor: "default",
    },
  },
  largeModal: {
    width: "100%",
    maxWidth: "700px",
    padding: designTokens.spacing.xl,
    borderRadius: "10px",
    background: designTokens.colors.white,
    boxSizing: "border-box",
    maxHeight: "85vh",
    overflowY: "auto",
  },
} as const;
