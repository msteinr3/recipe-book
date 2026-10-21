"use client";

import { useEffect, useRef, useState } from "react";
import { commonStyles } from "@/styles/common";

type Ingredient = {
  quantity: string;
  item: string;
};

type RecipeListEditorProps =
  | {
      recipeId: string;
      field: "ingredients";
      value: Ingredient[];
      isAdmin: boolean;
      onChange: (value: Ingredient[]) => void;
    }
  | {
      recipeId: string;
      field: "instructions";
      value: string[];
      isAdmin: boolean;
      onChange: (value: string[]) => void;
    }
  | {
      recipeId: string;
      field: "tags";
      value: string[];
      isAdmin: boolean;
      onChange: (value: string[]) => void;
    };

export default function RecipeListEditor(props: RecipeListEditorProps) {
  const [savedValue, setSavedValue] = useState(props.value);
  const [editValue, setEditValue] = useState(props.value);
  const [previousValue, setPreviousValue] = useState(props.value);
  const containerRef = useRef<HTMLDivElement>(null);

  if (props.value !== previousValue) {
    setPreviousValue(props.value);
    setSavedValue(props.value);
    setEditValue(props.value);
  }

  async function saveValue() {
    if (JSON.stringify(editValue) === JSON.stringify(savedValue)) {
      return;
    }

    if (!props.isAdmin) {
      if (props.field === "ingredients") {
        props.onChange(editValue as Ingredient[]);
      } else {
        props.onChange(editValue as string[]);
      }
      setSavedValue(editValue);
      return;
    }

    try {
      const response = await fetch("/api/recipes/update-meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: props.recipeId,
          field: props.field,
          value: editValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      setSavedValue(editValue);
    } catch (error) {
      console.error("Error saving recipe:", error);
      setEditValue(savedValue);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        void saveValue();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  function updateIngredient(
    index: number,
    key: keyof Ingredient,
    value: string,
  ) {
    if (props.field !== "ingredients") return;

    setEditValue((current) => {
      if (!Array.isArray(current)) return current;

      const updated = [...current] as Ingredient[];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  }

  function updateItem(index: number, value: string) {
    if (props.field === "ingredients") {
      updateIngredient(index, "item", value);
      return;
    }

    setEditValue((current) => {
      if (!Array.isArray(current)) return current;

      const updated = [...current] as string[];
      updated[index] = value;
      return updated;
    });
  }

  function addItem() {
    if (props.field === "ingredients") {
      setEditValue([
        ...(editValue as Ingredient[]),
        { quantity: "", item: "" },
      ]);
    } else {
      setEditValue([...(editValue as string[]), ""]);
    }
  }

  function removeItem(index: number) {
    if (props.field === "ingredients") {
      setEditValue(
        (editValue as Ingredient[]).filter((_, itemIndex) => itemIndex !== index),
      );
    } else {
      setEditValue(
        (editValue as string[]).filter((_, itemIndex) => itemIndex !== index),
      );
    }
  }

  if (props.field === "ingredients") {
    const ingredients = editValue as Ingredient[];

    return (
      <div ref={containerRef} style={commonStyles.editable}>
        <div style={commonStyles.ingredients}>
          {ingredients.map((ingredient, index) => (
            <div key={index} style={commonStyles.ingredientEditorRow}>
              <input
                type="text"
                value={ingredient.quantity}
                onChange={(event) =>
                  updateIngredient(index, "quantity", event.target.value)
                }
                placeholder="Quantity"
                style={commonStyles.quantityInput}
              />
              <input
                type="text"
                value={ingredient.item}
                onChange={(event) =>
                  updateIngredient(index, "item", event.target.value)
                }
                placeholder="Ingredient"
                style={commonStyles.itemInput}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={commonStyles.removeButton}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={commonStyles.editorButtons}>
          <button
            type="button"
            onClick={addItem}
            style={commonStyles.editorButton}
          >
            Add ingredient
          </button>
        </div>
      </div>
    );
  }

  if (props.field === "instructions") {
    const instructions = editValue as string[];

    return (
      <div ref={containerRef} style={commonStyles.editable}>
        <div style={commonStyles.instructions}>
          {instructions.map((instruction, index) => (
            <div key={index} style={commonStyles.instructionEditorRow}>
              <span>{index + 1}.</span>
              <textarea
                value={instruction}
                onChange={(event) => updateItem(index, event.target.value)}
                placeholder="Enter instruction"
                style={commonStyles.instructionInput}
                rows={2}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={commonStyles.removeButton}
                aria-label="Remove instruction"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={commonStyles.editorButtons}>
          <button
            type="button"
            onClick={addItem}
            style={commonStyles.editorButton}
          >
            Add step
          </button>
        </div>
      </div>
    );
  }

  const tags = editValue as string[];

  return (
    <div ref={containerRef} style={commonStyles.editable}>
      <div style={commonStyles.tags}>
        {tags.map((tag, index) => (
          <div key={index} style={commonStyles.tag}>
            <input
              type="text"
              value={tag}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder="Tag"
              style={commonStyles.tagsInput}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              style={commonStyles.removeButton}
              aria-label="Remove tag"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div style={commonStyles.editorButtons}>
        <button
          type="button"
          onClick={addItem}
          style={commonStyles.editorButton}
        >
          Add tag
        </button>
      </div>
    </div>
  );
}
