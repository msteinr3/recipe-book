"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecipeEditor from "@/components/RecipeEditor";
import { commonStyles } from "@/styles/common";

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

type RecipePageContentProps = {
  recipe: Recipe;
};

export default function RecipePageContent({ recipe }: RecipePageContentProps) {
  const router = useRouter();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [submitRequest, setSubmitRequest] = useState(0);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowLeaveDialog(true);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  function handleBack(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasUnsavedChanges) {
      return;
    }

    event.preventDefault();
    setShowLeaveDialog(true);
  }

  function leaveWithoutSubmitting() {
    setHasUnsavedChanges(false);
    router.push("/recipes");
  }

  function submitChanges() {
    setShowLeaveDialog(false);
    setSubmitRequest((current) => current + 1);
  }

  function handleSubmitComplete() {
    setHasUnsavedChanges(false);
    router.push("/recipes");
  }

  return (
    <>
      <Link href="/recipes" onClick={handleBack} style={commonStyles.link}>
        ← Back to Recipes
      </Link>

      <RecipeEditor
        recipe={recipe}
        isAdmin={false}
        onUnsavedChanges={setHasUnsavedChanges}
        submitRequest={submitRequest}
        onSubmitComplete={handleSubmitComplete}
      />

      {showLeaveDialog && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h2 style={styles.dialogTitle}>You have unsaved changes</h2>

            <p style={styles.dialogText}>
              What would you like to do with your changes?
            </p>

            <div style={styles.dialogActions}>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveDialog(false);
                }}
                style={commonStyles.secondaryButton}
              >
                Stay
              </button>

              <button
                type="button"
                onClick={leaveWithoutSubmitting}
                style={styles.leaveButton}
              >
                Leave Without Submitting
              </button>

              <button
                type="button"
                onClick={submitChanges}
                style={styles.submitButton}
              >
                Submit Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  dialog: {
    background: "white",
    borderRadius: "10px",
    padding: "28px",
    maxWidth: "500px",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  dialogTitle: {
    marginTop: 0,
    marginBottom: "12px",
  },

  dialogText: {
    marginBottom: "24px",
  },

  dialogActions: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },

  leaveButton: {
    padding: "10px 14px",
    background: "white",
    color: "#b00020",
    border: "1px solid #b00020",
    borderRadius: "6px",
    cursor: "pointer",
  },

  submitButton: {
    padding: "10px 14px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
