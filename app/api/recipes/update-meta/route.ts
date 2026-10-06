import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipeId, field, value } = body;

    const allowedFields = [
      "title",
      "category",
      "description",
      "ingredients",
      "instructions",
      "prep_minutes",
      "cook_minutes",
      "servings",
      "tags",
      "source",
      "notes",
    ];

    if (!recipeId || !allowedFields.includes(field)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {}
          },
        },
      },
    );

    const { data: recipe, error: fetchError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .single();

    if (fetchError || !recipe) {
      return NextResponse.json(
        { error: fetchError?.message || "Recipe not found" },
        { status: 404 },
      );
    }

    const recipeData = {
      title: field === "title" ? value : recipe.title,
      description: field === "description" ? value : (recipe.description ?? ""),
      ingredients: field === "ingredients" ? value : (recipe.ingredients ?? []),
      instructions:
        field === "instructions" ? value : (recipe.instructions ?? []),
      prepMinutes:
        field === "prep_minutes"
          ? String(value)
          : recipe.prep_minutes !== null
            ? String(recipe.prep_minutes)
            : "",
      cookMinutes:
        field === "cook_minutes"
          ? String(value)
          : recipe.cook_minutes !== null
            ? String(recipe.cook_minutes)
            : "",
      servings:
        field === "servings"
          ? String(value)
          : recipe.servings !== null
            ? String(recipe.servings)
            : "",
      category: field === "category" ? value : (recipe.category ?? ""),
      tags: field === "tags" ? value : (recipe.tags ?? []),
      source: field === "source" ? value : (recipe.source ?? ""),
      notes: field === "notes" ? value : (recipe.notes ?? ""),
      imageUrl: recipe.image_url ?? "",
    };

    const { error: updateError } = await supabase.rpc(
      "update_published_recipe",
      {
        recipe_id: recipeId,
        recipe_data: recipeData,
      },
    );

    if (updateError) {
      console.error("RPC UPDATE ERROR:", updateError);

      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE META EXCEPTION:", error);

    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
