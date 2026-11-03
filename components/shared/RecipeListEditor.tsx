"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/shared/Button";
import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";


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
        <div style={styles.ingredients}>
          {ingredients.map((ingredient, index) => (
            <div key={index} style={styles.ingredientEditorRow}>
              <input
                type="text"
                value={ingredient.quantity}
                onChange={(event) =>
                  updateIngredient(index, "quantity", event.target.value)
                }
                placeholder="Quantity"
                style={styles.quantityInput}
              />
              <input
                type="text"
                value={ingredient.item}
                onChange={(event) =>
                  updateIngredient(index, "item", event.target.value)
                }
                placeholder="Ingredient"
                style={styles.itemInput}
              />
              <Button
                viewModel={{
                  type: "button",
                  onClick: () => removeItem(index),
                  style: styles.removeButton,
                  "aria-label": "Remove ingredient",
                  content: "×",
                }}
              />
            </div>
          ))}
        </div>

        <div style={styles.editorButtons}>
          <Button
            viewModel={{
              type: "button",
              onClick: addItem,
              style: styles.editorButton,
              content: "Add ingredient",
            }}
          />
        </div>
      </div>
    );
  }

  if (props.field === "instructions") {
    const instructions = editValue as string[];

    return (
      <div ref={containerRef} style={commonStyles.editable}>
        <div style={styles.instructions}>
          {instructions.map((instruction, index) => (
            <div key={index} style={styles.instructionEditorRow}>
              <span>{index + 1}.</span>
              <textarea
                value={instruction}
                onChange={(event) => updateItem(index, event.target.value)}
                placeholder="Enter instruction"
                style={styles.instructionInput}
                rows={2}
              />
              <Button
                viewModel={{
                  type: "button",
                  onClick: () => removeItem(index),
                  style: styles.removeButton,
                  "aria-label": "Remove instruction",
                  content: "×",
                }}
              />
            </div>
          ))}
        </div>

        <div style={styles.editorButtons}>
          <Button
            viewModel={{
              type: "button",
              onClick: addItem,
              style: styles.editorButton,
              content: "Add step",
            }}
          />
        </div>
      </div>
    );
  }

  const tags = editValue as string[];

  return (
    <div ref={containerRef} style={commonStyles.editable}>
      <div style={styles.tags}>
        {tags.map((tag, index) => (
          <div key={index} style={styles.tag}>
            <input
              type="text"
              value={tag}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder="Tag"
              style={styles.tagsInput}
            />
            <Button
              viewModel={{
                type: "button",
                onClick: () => removeItem(index),
                style: styles.removeButton,
                "aria-label": "Remove tag",
                content: "×",
              }}
            />
          </div>
        ))}
      </div>

      <div style={styles.editorButtons}>
        <Button
          viewModel={{
            type: "button",
            onClick: addItem,
            style: styles.editorButton,
            content: "Add tag",
          }}
        />
      </div>
    </div>
  );
}

const recipeListStyle = {
  lineHeight: designTokens.typography.lineHeightList,
  paddingLeft: designTokens.spacing.l,
};

const editorRowBase = {
  display: "flex",
  gap: designTokens.spacing.s,
  marginBottom: designTokens.spacing.s,
};

const styles = {
  ingredients: {
    ...recipeListStyle,
  },
  ingredientEditorRow: {
    ...editorRowBase,
    alignItems: "center",
  },
  quantityInput: {
    width: designTokens.sizes.s,
    padding: designTokens.spacing.xs,
    boxSizing: "border-box",
  },
  itemInput: {
    width: "35%",
    padding: designTokens.spacing.xs,
    boxSizing: "border-box",
  },
  removeButton: {
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.s}`,
    cursor: "pointer",
  },
  editorButtons: {
    display: "flex",
    gap: designTokens.spacing.s,
    marginTop: designTokens.spacing.m,
  },
  editorButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: designTokens.spacing.s,
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.s}`,
    borderRadius: designTokens.radius.sm,
    cursor: "pointer",
    fontSize: designTokens.typography.fontSize.s,
  },
  instructions: {
    ...recipeListStyle,
  },
  instructionEditorRow: {
    ...editorRowBase,
    alignItems: "flex-start",
  },
  instructionInput: {
    width: "50%",
    minHeight: designTokens.sizes.xs,
    padding: designTokens.spacing.xs,
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: designTokens.spacing.s,
  },
  tag: {
    borderRadius: designTokens.radius.pill,
    background: designTokens.colors.surface.subtle,
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.m}`,
  },
  tagsInput: {
    width: "100%",
    padding: designTokens.spacing.xs,
    boxSizing: "border-box",
    fontSize: "inherit",
  },
} as const;
