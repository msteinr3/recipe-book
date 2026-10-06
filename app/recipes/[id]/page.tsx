import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { commonStyles } from "@/styles/common";
import RecipeMetaEditor from "@/components/RecipeMetaEditor";

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
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

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
      <div style={commonStyles.narrowContainer}>
        <Link href="/recipes" style={commonStyles.link}>
          ← Back to Recipes
        </Link>

        <h1 style={{ ...commonStyles.title, marginTop: "30px" }}>
          {recipe.title}
        </h1>

        {recipe.category && <p style={styles.category}>{recipe.category}</p>}

        <img
          src={recipe.image_url || "/images/default-food.jpg"}
          alt={recipe.title}
          style={styles.image}
        />

        {recipe.description && (
          <p style={styles.description}>{recipe.description}</p>
        )}

        <RecipeMetaEditor
          recipeId={recipe.id}
          prepMinutes={recipe.prep_minutes}
          cookMinutes={recipe.cook_minutes}
          servings={recipe.servings}
        />

        <section style={styles.section}>
          <h2>Ingredients</h2>

          <ul style={styles.ingredients}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.quantity} {ingredient.unit} {ingredient.item}
              </li>
            ))}
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Instructions</h2>

          <ol style={styles.instructions}>
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </section>

        {recipe.tags.length > 0 && (
          <section style={styles.section}>
            <h2>Tags</h2>

            <div style={styles.tags}>
              {recipe.tags.map((tag) => (
                <span key={tag} style={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {recipe.source && (
          <section style={styles.section}>
            <h2>Source</h2>
            <p>{recipe.source}</p>
          </section>
        )}

        {recipe.notes && (
          <section style={styles.section}>
            <h2>Notes</h2>
            <p>{recipe.notes}</p>
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

  image: {
    display: "block",
    float: "right" as const,
    width: "auto",
    height: "auto",
    maxWidth: "280px",
    maxHeight: "280px",
    marginTop: "30px",
    marginLeft: "30px",
    marginBottom: "20px",
    borderRadius: "10px",
  },

  description: {
    fontSize: "18px",
    lineHeight: 1.7,
    marginTop: "30px",
  },

  meta: {
    display: "flex",
    flexWrap: "nowrap" as const,
    gap: "20px",
    marginTop: "24px",
    color: "#555",
  },

  metaItem: {
    whiteSpace: "nowrap" as const,
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
