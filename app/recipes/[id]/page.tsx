import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RecipePageContent from "@/components/RecipePageContent";
import { commonStyles } from "@/styles/common";

export const dynamic = "force-dynamic";

type Ingredient = {
  quantity: string;
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
        <RecipePageContent recipe={recipe} />
      </div>
    </main>
  );
}
