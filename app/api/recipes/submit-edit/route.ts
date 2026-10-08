import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipeId, recipeData } = body;

    if (!recipeId || !recipeData) {
      return NextResponse.json(
        { error: "Recipe ID and recipe data are required" },
        { status: 400 },
      );
    }

    if (!recipeData.title || !recipeData.title.trim()) {
      return NextResponse.json(
        { error: "Recipe title is required" },
        { status: 400 },
      );
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to submit changes" },
        { status: 401 },
      );
    }

    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const submissionData = {
      recipeId,
      title: recipeData.title,
      description: recipeData.description ?? "",
      ingredients: recipeData.ingredients ?? [],
      instructions: recipeData.instructions ?? [],
      prepMinutes:
        recipeData.prep_minutes != null ? String(recipeData.prep_minutes) : "",
      cookMinutes:
        recipeData.cook_minutes != null ? String(recipeData.cook_minutes) : "",
      servings: recipeData.servings != null ? String(recipeData.servings) : "",
      category: recipeData.category ?? "",
      tags: recipeData.tags ?? [],
      source: recipeData.source ?? "",
      notes: recipeData.notes ?? "",
      imageUrl: recipeData.image_url ?? "",
    };

    const { error: submissionError } = await supabase
      .from("recipe_submissions")
      .insert({
        status: "pending",
        data: submissionData,
      });

    console.log("SUBMISSION INSERT:", {
      userId: user.id,
      submissionData,
      error: submissionError,
    });

    if (submissionError) {
      console.error("SUBMISSION ERROR:", submissionError);

      return NextResponse.json(
        { error: submissionError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("SUBMIT EDIT EXCEPTION:", error);

    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
