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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [pickerLoading, setPickerLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [pickerError, setPickerError] = useState("");

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setErrorMessage("");

      const resolvedParams = await params;
      const id = resolvedParams.id;

      if (cancelled) return;

      setBookId(id);

      // Get the current logged-in user.
      // getSession() handles the browser's existing Supabase session.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let user = session?.user ?? null;

      // Fallback to getUser() if the session was not immediately available.
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

      setBook(bookData as Book);

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

      const normalizedBookRecipes: BookRecipe[] = (bookRecipesData ?? [])
        .filter((item: any) => item.recipe)
        .map((item: any) => ({
          book_id: item.book_id,
          recipe_id: item.recipe_id,
          position: item.position,
          recipe: item.recipe,
        }));

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

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [params]);

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

          <h1 style={{ marginTop: "30px" }}>Book not found</h1>

          <p style={{ marginTop: "12px" }}>
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

          <div style={styles.header}>
            <div>
              <h1 style={commonStyles.title}>{book.title}</h1>

              {book.description && (
                <p style={styles.description}>{book.description}</p>
              )}

              <div style={styles.role}>{isOwner ? "Owner" : "Editor"}</div>
            </div>
          </div>

          <div style={styles.actions}>
            <Link
              href={`/books/${book.id}/preview`}
              style={styles.previewButton}
            >
              Preview Book
            </Link>

            <button
              type="button"
              onClick={openPicker}
              style={styles.primaryButton}
            >
              Add Recipes
            </button>
          </div>

          {recipesByCategory.length === 0 ? (
            <div style={styles.emptyState}>
              <p>This book does not have any recipes yet.</p>

              <button
                type="button"
                onClick={openPicker}
                style={styles.primaryButton}
              >
                Add Your First Recipe
              </button>
            </div>
          ) : (
            <div style={styles.sections}>
              {recipesByCategory.map((section) => (
                <section key={section.category} style={styles.section}>
                  <h2 style={styles.sectionTitle}>{section.category}</h2>

                  <div style={styles.recipeList}>
                    {section.recipes.map((bookRecipe) => (
                      <div key={bookRecipe.recipe_id} style={styles.recipeRow}>
                        <Link
                          href={`/recipes/${bookRecipe.recipe_id}`}
                          style={styles.recipeLink}
                        >
                          <div style={styles.recipeInfo}>
                            <h3 style={styles.recipeTitle}>
                              {bookRecipe.recipe.title}
                            </h3>

                            <p style={styles.recipeCategory}>
                              {bookRecipe.recipe.category ?? "Other"}
                            </p>
                          </div>

                          <img
                            src={
                              bookRecipe.recipe.image_url ||
                              "/images/default-food.jpg"
                            }
                            alt={bookRecipe.recipe.title}
                            style={styles.recipeImage}
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveRecipe(bookRecipe.recipe_id)
                          }
                          style={styles.removeButton}
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
            <section style={styles.collaborators}>
              <h2 style={styles.collaboratorsTitle}>Collaborators</h2>

              <div style={styles.memberList}>
                {members.map((member) => (
                  <div key={member.user_id} style={styles.memberRow}>
                    <div>
                      <strong>{member.email}</strong>
                      <span style={styles.memberRole}>{member.role}</span>
                    </div>

                    {member.role === "editor" && (
                      <span style={styles.editorLabel}>Editor</span>
                    )}
                  </div>
                ))}
              </div>

              <div style={styles.inviteBox}>
                <h3 style={styles.inviteTitle}>Invite an editor</h3>

                <div style={styles.inviteRow}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="Friend's account email"
                    style={styles.input}
                  />

                  <button
                    type="button"
                    onClick={handleInvite}
                    style={styles.primaryButton}
                  >
                    Invite
                  </button>
                </div>

                {inviteMessage && <p style={styles.message}>{inviteMessage}</p>}
              </div>
            </section>
          )}
        </div>
      </main>

      {isPickerOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add Recipes</h2>

              <button
                type="button"
                onClick={closePicker}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search recipes..."
              style={styles.searchInput}
            />

            {pickerError && <p style={styles.error}>{pickerError}</p>}

            {pickerLoading ? (
              <p>Loading recipes...</p>
            ) : filteredRecipes.length === 0 ? (
              <p>No recipes found.</p>
            ) : (
              <div style={styles.pickerList}>
                {filteredRecipes.map((recipe) => {
                  const alreadyAdded = bookRecipes.some(
                    (bookRecipe) => bookRecipe.recipe_id === recipe.id,
                  );

                  return (
                    <div key={recipe.id} style={styles.pickerRow}>
                      <div style={styles.pickerRecipeInfo}>
                        <img
                          src={recipe.image_url || "/images/default-food.jpg"}
                          alt={recipe.title}
                          style={styles.pickerImage}
                        />

                        <div>
                          <strong>{recipe.title}</strong>
                          <div style={styles.pickerCategory}>
                            {recipe.category ?? "Other"}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRecipe(recipe.id)}
                        disabled={alreadyAdded}
                        style={
                          alreadyAdded ? styles.addedButton : styles.addButton
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

const styles = {
  header: {
    marginTop: "28px",
  },

  description: {
    fontSize: "17px",
    lineHeight: 1.6,
    color: "#666",
    marginTop: "10px",
  },

  role: {
    display: "inline-block",
    marginTop: "12px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#f0f0f0",
    color: "#555",
    fontSize: "14px",
    fontWeight: "600",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "12px",
    marginTop: "28px",
  },

  previewButton: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "8px",
    background: "#222",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
  },

  primaryButton: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    marginTop: "20px",
    color: "#b00020",
  },

  emptyState: {
    marginTop: "40px",
    padding: "30px",
    borderRadius: "12px",
    background: "#f7f7f7",
  },

  sections: {
    marginTop: "40px",
  },

  section: {
    marginBottom: "50px",
  },

  sectionTitle: {
    fontSize: "28px",
    marginBottom: "18px",
  },

  recipeList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },

  recipeRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  recipeLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flex: 1,
    textDecoration: "none",
    color: "inherit",
  },

  recipeInfo: {
    minWidth: 0,
  },

  recipeTitle: {
    margin: 0,
    fontSize: "19px",
  },

  recipeCategory: {
    margin: "5px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  recipeImage: {
    width: "90px",
    height: "70px",
    objectFit: "cover" as const,
    borderRadius: "8px",
    flexShrink: 0,
  },

  removeButton: {
    padding: "8px 12px",
    borderRadius: "7px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },

  collaborators: {
    marginTop: "60px",
    paddingTop: "35px",
    borderTop: "1px solid #ddd",
  },

  collaboratorsTitle: {
    fontSize: "26px",
    marginBottom: "20px",
  },

  memberList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },

  memberRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "12px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  memberRole: {
    marginLeft: "10px",
    color: "#777",
    fontSize: "14px",
  },

  editorLabel: {
    color: "#666",
    fontSize: "14px",
  },

  inviteBox: {
    marginTop: "28px",
  },

  inviteTitle: {
    fontSize: "20px",
    marginBottom: "12px",
  },

  inviteRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
  },

  input: {
    flex: 1,
    minWidth: "250px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  message: {
    marginTop: "10px",
    color: "#555",
  },

  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "700px",
    maxHeight: "85vh",
    overflowY: "auto" as const,
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  modalTitle: {
    margin: 0,
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    lineHeight: 1,
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "18px",
  },

  pickerList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },

  pickerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "9px",
  },

  pickerRecipeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  pickerImage: {
    width: "60px",
    height: "50px",
    objectFit: "cover" as const,
    borderRadius: "7px",
    flexShrink: 0,
  },

  pickerCategory: {
    marginTop: "4px",
    color: "#777",
    fontSize: "13px",
  },

  addButton: {
    padding: "8px 12px",
    borderRadius: "7px",
    border: "none",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },

  addedButton: {
    padding: "8px 12px",
    borderRadius: "7px",
    border: "1px solid #ccc",
    background: "#f3f3f3",
    color: "#777",
    cursor: "default",
    whiteSpace: "nowrap" as const,
  },
};
