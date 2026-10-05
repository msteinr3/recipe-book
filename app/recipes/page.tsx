"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { commonStyles } from "@/styles/common";
import { supabase } from "@/lib/supabase";

type Recipe = {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
};

type UserBook = {
  id: string;
  title: string;
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [addedBookIds, setAddedBookIds] = useState<Set<string>>(new Set());
  const [bookPickerLoading, setBookPickerLoading] = useState(false);
  const [bookPickerError, setBookPickerError] = useState("");
  const [addingToBookId, setAddingToBookId] = useState<string | null>(null);
  const [addSuccessMessage, setAddSuccessMessage] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, category, image_url")
        .order("title");

      if (error) {
        setErrorMessage(error.message);
      } else {
        setRecipes((data ?? []) as Recipe[]);
      }

      setLoading(false);
    };

    loadRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return true;
    }

    const title = recipe.title.toLowerCase();
    const category = recipe.category?.toLowerCase() ?? "";

    return title.includes(searchTerm) || category.includes(searchTerm);
  });

  const handleAddClick = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setBookPickerLoading(true);
    setBookPickerError("");
    setAddSuccessMessage("");
    setUserBooks([]);
    setAddedBookIds(new Set());

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setBookPickerError(
        "You need to log in before you can add recipes to a book.",
      );
      setBookPickerLoading(false);
      return;
    }

    const { data: memberData, error: memberError } = await supabase
      .from("book_members")
      .select("book_id")
      .eq("user_id", userData.user.id);

    if (memberError) {
      setBookPickerError(memberError.message);
      setBookPickerLoading(false);
      return;
    }

    if (!memberData || memberData.length === 0) {
      setBookPickerLoading(false);
      return;
    }

    const bookIds = memberData.map((member) => member.book_id);

    const [
      { data: bookData, error: bookError },
      { data: existingData, error: existingError },
    ] = await Promise.all([
      supabase
        .from("books")
        .select("id, title")
        .in("id", bookIds)
        .order("title"),

      supabase
        .from("book_recipes")
        .select("book_id")
        .eq("recipe_id", recipe.id)
        .in("book_id", bookIds),
    ]);

    if (bookError) {
      setBookPickerError(bookError.message);
      setBookPickerLoading(false);
      return;
    }

    if (existingError) {
      setBookPickerError(existingError.message);
      setBookPickerLoading(false);
      return;
    }

    setUserBooks((bookData ?? []) as UserBook[]);
    setAddedBookIds(new Set((existingData ?? []).map((item) => item.book_id)));
    setBookPickerLoading(false);
  };

  const handleAddToBook = async (book: UserBook) => {
    if (!selectedRecipe || addedBookIds.has(book.id)) {
      return;
    }

    setAddingToBookId(book.id);
    setBookPickerError("");
    setAddSuccessMessage("");

    const { data: lastRecipe, error: positionError } = await supabase
      .from("book_recipes")
      .select("position")
      .eq("book_id", book.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (positionError) {
      setBookPickerError(positionError.message);
      setAddingToBookId(null);
      return;
    }

    const nextPosition = lastRecipe ? lastRecipe.position + 1 : 0;

    const { error } = await supabase.from("book_recipes").insert({
      book_id: book.id,
      recipe_id: selectedRecipe.id,
      position: nextPosition,
    });

    if (error) {
      if (error.code === "23505") {
        setAddedBookIds((current) => {
          const updated = new Set(current);
          updated.add(book.id);
          return updated;
        });

        setBookPickerError(
          `"${selectedRecipe.title}" is already in "${book.title}".`,
        );
      } else {
        setBookPickerError(error.message);
      }

      setAddingToBookId(null);
      return;
    }

    setAddedBookIds((current) => {
      const updated = new Set(current);
      updated.add(book.id);
      return updated;
    });

    setAddSuccessMessage(`Added "${selectedRecipe.title}" to "${book.title}".`);

    setAddingToBookId(null);
  };

  const closeBookPicker = () => {
    setSelectedRecipe(null);
    setUserBooks([]);
    setAddedBookIds(new Set());
    setBookPickerError("");
    setAddSuccessMessage("");
    setBookPickerLoading(false);
    setAddingToBookId(null);
  };

  return (
    <>
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <div style={styles.header}>
            <div>
              <h1 style={commonStyles.title}>Recipes</h1>

              <p style={commonStyles.subtitle}>
                Browse the recipes in our collection.
              </p>
            </div>

            <Link
              href="/submit"
              style={{
                ...commonStyles.button,
                whiteSpace: "nowrap",
              }}
            >
              Add New Recipe
            </Link>
          </div>

          <input
            type="search"
            placeholder="Search by recipe name or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={styles.search}
          />

          {loading && <p>Loading recipes...</p>}

          {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

          {!loading && !errorMessage && recipes.length === 0 && (
            <div style={styles.empty}>
              <h2>No recipes yet</h2>

              <p>Be the first to add a recipe to the collection.</p>

              <Link href="/submit" style={commonStyles.button}>
                Add New Recipe
              </Link>
            </div>
          )}

          {!loading &&
            !errorMessage &&
            recipes.length > 0 &&
            filteredRecipes.length === 0 && (
              <div style={styles.empty}>
                <h2>No recipes found</h2>

                <p>Try a different recipe name or category.</p>
              </div>
            )}

          {!loading && !errorMessage && filteredRecipes.length > 0 && (
            <div style={styles.list}>
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} style={styles.row}>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    style={styles.recipeLink}
                  >
                    <div style={styles.recipeInfo}>
                      <h2 style={styles.recipeTitle}>{recipe.title}</h2>

                      {recipe.category && (
                        <p style={styles.category}>{recipe.category}</p>
                      )}
                    </div>

                    <img
                      src={recipe.image_url || "/images/default-food.jpg"}
                      alt={recipe.title}
                      style={styles.thumbnail}
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleAddClick(recipe)}
                    style={styles.addButton}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedRecipe && (
        <div style={styles.overlay} onClick={closeBookPicker}>
          <div
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Add to a Book</h2>

                <p style={styles.modalSubtitle}>{selectedRecipe.title}</p>
              </div>

              <button
                type="button"
                onClick={closeBookPicker}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>

            {bookPickerLoading && <p>Loading your books...</p>}

            {bookPickerError && (
              <p style={commonStyles.error}>{bookPickerError}</p>
            )}

            {addSuccessMessage && (
              <p style={commonStyles.success}>{addSuccessMessage}</p>
            )}

            {!bookPickerLoading &&
              !bookPickerError &&
              userBooks.length === 0 && (
                <div style={styles.noBooks}>
                  <p>You don't have any recipe books yet.</p>

                  <Link
                    href="/profile"
                    style={commonStyles.button}
                    onClick={closeBookPicker}
                  >
                    Create a Book
                  </Link>
                </div>
              )}

            {!bookPickerLoading && userBooks.length > 0 && (
              <div style={styles.bookList}>
                {userBooks.map((book) => {
                  const alreadyAdded = addedBookIds.has(book.id);

                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => handleAddToBook(book)}
                      disabled={alreadyAdded || addingToBookId !== null}
                      style={{
                        ...styles.bookButton,
                        ...(alreadyAdded ? styles.bookButtonAdded : {}),
                      }}
                    >
                      <span>{book.title}</span>

                      <span
                        style={{
                          ...styles.bookArrow,
                          ...(alreadyAdded ? styles.addedText : {}),
                        }}
                      >
                        {alreadyAdded
                          ? "✓ Added"
                          : addingToBookId === book.id
                            ? "Adding..."
                            : "+ Add"}
                      </span>
                    </button>
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "24px",
  },

  search: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "12px 14px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },

  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },

  row: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 14px",
    borderRadius: "6px",
    background: "#f7f3ed",
  },

  recipeLink: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
    minWidth: 0,
    textDecoration: "none",
    color: "inherit",
  },

  recipeInfo: {
    flex: 1,
    minWidth: 0,
  },

  recipeTitle: {
    margin: 0,
    fontSize: "19px",
  },

  category: {
    margin: "4px 0 0",
    color: "#666",
    fontSize: "14px",
  },

  thumbnail: {
    width: "70px",
    height: "52px",
    objectFit: "contain" as const,
    borderRadius: "4px",
    background: "#fff",
    flexShrink: 0,
  },

  addButton: {
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    background: "#fff",
    color: "#222",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },

  empty: {
    padding: "60px 20px",
    textAlign: "center" as const,
    border: "1px solid #ddd",
    borderRadius: "12px",
  },

  overlay: {
    position: "fixed" as const,
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "rgba(0, 0, 0, 0.45)",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "500px",
    padding: "24px",
    borderRadius: "10px",
    background: "white",
    boxSizing: "border-box" as const,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "24px",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#666",
  },

  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    lineHeight: 1,
    cursor: "pointer",
    color: "#666",
  },

  bookList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  bookButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#f7f3ed",
    cursor: "pointer",
    textAlign: "left" as const,
    fontSize: "16px",
  },

  bookButtonAdded: {
    background: "#eee",
    cursor: "default",
  },

  bookArrow: {
    color: "#666",
    fontSize: "14px",
  },

  addedText: {
    color: "#333",
    fontWeight: "600",
  },

  noBooks: {
    textAlign: "center" as const,
    padding: "20px 0",
  },
};
