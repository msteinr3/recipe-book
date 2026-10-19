"use client";

import { type FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { commonStyles } from "@/styles/common";

const RECIPE_CATEGORIES = [
  "Appetizers",
  "Soups",
  "Salads",
  "Main Dishes",
  "Side Dishes",
  "Breads & Doughs",
  "Desserts",
  "Drinks",
  "Other",
];

type Ingredient = {
  item: string;
  quantity: string;
};

export default function SubmitRecipePage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: "", quantity: "" },
  ]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const addIngredient = () => {
    setIngredients((current) => [...current, { item: "", quantity: "" }]);
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string,
  ) => {
    setIngredients((current) =>
      current.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  };

  const removeIngredient = (index: number) => {
    setIngredients((current) => current.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions((current) => [...current, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    setInstructions((current) =>
      current.map((instruction, i) => (i === index ? value : instruction)),
    );
  };

  const removeInstruction = (index: number) => {
    setInstructions((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitted(false);
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      ingredients: ingredients.filter(
        (ingredient) => ingredient.item.trim() !== "",
      ),
      instructions: instructions
        .map((instruction) => instruction.trim())
        .filter(Boolean),
      prepMinutes: String(formData.get("prepMinutes") ?? ""),
      cookMinutes: String(formData.get("cookMinutes") ?? ""),
      servings: String(formData.get("servings") ?? ""),
      category: String(formData.get("category") ?? ""),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      source: String(formData.get("source") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? ""),
    };

    const { error } = await supabase
      .from("recipe_submissions")
      .insert({ data });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    form.reset();
    setIngredients([{ item: "", quantity: "" }]);
    setInstructions([""]);
    setSubmitted(true);
  };

  return (
    <main style={commonStyles.page}>
      <div style={commonStyles.narrowContainer}>
        <h1 style={commonStyles.title}>Submit a Recipe</h1>

        <p style={commonStyles.subtitle}>
          Submit a recipe for review. Approved recipes will become part of the
          recipe collection.
        </p>

        <form onSubmit={handleSubmit} style={commonStyles.form}>
          <label style={commonStyles.label}>
            Recipe Name *
            <input name="title" required style={commonStyles.input} />
          </label>

          <label style={commonStyles.label}>
            Description
            <textarea
              name="description"
              rows={3}
              style={commonStyles.textarea}
            />
          </label>

          <section style={commonStyles.section}>
            <h2 style={commonStyles.sectionTitle}>Ingredients</h2>

            {ingredients.map((ingredient, index) => (
              <div key={index} style={commonStyles.ingredientRow}>
                <input
                  placeholder="Ingredient"
                  value={ingredient.item}
                  onChange={(event) =>
                    updateIngredient(index, "item", event.target.value)
                  }
                  style={commonStyles.input}
                />

                <input
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(event) =>
                    updateIngredient(index, "quantity", event.target.value)
                  }
                  style={commonStyles.input}
                />

                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  style={commonStyles.secondaryButton}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredient}
              style={commonStyles.secondaryButton}
            >
              + Add Ingredient
            </button>
          </section>

          <section style={commonStyles.section}>
            <h2 style={commonStyles.sectionTitle}>Instructions</h2>

            {instructions.map((instruction, index) => (
              <div key={index} style={commonStyles.instructionRow}>
                <span style={commonStyles.stepNumber}>{index + 1}.</span>

                <textarea
                  value={instruction}
                  onChange={(event) =>
                    updateInstruction(index, event.target.value)
                  }
                  rows={3}
                  style={commonStyles.textarea}
                />

                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  style={commonStyles.secondaryButton}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addInstruction}
              style={commonStyles.secondaryButton}
            >
              + Add Step
            </button>
          </section>

          <div style={commonStyles.twoColumns}>
            <label style={commonStyles.label}>
              Prep Time (minutes)
              <input
                type="number"
                name="prepMinutes"
                min="0"
                style={commonStyles.input}
              />
            </label>

            <label style={commonStyles.label}>
              Cook Time (minutes)
              <input
                type="number"
                name="cookMinutes"
                min="0"
                style={commonStyles.input}
              />
            </label>
          </div>

          <label style={commonStyles.label}>
            Servings
            <input
              type="number"
              name="servings"
              min="1"
              style={commonStyles.input}
            />
          </label>

          <label style={commonStyles.label}>
            Category
            <select
              name="category"
              required
              defaultValue=""
              style={commonStyles.input}
            >
              <option value="" disabled>
                Select a category
              </option>

              {RECIPE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label style={commonStyles.label}>
            Tags
            <input
              name="tags"
              placeholder="holiday, vegetarian, family"
              style={commonStyles.input}
            />
          </label>

          <label style={commonStyles.label}>
            Source
            <input
              name="source"
              placeholder="Where did this recipe come from?"
              style={commonStyles.input}
            />
          </label>

          <label style={commonStyles.label}>
            Image URL
            <input type="url" name="imageUrl" style={commonStyles.input} />
          </label>

          <label style={commonStyles.label}>
            Notes
            <textarea name="notes" rows={5} style={commonStyles.textarea} />
          </label>

          <button type="submit" style={commonStyles.button}>
            Submit Recipe
          </button>
        </form>

        {submitted && (
          <p style={commonStyles.success}>
            Thank you! Your recipe has been sent for review.
          </p>
        )}

        {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}
      </div>
    </main>
  );
}
