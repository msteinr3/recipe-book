"use client";

import { useEffect, useRef, useState } from "react";

type RecipeMetaEditorProps = {
  recipeId: string;
  prepMinutes: number | null;
  cookMinutes: number | null;
  servings: number | null;
};

function formatTime(minutes: number | null) {
  if (minutes === null) return "";

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

function splitTime(minutes: number | null) {
  if (minutes === null) {
    return { hours: 0, minutes: 0 };
  }

  return {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  };
}

export default function RecipeMetaEditor({
  recipeId,
  prepMinutes,
  cookMinutes,
  servings,
}: RecipeMetaEditorProps) {
  const [editing, setEditing] = useState<"prep" | "cook" | "servings" | null>(
    null,
  );

  const [prep, setPrep] = useState(splitTime(prepMinutes));
  const [cook, setCook] = useState(splitTime(cookMinutes));
  const [servingsValue, setServingsValue] = useState(servings ?? 0);

  const [savedPrep, setSavedPrep] = useState(prepMinutes);
  const [savedCook, setSavedCook] = useState(cookMinutes);
  const [savedServings, setSavedServings] = useState(servings);

  const editorRef = useRef<HTMLSpanElement>(null);

  async function saveTime(
    type: "prep" | "cook",
    hours: number,
    minutes: number,
  ) {
    const totalMinutes = hours * 60 + minutes;

    const response = await fetch("/api/recipes/update-meta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeId,
        field: type === "prep" ? "prep_minutes" : "cook_minutes",
        value: totalMinutes,
      }),
    });

    const result = await response.json();

    console.log("SAVE RESULT:", response.status, result);

    if (response.ok) {
      if (type === "prep") {
        setSavedPrep(totalMinutes);
      } else {
        setSavedCook(totalMinutes);
      }
    }
  }

  async function saveServings(value: number) {
    const response = await fetch("/api/recipes/update-meta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeId,
        field: "servings",
        value,
      }),
    });

    const result = await response.json();

    console.log("SAVE RESULT:", response.status, result);

    if (response.ok) {
      setSavedServings(value);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        if (editing === "prep") {
          saveTime("prep", prep.hours, prep.minutes);
        }

        if (editing === "cook") {
          saveTime("cook", cook.hours, cook.minutes);
        }

        if (editing === "servings") {
          saveServings(servingsValue);
        }

        setEditing(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editing, prep, cook, servingsValue]);

  return (
    <div style={styles.meta}>
      <span style={styles.metaItem}>
        <strong>Prep:</strong>{" "}
        {editing === "prep" ? (
          <span ref={editorRef} style={styles.editor}>
            <input
              type="number"
              min="0"
              value={prep.hours}
              onChange={(e) =>
                setPrep({
                  ...prep,
                  hours: Number(e.target.value),
                })
              }
              style={styles.timeInput}
            />
            <span>hr</span>

            <input
              type="number"
              min="0"
              max="59"
              value={prep.minutes}
              onChange={(e) =>
                setPrep({
                  ...prep,
                  minutes: Number(e.target.value),
                })
              }
              style={styles.timeInput}
            />
            <span>min</span>
          </span>
        ) : (
          <span
            onClick={() => {
              setPrep(splitTime(savedPrep));
              setEditing("prep");
            }}
            style={styles.editable}
          >
            {formatTime(savedPrep)}
          </span>
        )}
      </span>

      <span style={styles.metaItem}>
        <strong>Cook:</strong>{" "}
        {editing === "cook" ? (
          <span ref={editorRef} style={styles.editor}>
            <input
              type="number"
              min="0"
              value={cook.hours}
              onChange={(e) =>
                setCook({
                  ...cook,
                  hours: Number(e.target.value),
                })
              }
              style={styles.timeInput}
            />
            <span>hr</span>

            <input
              type="number"
              min="0"
              max="59"
              value={cook.minutes}
              onChange={(e) =>
                setCook({
                  ...cook,
                  minutes: Number(e.target.value),
                })
              }
              style={styles.timeInput}
            />
            <span>min</span>
          </span>
        ) : (
          <span
            onClick={() => {
              setCook(splitTime(savedCook));
              setEditing("cook");
            }}
            style={styles.editable}
          >
            {formatTime(savedCook)}
          </span>
        )}
      </span>

      <span style={styles.metaItem}>
        <strong>Serves:</strong>{" "}
        {editing === "servings" ? (
          <span ref={editorRef}>
            <input
              type="number"
              min="1"
              value={servingsValue}
              onChange={(e) => setServingsValue(Number(e.target.value))}
              style={styles.servingsInput}
            />
          </span>
        ) : (
          <span
            onClick={() => {
              setServingsValue(savedServings ?? 0);
              setEditing("servings");
            }}
            style={styles.editable}
          >
            {savedServings}
          </span>
        )}
      </span>
    </div>
  );
}

const styles = {
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

  editable: {
    cursor: "text",
  },

  editor: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    minWidth: "145px",
  },

  timeInput: {
    width: "45px",
    padding: "3px",
  },

  servingsInput: {
    width: "50px",
    padding: "3px",
  },
};
