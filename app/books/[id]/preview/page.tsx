"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BookPdfButton from "@/components/BookPdfButton";
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
      <main style={commonStyles.bookPreview.page}>
        <div style={commonStyles.bookPreview.messagePage}>
          <p>Loading book...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !book || !bookId) {
    return (
      <main style={commonStyles.bookPreview.page}>
        <div style={commonStyles.bookPreview.messagePage}>
          <Link href="/profile" style={commonStyles.bookPreview.backLink}>
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
    <main style={commonStyles.bookPreview.page}>
      <div style={commonStyles.bookPreview.topBar}>
        <div style={commonStyles.bookPreview.topBarContent}>
          <Link
            href={`/books/${bookId}`}
            style={commonStyles.bookPreview.backLink}
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
      <div style={commonStyles.bookPreview.book}>
        {/* COVER */}
        <section style={commonStyles.bookPreview.cover}>
          <div>
            <p style={commonStyles.bookPreview.coverLabel}>RECIPE BOOK</p>

            <h1 style={commonStyles.bookPreview.coverTitle}>{book.title}</h1>

            {book.description && (
              <p style={commonStyles.bookPreview.coverDescription}>
                {book.description}
              </p>
            )}

            <p style={commonStyles.bookPreview.coverRecipeCount}>
              {bookRecipes.length}{" "}
              {bookRecipes.length === 1 ? "recipe" : "recipes"}
            </p>
          </div>
        </section>

        {/* TABLE OF CONTENTS */}
        <section style={commonStyles.bookPreview.pageSection}>
          <h2 style={commonStyles.bookPreview.pageTitle}>
            Table of Contents
          </h2>

          {recipesByCategory.length === 0 ? (
            <p>This book does not have any recipes yet.</p>
          ) : (
            <div style={commonStyles.bookPreview.toc}>
              {recipesByCategory.map((section) => (
                <div
                  key={section.category}
                  style={commonStyles.bookPreview.tocSection}
                >
                  <a
                    href={`#section-${section.category
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                    style={commonStyles.bookPreview.tocSectionLink}
                  >
                    {section.category}
                  </a>

                  <div style={commonStyles.bookPreview.tocRecipes}>
                    {section.recipes.map((bookRecipe) => (
                      <a
                        key={bookRecipe.recipe_id}
                        href={`#recipe-${bookRecipe.recipe_id}`}
                        style={commonStyles.bookPreview.tocRecipeLink}
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
                style={commonStyles.bookPreview.sectionDivider}
              >
                <div>
                  <p style={commonStyles.bookPreview.sectionLabel}>SECTION</p>

                  <h2 style={commonStyles.bookPreview.sectionTitle}>
                    {section.category}
                  </h2>

                  <p style={commonStyles.bookPreview.sectionCount}>
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
                    style={commonStyles.bookPreview.recipePage}
                  >
                    <div style={commonStyles.bookPreview.recipeHeader}>
                      <div
                        style={commonStyles.bookPreview.recipeHeaderInfo}
                      >
                        <p style={commonStyles.bookPreview.recipeCategory}>
                          {recipe.category ?? "Other"}
                        </p>

                        <h2 style={commonStyles.bookPreview.recipeTitle}>
                          {recipe.title}
                        </h2>
                      </div>

                      <img
                        src={recipe.image_url || "/images/default-food.jpg"}
                        alt={recipe.title}
                        style={commonStyles.bookPreview.recipeImage}
                      />
                    </div>

                    {recipe.description && (
                      <p style={commonStyles.bookPreview.recipeDescription}>
                        {recipe.description}
                      </p>
                    )}

                    <div style={commonStyles.bookPreview.meta}>
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
                      <div style={commonStyles.bookPreview.recipeSection}>
                        <h3 style={commonStyles.bookPreview.recipeSectionTitle}>
                          Ingredients
                        </h3>

                        <ul style={commonStyles.bookPreview.ingredientList}>
                          {ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {instructions.length > 0 && (
                      <div style={commonStyles.bookPreview.recipeSection}>
                        <h3 style={commonStyles.bookPreview.recipeSectionTitle}>
                          Instructions
                        </h3>

                        <ol style={commonStyles.bookPreview.instructionList}>
                          {instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {recipe.tags && recipe.tags.length > 0 && (
                      <div style={commonStyles.bookPreview.recipeSection}>
                        <h3 style={commonStyles.bookPreview.recipeSectionTitle}>
                          Tags
                        </h3>

                        <div style={commonStyles.bookPreview.tags}>
                          {recipe.tags.map((tag) => (
                            <span
                              key={tag}
                              style={commonStyles.bookPreview.tag}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {recipe.source && (
                      <div style={commonStyles.bookPreview.recipeSection}>
                        <h3 style={commonStyles.bookPreview.recipeSectionTitle}>
                          Source
                        </h3>

                        <p>{recipe.source}</p>
                      </div>
                    )}

                    {recipe.notes && (
                      <div style={commonStyles.bookPreview.recipeSection}>
                        <h3 style={commonStyles.bookPreview.recipeSectionTitle}>
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
