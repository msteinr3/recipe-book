"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BookPdfButton from "@/components/shared/BookPdfButton";
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
  description: string | null;
  ingredients: unknown;
  instructions: unknown;
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

type BookRecipeResult = {
  recipe_id: string;
  recipe: Recipe | Recipe[] | null;
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

      const recipeRows = (bookRecipesData ?? []) as BookRecipeResult[];
      const normalizedRecipes: BookRecipe[] = recipeRows
        .flatMap((item) => {
          const recipe = Array.isArray(item.recipe)
            ? item.recipe[0]
            : item.recipe;

          return recipe ? [{ recipe_id: item.recipe_id, recipe }] : [];
        });

      setBookRecipes(normalizedRecipes);
      setLoading(false);
    }

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [params]);

  function normalizeList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const ingredientData = item as Record<string, unknown>;
          const quantity = String(ingredientData.quantity ?? "");
          const unit = String(ingredientData.unit ?? "");
          const ingredient = String(ingredientData.item ?? "");

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
      <main style={styles.bookPreview.page}>
        <div style={styles.bookPreview.messagePage}>
          <p>Loading book...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !book || !bookId) {
    return (
      <main style={styles.bookPreview.page}>
        <div style={styles.bookPreview.messagePage}>
          <Link href="/profile" style={styles.bookPreview.backLink}>
            ← Back to Profile
          </Link>

          <h1 style={commonStyles.messageTitle}>Unable to open book</h1>

          <p style={commonStyles.messageText}>
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
    <main style={styles.bookPreview.page}>
      <div style={styles.bookPreview.topBar}>
        <div style={styles.bookPreview.topBarContent}>
          <Link
            href={`/books/${bookId}`}
            style={styles.bookPreview.backLink}
          >
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
      <div style={styles.bookPreview.book}>
        {/* COVER */}
        <section style={styles.bookPreview.cover}>
          <div>
            <p style={styles.bookPreview.coverLabel}>RECIPE BOOK</p>

            <h1 style={styles.bookPreview.coverTitle}>{book.title}</h1>

            {book.description && (
              <p style={styles.bookPreview.coverDescription}>
                {book.description}
              </p>
            )}

            <p style={styles.bookPreview.coverRecipeCount}>
              {bookRecipes.length}{" "}
              {bookRecipes.length === 1 ? "recipe" : "recipes"}
            </p>
          </div>
        </section>

        {/* TABLE OF CONTENTS */}
        <section style={styles.bookPreview.pageSection}>
          <h2 style={styles.bookPreview.pageTitle}>
            Table of Contents
          </h2>

          {recipesByCategory.length === 0 ? (
            <p>This book does not have any recipes yet.</p>
          ) : (
            <div style={styles.bookPreview.toc}>
              {recipesByCategory.map((section) => (
                <div
                  key={section.category}
                  style={styles.bookPreview.tocSection}
                >
                  <a
                    href={`#section-${section.category
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                    style={styles.bookPreview.tocSectionLink}
                  >
                    {section.category}
                  </a>

                  <div style={styles.bookPreview.tocRecipes}>
                    {section.recipes.map((bookRecipe) => (
                      <a
                        key={bookRecipe.recipe_id}
                        href={`#recipe-${bookRecipe.recipe_id}`}
                        style={styles.bookPreview.tocRecipeLink}
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
              <section
                id={sectionId}
                style={styles.bookPreview.sectionDivider}
              >
                <div>
                  <p style={styles.bookPreview.sectionLabel}>SECTION</p>

                  <h2 style={styles.bookPreview.sectionTitle}>
                    {section.category}
                  </h2>

                  <p style={styles.bookPreview.sectionCount}>
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
                    style={styles.bookPreview.recipePage}
                  >
                    <div style={styles.bookPreview.recipeHeader}>
                      <div
                        style={styles.bookPreview.recipeHeaderInfo}
                      >
                        <p style={styles.bookPreview.recipeCategory}>
                          {recipe.category ?? "Other"}
                        </p>

                        <h2 style={styles.bookPreview.recipeTitle}>
                          {recipe.title}
                        </h2>
                      </div>

                      <img
                        src={recipe.image_url || "/images/default-food.jpg"}
                        alt={recipe.title}
                        style={styles.bookPreview.recipeImage}
                      />
                    </div>

                    {recipe.description && (
                      <p style={styles.bookPreview.recipeDescription}>
                        {recipe.description}
                      </p>
                    )}

                    <div style={styles.bookPreview.meta}>
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
                      <div style={styles.bookPreview.recipeSection}>
                        <h3 style={styles.bookPreview.recipeSectionTitle}>
                          Ingredients
                        </h3>

                        <ul style={styles.bookPreview.ingredientList}>
                          {ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {instructions.length > 0 && (
                      <div style={styles.bookPreview.recipeSection}>
                        <h3 style={styles.bookPreview.recipeSectionTitle}>
                          Instructions
                        </h3>

                        <ol style={styles.bookPreview.instructionList}>
                          {instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {recipe.tags && recipe.tags.length > 0 && (
                      <div style={styles.bookPreview.recipeSection}>
                        <h3 style={styles.bookPreview.recipeSectionTitle}>
                          Tags
                        </h3>

                        <div style={styles.bookPreview.tags}>
                          {recipe.tags.map((tag) => (
                            <span
                              key={tag}
                              style={styles.bookPreview.tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {recipe.source && (
                      <div style={styles.bookPreview.recipeSection}>
                        <h3 style={styles.bookPreview.recipeSectionTitle}>
                          Source
                        </h3>

                        <p>{recipe.source}</p>
                      </div>
                    )}

                    {recipe.notes && (
                      <div style={styles.bookPreview.recipeSection}>
                        <h3 style={styles.bookPreview.recipeSectionTitle}>
                          Notes
                        </h3>

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

const columnBase = {
  display: "flex",
  flexDirection: "column" as const,
};

const bookPageBase = {
  minHeight: designTokens.sizes.l,
  borderBottom: `1px solid ${designTokens.colors.border.default}`,
};

const centeredBookSectionBase = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
  padding: `${designTokens.spacing.xl} ${designTokens.spacing.l}`,
};

const centeredBookContentBase = {
  maxWidth: designTokens.sizes.xl,
  margin: "0 auto",
};

const styles = {
  bookPreview: {
    page: {
      minHeight: "100vh",
      background: designTokens.colors.surface.subtle,
      paddingBottom: designTokens.spacing.xl,
    },
    messagePage: {
      ...centeredBookContentBase,
      padding: `${designTokens.spacing.l} ${designTokens.spacing.m}`,
    },
    topBar: {
      ...centeredBookContentBase,
      padding: `${designTokens.spacing.l} ${designTokens.spacing.m}`,
    },
    topBarContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: designTokens.spacing.m,
      flexWrap: "wrap",
    },
    backLink: {
      color: designTokens.colors.text.primary,
      textDecoration: "none",
    },
    book: {
      width: "100%",
      ...centeredBookContentBase,
      background: designTokens.colors.surface.content,
    },
    cover: {
      ...bookPageBase,
      ...centeredBookSectionBase,
    },
    coverLabel: {
      fontSize: designTokens.typography.fontSize.xs,
      letterSpacing: designTokens.spacing.xs,
      color: designTokens.colors.text.secondary,
      marginBottom: designTokens.spacing.l,
    },
    coverTitle: {
      fontSize: designTokens.typography.fontSize.xl,
      lineHeight: designTokens.typography.lineHeightTitle,
      margin: 0,
    },
    coverDescription: {
      maxWidth: designTokens.sizes.l,
      margin: `${designTokens.spacing.l} auto 0`,
      ...commonStyles.bodyDescription,
      color: designTokens.colors.text.secondary,
    },
    coverRecipeCount: {
      marginTop: designTokens.spacing.l,
      color: designTokens.colors.text.secondary,
    },
    pageSection: {
      ...bookPageBase,
      padding: designTokens.spacing.xl,
    },
    pageTitle: {
      fontSize: designTokens.typography.fontSize.l,
      marginBottom: designTokens.spacing.l,
    },
    toc: {
      ...columnBase,
      gap: designTokens.spacing.l,
    },
    tocSection: {
      ...columnBase,
      gap: designTokens.spacing.s,
    },
    tocSectionLink: {
      fontSize: designTokens.typography.fontSize.m,
      fontWeight: designTokens.typography.weightBold,
      color: designTokens.colors.text.primary,
      textDecoration: "none",
    },
    tocRecipes: {
      ...columnBase,
      gap: designTokens.spacing.xs,
      paddingLeft: designTokens.spacing.m,
    },
    tocRecipeLink: {
      color: designTokens.colors.text.secondary,
      textDecoration: "none",
    },
    sectionDivider: {
      minHeight: designTokens.sizes.l,
      ...centeredBookSectionBase,
      background: designTokens.colors.surface.subtle,
      borderBottom: `1px solid ${designTokens.colors.border.default}`,
      scrollMarginTop: designTokens.spacing.m,
      pageBreakBefore: "always",
    },
    sectionLabel: {
      fontSize: designTokens.typography.fontSize.xs,
      letterSpacing: designTokens.spacing.xs,
      color: designTokens.colors.text.secondary,
      marginBottom: designTokens.spacing.m,
    },
    sectionTitle: {
      fontSize: designTokens.typography.fontSize.l,
      margin: 0,
    },
    sectionCount: {
      marginTop: designTokens.spacing.m,
      color: designTokens.colors.text.secondary,
    },
    recipePage: {
      ...bookPageBase,
      padding: `${designTokens.spacing.xl} ${designTokens.spacing.xl}`,
      scrollMarginTop: designTokens.spacing.m,
      pageBreakBefore: "always",
    },
    recipeHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: designTokens.spacing.l,
    },
    recipeHeaderInfo: {
      flex: 1,
    },
    recipeCategory: {
      margin: 0,
      color: designTokens.colors.text.secondary,
      fontSize: designTokens.typography.fontSize.xs,
    },
    recipeTitle: {
      fontSize: designTokens.typography.fontSize.l,
      lineHeight: designTokens.typography.lineHeightCompact,
      marginTop: designTokens.spacing.s,
    },
    recipeImage: {
      width: designTokens.sizes.m,
      height: designTokens.sizes.s,
      objectFit: "cover",
      borderRadius: designTokens.radius.md,
      flexShrink: 0,
    },
    recipeDescription: {
      ...commonStyles.bodyDescription,
      color: designTokens.colors.text.secondary,
      marginTop: designTokens.spacing.l,
    },
    meta: {
      display: "flex",
      flexWrap: "wrap",
      gap: designTokens.spacing.m,
      marginTop: designTokens.spacing.m,
      color: designTokens.colors.text.secondary,
    },
    recipeSection: {
      marginTop: designTokens.spacing.l,
    },
    recipeSectionTitle: {
      fontSize: designTokens.typography.fontSize.m,
      marginBottom: designTokens.spacing.m,
    },
    ingredientList: {
      lineHeight: designTokens.typography.lineHeightList,
      paddingLeft: designTokens.spacing.l,
    },
    instructionList: {
      lineHeight: designTokens.typography.lineHeightInstruction,
      paddingLeft: designTokens.spacing.l,
    },
    tags: {
      display: "flex",
      flexWrap: "wrap",
      gap: designTokens.spacing.s,
    },
    tag: {
      borderRadius: designTokens.radius.pill,
      background: designTokens.colors.surface.subtle,
      padding: `${designTokens.spacing.xs} ${designTokens.spacing.s}`,
    },
  },
} as const;
