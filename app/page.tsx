"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getButtonStyle } from "@/components/shared/Button";
import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";
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

          <Link href="/recipes" style={getButtonStyle({})}>
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

            <Link href="/submit" style={getButtonStyle({})}>
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
                  <h3 style={commonStyles.sectionTitle}>{recipe.title}</h3>

                  {recipe.category && (
                    <p style={commonStyles.category}>{recipe.category}</p>
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

      <section style={styles.contributeSection}>
        <div style={commonStyles.container}>
          <h2 style={commonStyles.sectionTitle}>Have a recipe to share?</h2>

          <p style={styles.contributeText}>
            Help grow the collection by submitting a recipe of your own.
          </p>

          <Link href="/submit" style={getButtonStyle({})}>
            Add New Recipe
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles = {
  hero: {
    padding: `${designTokens.spacing.xl} ${designTokens.spacing.m}`,
    background: designTokens.colors.surface.homeHero,
  },
  heroContent: {
    maxWidth: designTokens.sizes.xl,
    margin: "0 auto",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: designTokens.typography.fontSize.xl,
    margin: 0,
  },
  heroText: {
    maxWidth: designTokens.sizes.l,
    margin: `${designTokens.spacing.l} auto ${designTokens.spacing.l}`,
    fontSize: designTokens.typography.fontSize.m,
    lineHeight: designTokens.typography.lineHeightRelaxed,
    color: designTokens.colors.text.secondary,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${designTokens.sizes.m}, 1fr))`,
    gap: designTokens.spacing.l,
  },
  card: {
    ...commonStyles.card,
    overflow: "hidden",
  },
  image: {
    display: "block",
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: designTokens.sizes.m,
    objectFit: "contain",
  },
  cardContent: {
    padding: designTokens.spacing.m,
  },
  description: {
    lineHeight: designTokens.typography.lineHeightBody,
    marginBottom: designTokens.spacing.m,
  },
  contributeSection: {
    marginTop: designTokens.spacing.l,
    padding: `${designTokens.spacing.l} ${designTokens.spacing.m}`,
    background: designTokens.colors.surface.softBackground,
  },
  contributeText: {
    margin: `${designTokens.spacing.m} 0 ${designTokens.spacing.l}`,
    color: designTokens.colors.text.secondary,
  },
} as const;
