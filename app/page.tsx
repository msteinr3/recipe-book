"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { commonStyles, designTokens } from "@/styles/common";
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
      <section style={commonStyles.hero}>
        <div style={commonStyles.heroContent}>
          <h1 style={commonStyles.heroTitle}>Recipe Book</h1>

          <p style={commonStyles.heroText}>
            A collection of recipes shared, preserved, and enjoyed together.
          </p>

          <Link href="/recipes" style={commonStyles.button}>
            Browse Recipes
          </Link>
        </div>
      </section>

      <section style={commonStyles.container}>
        <div style={commonStyles.sectionHeader}>
          <div>
            <h2 style={commonStyles.sectionTitle}>Recently Added</h2>
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
          <div style={commonStyles.emptyState}>
            <h3>No recipes yet</h3>
            <p>Be the first to contribute a recipe to the collection.</p>

            <Link href="/submit" style={commonStyles.button}>
              Add New Recipe
            </Link>
          </div>
        ) : (
          <div style={commonStyles.grid}>
            {recipes.map((recipe) => (
              <article key={recipe.id} style={commonStyles.card}>
                {recipe.image_url && (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    style={commonStyles.image}
                  />
                )}

                <div style={commonStyles.cardContent}>
                  <h3 style={commonStyles.cardTitle}>{recipe.title}</h3>

                  {recipe.category && (
                    <p style={commonStyles.category}>{recipe.category}</p>
                  )}

                  {recipe.description && (
                    <p style={commonStyles.description}>{recipe.description}</p>
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
          <h2 style={commonStyles.sectionTitle}>Have a recipe to share?</h2>

          <p style={commonStyles.contributeText}>
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
  contribute: {
    marginTop: designTokens.spacing.section,
    padding: `${designTokens.spacing.section} ${designTokens.spacing.lg}`,
    background: designTokens.colors.accentBackground,
  },
};
