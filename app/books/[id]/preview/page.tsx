"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BookPdfButton from "@/components/BookPdfButton";

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
  description: string | null;
  ingredients: any;
  instructions: any;
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  category: string | null;
  tags: string[] | null;
  source: string | null;
  notes: string | null;
  image_url: string | null;
};

type BookRecipe = {
  recipe_id: string;
  recipe: Recipe;
};

export default function BookPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [bookRecipes, setBookRecipes] = useState<BookRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
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
              recipe_id,
              recipe:recipes (
                id,
                title,
                description,
                ingredients,
                instructions,
                prep_minutes,
                cook_minutes,
                servings,
                category,
                tags,
                source,
                notes,
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

      const normalizedRecipes: BookRecipe[] = (bookRecipesData ?? [])
        .filter((item: any) => item.recipe)
        .map((item: any) => ({
          recipe_id: item.recipe_id,
          recipe: item.recipe,
        }));

      setBookRecipes(normalizedRecipes);
      setLoading(false);
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [params]);

  function normalizeList(value: any): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const quantity = item.quantity ?? "";
          const unit = item.unit ?? "";
          const ingredient = item.item ?? "";

          return `${quantity} ${unit} ${ingredient}`.trim();
        }

        return String(item);
      });
    }

    if (typeof value === "string") {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.messagePage}>
          <p>Loading book...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !book || !bookId) {
    return (
      <main style={styles.page}>
        <div style={styles.messagePage}>
          <Link href="/profile" style={styles.backLink}>
            ← Back to Profile
          </Link>

          <h1 style={{ marginTop: "30px" }}>Unable to open book</h1>

          <p style={{ marginTop: "12px" }}>
            {errorMessage || "This book could not be loaded."}
          </p>
        </div>
      </main>
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

  return (
    <main style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.topBarContent}>
          <Link href={`/books/${bookId}`} style={styles.backLink}>
            ← Back to Book
          </Link>

          <BookPdfButton
            book={book}
            sections={recipesByCategory.map((section) => ({
              category: section.category,
              recipes: section.recipes.map((bookRecipe) => ({
                ...bookRecipe.recipe,
                ingredients: normalizeList(bookRecipe.recipe.ingredients),
                instructions: normalizeList(bookRecipe.recipe.instructions),
              })),
            }))}
          />
        </div>
      </div>
      <div style={styles.book}>
        {/* COVER */}
        <section style={styles.cover}>
          <div>
            <p style={styles.coverLabel}>RECIPE BOOK</p>

            <h1 style={styles.coverTitle}>{book.title}</h1>

            {book.description && (
              <p style={styles.coverDescription}>{book.description}</p>
            )}

            <p style={styles.coverRecipeCount}>
              {bookRecipes.length}{" "}
              {bookRecipes.length === 1 ? "recipe" : "recipes"}
            </p>
          </div>
        </section>

        {/* TABLE OF CONTENTS */}
        <section style={styles.pageSection}>
          <h2 style={styles.pageTitle}>Table of Contents</h2>

          {recipesByCategory.length === 0 ? (
            <p>This book does not have any recipes yet.</p>
          ) : (
            <div style={styles.toc}>
              {recipesByCategory.map((section) => (
                <div key={section.category} style={styles.tocSection}>
                  <a
                    href={`#section-${section.category
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                    style={styles.tocSectionLink}
                  >
                    {section.category}
                  </a>

                  <div style={styles.tocRecipes}>
                    {section.recipes.map((bookRecipe) => (
                      <a
                        key={bookRecipe.recipe_id}
                        href={`#recipe-${bookRecipe.recipe_id}`}
                        style={styles.tocRecipeLink}
                      >
                        {bookRecipe.recipe.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTIONS */}
        {recipesByCategory.map((section) => {
          const sectionId = `section-${section.category
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`;

          return (
            <div key={section.category}>
              {/* SECTION DIVIDER */}
              <section id={sectionId} style={styles.sectionDivider}>
                <div>
                  <p style={styles.sectionLabel}>SECTION</p>

                  <h2 style={styles.sectionTitle}>{section.category}</h2>

                  <p style={styles.sectionCount}>
                    {section.recipes.length}{" "}
                    {section.recipes.length === 1 ? "recipe" : "recipes"}
                  </p>
                </div>
              </section>

              {/* RECIPES */}
              {section.recipes.map((bookRecipe) => {
                const recipe = bookRecipe.recipe;

                const ingredients = normalizeList(recipe.ingredients);

                const instructions = normalizeList(recipe.instructions);

                return (
                  <section
                    key={recipe.id}
                    id={`recipe-${recipe.id}`}
                    style={styles.recipePage}
                  >
                    <div style={styles.recipeHeader}>
                      <div style={{ flex: 1 }}>
                        <p style={styles.recipeCategory}>
                          {recipe.category ?? "Other"}
                        </p>

                        <h2 style={styles.recipeTitle}>{recipe.title}</h2>
                      </div>

                      <img
                        src={recipe.image_url || "/images/default-food.jpg"}
                        alt={recipe.title}
                        style={styles.recipeImage}
                      />
                    </div>

                    {recipe.description && (
                      <p style={styles.recipeDescription}>
                        {recipe.description}
                      </p>
                    )}

                    <div style={styles.meta}>
                      {recipe.prep_minutes !== null && (
                        <span>Prep: {recipe.prep_minutes} min</span>
                      )}

                      {recipe.cook_minutes !== null && (
                        <span>Cook: {recipe.cook_minutes} min</span>
                      )}

                      {recipe.servings !== null && (
                        <span>Serves: {recipe.servings}</span>
                      )}
                    </div>

                    {ingredients.length > 0 && (
                      <div style={styles.recipeSection}>
                        <h3 style={styles.recipeSectionTitle}>Ingredients</h3>

                        <ul style={styles.ingredientList}>
                          {ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {instructions.length > 0 && (
                      <div style={styles.recipeSection}>
                        <h3 style={styles.recipeSectionTitle}>Instructions</h3>

                        <ol style={styles.instructionList}>
                          {instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {recipe.tags && recipe.tags.length > 0 && (
                      <div style={styles.recipeSection}>
                        <h3 style={styles.recipeSectionTitle}>Tags</h3>

                        <div style={styles.tags}>
                          {recipe.tags.map((tag) => (
                            <span key={tag} style={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {recipe.source && (
                      <div style={styles.recipeSection}>
                        <h3 style={styles.recipeSectionTitle}>Source</h3>

                        <p>{recipe.source}</p>
                      </div>
                    )}

                    {recipe.notes && (
                      <div style={styles.recipeSection}>
                        <h3 style={styles.recipeSectionTitle}>Notes</h3>

                        <p>{recipe.notes}</p>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          );
        })}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f3f3",
    paddingBottom: "60px",
  },

  messagePage: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px",
  },

  topBar: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px 20px",
  },

  topBarContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    flexWrap: "wrap" as const,
  },

  backLink: {
    color: "#333",
    textDecoration: "none",
  },

  book: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    background: "#fff",
  },

  cover: {
    minHeight: "650px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    padding: "60px 40px",
    borderBottom: "1px solid #ddd",
  },

  coverLabel: {
    fontSize: "14px",
    letterSpacing: "4px",
    color: "#777",
    marginBottom: "24px",
  },

  coverTitle: {
    fontSize: "52px",
    lineHeight: 1.1,
    margin: 0,
  },

  coverDescription: {
    maxWidth: "600px",
    margin: "30px auto 0",
    fontSize: "18px",
    lineHeight: 1.7,
    color: "#666",
  },

  coverRecipeCount: {
    marginTop: "40px",
    color: "#777",
  },

  pageSection: {
    minHeight: "650px",
    padding: "70px",
    borderBottom: "1px solid #ddd",
  },

  pageTitle: {
    fontSize: "36px",
    marginBottom: "40px",
  },

  toc: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "28px",
  },

  tocSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  tocSectionLink: {
    fontSize: "21px",
    fontWeight: "700",
    color: "#222",
    textDecoration: "none",
  },

  tocRecipes: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
    paddingLeft: "18px",
  },

  tocRecipeLink: {
    color: "#666",
    textDecoration: "none",
  },

  sectionDivider: {
    minHeight: "500px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    padding: "60px 40px",
    background: "#fafafa",
    borderBottom: "1px solid #ddd",
    scrollMarginTop: "20px",
    pageBreakBefore: "always" as const,
  },

  sectionLabel: {
    fontSize: "14px",
    letterSpacing: "4px",
    color: "#777",
    marginBottom: "18px",
  },

  sectionTitle: {
    fontSize: "48px",
    margin: 0,
  },

  sectionCount: {
    marginTop: "20px",
    color: "#777",
  },

  recipePage: {
    minHeight: "650px",
    padding: "60px 70px",
    borderBottom: "1px solid #ddd",
    scrollMarginTop: "20px",
    pageBreakBefore: "always" as const,
  },

  recipeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "30px",
  },

  recipeCategory: {
    margin: 0,
    color: "#777",
    fontSize: "14px",
  },

  recipeTitle: {
    fontSize: "38px",
    lineHeight: 1.15,
    marginTop: "10px",
  },

  recipeImage: {
    width: "220px",
    height: "160px",
    objectFit: "cover" as const,
    borderRadius: "10px",
    flexShrink: 0,
  },

  recipeDescription: {
    fontSize: "18px",
    lineHeight: 1.7,
    color: "#555",
    marginTop: "25px",
  },

  meta: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "18px",
    marginTop: "22px",
    color: "#666",
  },

  recipeSection: {
    marginTop: "38px",
  },

  recipeSectionTitle: {
    fontSize: "22px",
    marginBottom: "14px",
  },

  ingredientList: {
    lineHeight: 1.8,
    paddingLeft: "24px",
  },

  instructionList: {
    lineHeight: 1.9,
    paddingLeft: "24px",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
  },

  tag: {
    background: "#f0f0f0",
    borderRadius: "999px",
    padding: "5px 10px",
  },
};
