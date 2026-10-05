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

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
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
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                style={styles.row}
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
            ))}
          </div>
        )}
      </div>
    </main>
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "10px 14px",
    borderRadius: "6px",
    background: "#f7f3ed",
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

  empty: {
    padding: "60px 20px",
    textAlign: "center" as const,
    border: "1px solid #ddd",
    borderRadius: "12px",
  },
};
