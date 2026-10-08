"use client";

import { useEffect, useRef, useState } from "react";

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
  const [editing, setEditing] = useState(false);
  const [savedValue, setSavedValue] = useState(props.value);
  const [editValue, setEditValue] = useState(props.value);
  const [tagsText, setTagsText] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);

  async function save(valueToSave = editValue) {
    if (!props.isAdmin) {
      props.onChange(valueToSave);
      setSavedValue(valueToSave);
      setEditing(false);
      return;
    }

    const response = await fetch("/api/recipes/update-meta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeId: props.recipeId,
        field: props.field,
        value: valueToSave,
      }),
    });

    const result = await response.json();

    console.log("SAVE RESULT:", response.status, result);

    if (response.ok) {
      setSavedValue(valueToSave);
    }

    setEditing(false);
  }

  async function saveTags() {
    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await save(tags);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        if (props.field === "tags") {
          saveTags();
        } else {
          save();
        }
      }
    }

    if (editing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editing, editValue, savedValue, tagsText]);

  function startEditing() {
    setEditValue(savedValue);

    if (props.field === "tags") {
      setTagsText(savedValue.join(", "));
    }

    setEditing(true);
  }

  if (props.field === "ingredients") {
    if (!editing) {
      return (
        <ul style={styles.ingredients}>
          {savedValue.map((ingredient, index) => (
            <li key={index}>
              <span onClick={startEditing} style={styles.editable}>
                {ingredient.item} {ingredient.quantity}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div ref={editorRef}>
        {editValue.map((ingredient, index) => (
          <div key={index} style={styles.ingredientRow}>
            <input
              value={ingredient.item}
              onChange={(e) => {
                const updated = [...editValue];

                updated[index] = {
                  ...updated[index],
                  item: e.target.value,
                };

                setEditValue(updated);
              }}
              placeholder="Ingredient"
              style={styles.itemInput}
            />

            <input
              value={ingredient.quantity}
              onChange={(e) => {
                const updated = [...editValue];

                updated[index] = {
                  ...updated[index],
                  quantity: e.target.value,
                };

                setEditValue(updated);
              }}
              placeholder="Quantity"
              style={styles.quantityInput}
            />

            <button
              type="button"
              onClick={() => {
                setEditValue(editValue.filter((_, i) => i !== index));
              }}
              style={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}

        <div style={styles.editorButtons}>
          <button
            type="button"
            onClick={() => {
              setEditValue([
                ...editValue,
                {
                  quantity: "",
                  item: "",
                },
              ]);
            }}
            style={styles.button}
          >
            + Add Ingredient
          </button>

          <button type="button" onClick={() => save()} style={styles.button}>
            Done
          </button>
        </div>
      </div>
    );
  }

  if (props.field === "instructions") {
    if (!editing) {
      return (
        <ol style={styles.instructions}>
          {savedValue.map((instruction, index) => (
            <li key={index}>
              <span onClick={startEditing} style={styles.editable}>
                {instruction}
              </span>
            </li>
          ))}
        </ol>
      );
    }

    return (
      <div ref={editorRef}>
        {editValue.map((instruction, index) => (
          <div key={index} style={styles.instructionRow}>
            <textarea
              value={instruction}
              onChange={(e) => {
                const updated = [...editValue];
                updated[index] = e.target.value;
                setEditValue(updated);
              }}
              placeholder={`Step ${index + 1}`}
              style={styles.instructionInput}
            />

            <button
              type="button"
              onClick={() => {
                setEditValue(editValue.filter((_, i) => i !== index));
              }}
              style={styles.removeButton}
            >
              Remove
            </button>
          </div>
        ))}

        <div style={styles.editorButtons}>
          <button
            type="button"
            onClick={() => {
              setEditValue([...editValue, ""]);
            }}
            style={styles.button}
          >
            + Add Step
          </button>

          <button type="button" onClick={() => save()} style={styles.button}>
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!editing) {
    return (
      <div style={styles.tags}>
        {savedValue.map((tag) => (
          <span
            key={tag}
            onClick={startEditing}
            style={{ ...styles.tag, ...styles.editable }}
          >
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={editorRef}>
      <input
        value={tagsText}
        onChange={(e) => setTagsText(e.target.value)}
        autoFocus
        placeholder="Tag 1, Tag 2, Tag 3"
        style={styles.tagsInput}
      />

      <div style={styles.editorButtons}>
        <button type="button" onClick={() => saveTags()} style={styles.button}>
          Done
        </button>
      </div>
    </div>
  );
}

const styles = {
  editable: {
    cursor: "text",
  },

  ingredients: {
    lineHeight: 1.8,
    paddingLeft: "24px",
  },

  instructions: {
    lineHeight: 1.8,
    paddingLeft: "24px",
  },

  ingredientRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    alignItems: "center",
  },

  quantityInput: {
    width: "70px",
    padding: "5px",
    boxSizing: "border-box" as const,
  },

  itemInput: {
    width: "35%",
    padding: "5px",
    boxSizing: "border-box" as const,
  },

  instructionRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    alignItems: "flex-start",
  },

  instructionInput: {
    width: "50%",
    minHeight: "40px",
    padding: "6px",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    fontSize: "inherit",
  },

  removeButton: {
    padding: "5px 8px",
    cursor: "pointer",
  },

  editorButtons: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },

  button: {
    padding: "6px 10px",
    cursor: "pointer",
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

  tagsInput: {
    width: "100%",
    padding: "6px",
    boxSizing: "border-box" as const,
    fontSize: "inherit",
  },
};
