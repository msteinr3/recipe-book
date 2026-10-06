import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { commonStyles } from "@/styles/common";
import RecipeFieldEditor from "@/components/RecipeFieldEditor";
import RecipeMetaEditor from "@/components/RecipeMetaEditor";
import RecipeListEditor from "@/components/RecipeListEditor";

export const dynamic = "force-dynamic";

type Ingredient = {
  quantity: string;
  unit: string;
  item: string;
};

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  category: string | null;
  tags: string[];
  source: string | null;
  notes: string | null;
  image_url: string | null;
};

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours} hr`;

  return `${hours} hr ${remainingMinutes} min`;
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const recipe = data as Recipe;

  return (
    <main style={commonStyles.page}>
      <div
        style={{
          ...commonStyles.narrowContainer,
          position: "relative",
        }}
      >
        <Link href="/recipes" style={commonStyles.link}>
          ← Back to Recipes
        </Link>

        <h1 style={{ ...commonStyles.title, marginTop: "30px" }}>
          <RecipeFieldEditor
            recipeId={recipe.id}
            field="title"
            value={recipe.title}
          />
        </h1>

        {recipe.category && (
          <p style={styles.category}>
            <RecipeFieldEditor
              recipeId={recipe.id}
              field="category"
              value={recipe.category}
            />
          </p>
        )}

        <div style={styles.imageLayer}>
          <img
            src={recipe.image_url || "/images/default-food.jpg"}
            alt={recipe.title}
            style={styles.image}
          />
        </div>

        <div style={styles.descriptionLayer}>
          <RecipeFieldEditor
            recipeId={recipe.id}
            field="description"
            value={recipe.description || ""}
            multiline
            placeholder="Add description"
          />
        </div>

        <RecipeMetaEditor
          recipeId={recipe.id}
          prepMinutes={recipe.prep_minutes}
          cookMinutes={recipe.cook_minutes}
          servings={recipe.servings}
        />

        <section style={styles.section}>
          <h2>Ingredients</h2>

          <RecipeListEditor
            recipeId={recipe.id}
            field="ingredients"
            value={recipe.ingredients}
          />
        </section>

        <section style={styles.section}>
          <h2>Instructions</h2>

          <RecipeListEditor
            recipeId={recipe.id}
            field="instructions"
            value={recipe.instructions}
          />
        </section>

        {recipe.tags.length > 0 && (
          <section style={styles.section}>
            <h2>Tags</h2>

            <RecipeListEditor
              recipeId={recipe.id}
              field="tags"
              value={recipe.tags}
            />
          </section>
        )}

        {recipe.source && (
          <section style={styles.section}>
            <h2>Source</h2>
            <p>
              <RecipeFieldEditor
                recipeId={recipe.id}
                field="source"
                value={recipe.source}
              />
            </p>
          </section>
        )}

        {recipe.notes && (
          <section style={styles.section}>
            <h2>Notes</h2>
            <p>
              <RecipeFieldEditor
                recipeId={recipe.id}
                field="notes"
                value={recipe.notes}
                multiline
              />
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

const styles = {
  category: {
    color: "#666",
    fontWeight: "600",
    marginTop: "8px",
  },

  imageLayer: {
    position: "absolute" as const,
    right: "0",
    top: "120px",
  },

  image: {
    display: "block",
    width: "auto",
    height: "auto",
    maxWidth: "280px",
    maxHeight: "280px",
    borderRadius: "10px",
  },

  descriptionLayer: {
    width: "calc(100% - 320px)",
    marginTop: "30px",
    fontSize: "18px",
    lineHeight: 1.7,
  },

  section: {
    marginTop: "40px",
  },

  ingredients: {
    lineHeight: 1.8,
    paddingLeft: "24px",
  },

  instructions: {
    lineHeight: 1.8,
    paddingLeft: "24px",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
  },

  tag: {
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#f0f0f0",
  },
};
