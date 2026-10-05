"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { commonStyles } from "@/styles/common";
import { supabase } from "@/lib/supabase";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
};

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      const { data } = await supabase
        .from("recipes")
        .select("id, title, description, category, image_url")
        .order("created_at", { ascending: false })
        .limit(6);

      setRecipes((data ?? []) as Recipe[]);
      setLoading(false);
    };

    loadRecipes();
  }, []);

  return (
    <main style={commonStyles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Recipe Book</h1>

          <p style={styles.heroText}>
            A collection of recipes shared, preserved, and enjoyed together.
          </p>

          <Link href="/recipes" style={commonStyles.button}>
            Browse Recipes
          </Link>
        </div>
      </section>

      <section style={commonStyles.container}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Recently Added</h2>
            <p style={commonStyles.subtitle}>
              Explore recipes from the collection.
            </p>
          </div>

          <Link href="/recipes" style={commonStyles.link}>
            View All Recipes →
          </Link>
        </div>

        {loading ? (
          <p>Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <div style={styles.empty}>
            <h3>No recipes yet</h3>
            <p>Be the first to contribute a recipe to the collection.</p>

            <Link href="/submit" style={commonStyles.button}>
              Add New Recipe
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {recipes.map((recipe) => (
              <article key={recipe.id} style={styles.card}>
                {recipe.image_url && (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    style={styles.image}
                  />
                )}

                <div style={styles.cardContent}>
                  <h3 style={styles.recipeTitle}>{recipe.title}</h3>

                  {recipe.category && (
                    <p style={styles.category}>{recipe.category}</p>
                  )}

                  {recipe.description && (
                    <p style={styles.description}>{recipe.description}</p>
                  )}

                  <Link
                    href={`/recipes/${recipe.id}`}
                    style={commonStyles.link}
                  >
                    View Recipe →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.contribute}>
        <div style={commonStyles.container}>
          <h2 style={styles.sectionTitle}>Have a recipe to share?</h2>

          <p style={styles.contributeText}>
            Help grow the collection by submitting a recipe of your own.
          </p>

          <Link href="/submit" style={commonStyles.button}>
            Add New Recipe
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles = {
  hero: {
    padding: "90px 20px",
    background: "#f7f3ed",
  },

  heroContent: {
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center" as const,
  },

  heroTitle: {
    fontSize: "56px",
    margin: 0,
  },

  heroText: {
    maxWidth: "650px",
    margin: "20px auto 30px",
    fontSize: "20px",
    lineHeight: 1.6,
    color: "#555",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "24px",
    marginBottom: "30px",
  },

  sectionTitle: {
    fontSize: "32px",
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden" as const,
    background: "white",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover" as const,
  },

  cardContent: {
    padding: "20px",
  },

  recipeTitle: {
    margin: 0,
    fontSize: "24px",
  },

  category: {
    marginTop: "8px",
    color: "#666",
    fontWeight: "600",
  },

  description: {
    lineHeight: 1.5,
    marginBottom: "18px",
  },

  empty: {
    padding: "50px 20px",
    textAlign: "center" as const,
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  contribute: {
    marginTop: "70px",
    padding: "70px 20px",
    background: "#f7f3ed",
  },

  contributeText: {
    margin: "12px 0 24px",
    color: "#555",
  },
};
