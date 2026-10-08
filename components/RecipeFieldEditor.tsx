"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RecipeFieldEditorProps = {
  recipeId: string;
  field: "title" | "category" | "description" | "source" | "notes";
  value: string;
  multiline?: boolean;
  placeholder?: string;
  children?: ReactNode;
  onChange?: (value: string) => void;
};

const categories = [
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

export default function RecipeFieldEditor({
  recipeId,
  field,
  value,
  multiline = false,
  placeholder = "Add...",
  children,
  onChange,
}: RecipeFieldEditorProps) {
  const [editing, setEditing] = useState(false);
  const [savedValue, setSavedValue] = useState(value);
  const [editValue, setEditValue] = useState(value);

  const editorRef = useRef<HTMLSpanElement>(null);

  async function save(valueToSave = editValue, closeAfterSave = true) {
    if (valueToSave === savedValue) {
      if (closeAfterSave) {
        setEditing(false);
      }
      return;
    }

    if (onChange) {
      onChange(valueToSave);
      setSavedValue(valueToSave);

      if (closeAfterSave) {
        setEditing(false);
      }

      return;
    }

    const response = await fetch("/api/recipes/update-meta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeId,
        field,
        value: valueToSave,
      }),
    });

    const result = await response.json();

    console.log("SAVE RESULT:", response.status, result);

    if (response.ok) {
      setSavedValue(valueToSave);
    }

    if (closeAfterSave) {
      setEditing(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        save(editValue, true);
      }
    }

    if (editing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editing, editValue, savedValue]);

  if (editing) {
    return (
      <span ref={editorRef}>
        {field === "category" ? (
          <select
            value={editValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setEditValue(newValue);
              save(newValue, false);
            }}
            autoFocus
            style={styles.select}
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            style={styles.textarea}
          />
        ) : (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            style={styles.input}
          />
        )}
      </span>
    );
  }

  return (
    <span
      onClick={() => {
        setEditValue(savedValue);
        setEditing(true);
      }}
      style={styles.editable}
    >
      {children || savedValue || placeholder}
    </span>
  );
}

const styles = {
  editable: {
    cursor: "text",
  },

  input: {
    padding: "4px 6px",
    fontSize: "inherit",
    width: "auto",
    minWidth: "200px",
    boxSizing: "border-box" as const,
  },

  textarea: {
    padding: "6px",
    fontSize: "inherit",
    width: "500px",
    maxWidth: "100%",
    minHeight: "100px",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },

  select: {
    padding: "4px 6px",
    fontSize: "inherit",
  },
};
