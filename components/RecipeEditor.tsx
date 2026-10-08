"use client";

import { useEffect, useRef, useState } from "react";
import RecipeFieldEditor from "@/components/RecipeFieldEditor";
import RecipeMetaEditor from "@/components/RecipeMetaEditor";
import RecipeListEditor from "@/components/RecipeListEditor";

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

type RecipeEditorProps = {
  recipe: Recipe;
  isAdmin: boolean;
  onUnsavedChanges?: (hasChanges: boolean) => void;
  submitRequest?: number;
  onSubmitComplete?: () => void;
};

export default function RecipeEditor({
  recipe,
  isAdmin,
  onUnsavedChanges,
  submitRequest = 0,
  onSubmitComplete,
}: RecipeEditorProps) {
  const [draft, setDraft] = useState(recipe);
  const [submitted, setSubmitted] = useState(false);

  const beforeUnloadHandlerRef = useRef<
    ((event: BeforeUnloadEvent) => void) | null
  >(null);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(recipe);

  useEffect(() => {
    onUnsavedChanges?.(!isAdmin && hasChanges && !submitted);
  }, [hasChanges, isAdmin, submitted, onUnsavedChanges]);

  useEffect(() => {
    if (!hasChanges || isAdmin || submitted) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    beforeUnloadHandlerRef.current = handleBeforeUnload;

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (beforeUnloadHandlerRef.current === handleBeforeUnload) {
        beforeUnloadHandlerRef.current = null;
      }
    };
  }, [hasChanges, isAdmin, submitted]);

  useEffect(() => {
    if (submitRequest === 0 || isAdmin || submitted || !hasChanges) {
      return;
    }

    submitChanges();
  }, [submitRequest]);

  function updateDraft(field: keyof Recipe, value: Recipe[keyof Recipe]) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
    setSubmitted(false);
  }

  const showSubmitButton = !isAdmin && hasChanges && !submitted;

  async function submitChanges() {
    const response = await fetch("/api/recipes/submit-edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeId: recipe.id,
        recipeData: draft,
      }),
    });

    const result = await response.json();

    console.log("SUBMIT RESULT:", response.status, result);

    if (response.ok) {
      if (beforeUnloadHandlerRef.current) {
        window.removeEventListener(
          "beforeunload",
          beforeUnloadHandlerRef.current,
        );
        beforeUnloadHandlerRef.current = null;
      }

      setSubmitted(true);
      onUnsavedChanges?.(false);
      onSubmitComplete?.();
    }
  }

  return (
    <div>
      {showSubmitButton && (
        <button
          type="button"
          onClick={submitChanges}
          style={styles.submitButton}
        >
          Submit Suggested Changes
        </button>
      )}

      <h1 style={styles.title}>
        <RecipeFieldEditor
          recipeId={recipe.id}
          field="title"
          value={draft.title}
          onChange={(value) => updateDraft("title", value)}
        />
      </h1>

      {recipe.category && (
        <p style={styles.category}>
          <RecipeFieldEditor
            recipeId={recipe.id}
            field="category"
            value={draft.category ?? ""}
            onChange={(value) => updateDraft("category", value)}
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
          value={draft.description || ""}
          onChange={(value) => updateDraft("description", value)}
          multiline
          placeholder="Add description"
        />
      </div>

      <RecipeMetaEditor
        recipeId={recipe.id}
        prepMinutes={draft.prep_minutes}
        cookMinutes={draft.cook_minutes}
        servings={draft.servings}
        isAdmin={isAdmin}
        onChange={(field, value) => updateDraft(field, value)}
      />

      <section style={styles.section}>
        <h2>Ingredients</h2>

        <RecipeListEditor
          recipeId={recipe.id}
          field="ingredients"
          value={draft.ingredients}
          isAdmin={isAdmin}
          onChange={(value) => updateDraft("ingredients", value)}
        />
      </section>

      <section style={styles.section}>
        <h2>Instructions</h2>

        <RecipeListEditor
          recipeId={recipe.id}
          field="instructions"
          value={draft.instructions}
          isAdmin={isAdmin}
          onChange={(value) => updateDraft("instructions", value)}
        />
      </section>

      {draft.tags.length > 0 && (
        <section style={styles.section}>
          <h2>Tags</h2>

          <RecipeListEditor
            recipeId={recipe.id}
            field="tags"
            value={draft.tags}
            isAdmin={isAdmin}
            onChange={(value) => updateDraft("tags", value)}
          />
        </section>
      )}

      {draft.source && (
        <section style={styles.section}>
          <h2>Source</h2>

          <p>
            <RecipeFieldEditor
              recipeId={recipe.id}
              field="source"
              value={draft.source}
              onChange={(value) => updateDraft("source", value)}
            />
          </p>
        </section>
      )}

      {draft.notes && (
        <section style={styles.section}>
          <h2>Notes</h2>

          <p>
            <RecipeFieldEditor
              recipeId={recipe.id}
              field="notes"
              value={draft.notes}
              onChange={(value) => updateDraft("notes", value)}
              multiline
            />
          </p>
        </section>
      )}
    </div>
  );
}

const styles = {
  title: {
    fontSize: "32px",
    fontWeight: "700",
    marginTop: "30px",
  },

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

  submitButton: {
    display: "block",
    width: "100%",
    padding: "16px",
    marginBottom: "30px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "20px",
    fontWeight: "700",
    cursor: "pointer",
  },
};
