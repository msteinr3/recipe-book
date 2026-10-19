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

    if (!searchTerm) return true;

    return (
      recipe.title.toLowerCase().includes(searchTerm) ||
      (recipe.category?.toLowerCase() ?? "").includes(searchTerm)
    );
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
    if (!selectedRecipe || addedBookIds.has(book.id)) return;

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
        setAddedBookIds((current) => new Set(current).add(book.id));
        setBookPickerError(
          `"${selectedRecipe.title}" is already in "${book.title}".`,
        );
      } else {
        setBookPickerError(error.message);
      }

      setAddingToBookId(null);
      return;
    }

    setAddedBookIds((current) => new Set(current).add(book.id));
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
          <div style={commonStyles.sectionHeader}>
            <div>
              <h1 style={commonStyles.title}>Recipes</h1>
              <p style={commonStyles.subtitle}>
                Browse the recipes in our collection.
              </p>
            </div>

            <Link href="/submit" style={commonStyles.button}>
              Add New Recipe
            </Link>
          </div>

          <input
            type="search"
            placeholder="Search by recipe name or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={commonStyles.searchInput}
          />

          {loading && <p>Loading recipes...</p>}

          {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

          {!loading && !errorMessage && recipes.length === 0 && (
            <div style={commonStyles.emptyState}>
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
              <div style={commonStyles.emptyState}>
                <h2>No recipes found</h2>
                <p>Try a different recipe name or category.</p>
              </div>
            )}

          {!loading && !errorMessage && filteredRecipes.length > 0 && (
            <div style={commonStyles.verticalList}>
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} style={commonStyles.listRow}>
                  <Link
                    href={`/recipes/${recipe.id}`}
                    style={commonStyles.horizontalLink}
                  >
                    <div style={commonStyles.flexFill}>
                      <h2 style={commonStyles.cardTitle}>{recipe.title}</h2>
                      {recipe.category && (
                        <p style={commonStyles.category}>{recipe.category}</p>
                      )}
                    </div>

                    <img
                      src={recipe.image_url || "/images/default-food.jpg"}
                      alt={recipe.title}
                      style={commonStyles.thumbnail}
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleAddClick(recipe)}
                    style={commonStyles.secondaryButton}
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
        <div style={commonStyles.modalOverlay} onClick={closeBookPicker}>
          <div
            style={commonStyles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={commonStyles.modalHeader}>
              <div>
                <h2 style={commonStyles.cardTitle}>Add to a Book</h2>
                <p style={commonStyles.subtitle}>{selectedRecipe.title}</p>
              </div>

              <button
                type="button"
                onClick={closeBookPicker}
                style={commonStyles.modalCloseButton}
                aria-label="Close"
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
                <div style={commonStyles.emptyState}>
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
              <div style={commonStyles.verticalList}>
                {userBooks.map((book) => {
                  const alreadyAdded = addedBookIds.has(book.id);

                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => handleAddToBook(book)}
                      disabled={alreadyAdded || addingToBookId !== null}
                      style={{
                        ...commonStyles.pickerButton,
                        ...(alreadyAdded ? commonStyles.pickerButtonAdded : {}),
                      }}
                    >
                      <span>{book.title}</span>
                      <span
                        style={{
                          ...commonStyles.mutedSmallText,
                          ...(alreadyAdded ? commonStyles.addedText : {}),
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
