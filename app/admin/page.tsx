"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import { supabase } from "@/lib/supabase";
import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";


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
  quantity: string;
  item: string;
};

type RecipeData = {
  title?: string;
  description?: string;
  ingredients?: Ingredient[];
  instructions?: string[];
  prepMinutes?: string;
  cookMinutes?: string;
  servings?: string;
  category?: string;
  tags?: string[];
  source?: string;
  notes?: string;
  imageUrl?: string;
  recipeId?: string;
};

type RecipeSubmission = {
  id: string;
  status: "pending" | "approved" | "rejected";
  data: RecipeData;
  created_at: string;
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [submissions, setSubmissions] = useState<RecipeSubmission[]>([]);

  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(
    null,
  );

  const [editData, setEditData] = useState<RecipeData>({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAdminPage = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setLoading(false);
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_admin",
        {
          user_id: userData.user.id,
        },
      );

      if (adminError || !isAdmin) {
        setErrorMessage("You are not authorized to access the admin page.");
        setLoading(false);
        return;
      }

      setLoggedIn(true);

      const { data: pendingData, error: pendingError } = await supabase
        .from("recipe_submissions")
        .select("id, status, data, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (pendingError) {
        setErrorMessage(pendingError.message);
      } else {
        setSubmissions((pendingData ?? []) as RecipeSubmission[]);
      }

      setLoading(false);
    };

    loadAdminPage();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const startEditingSubmission = (submission: RecipeSubmission) => {
    setEditingSubmissionId(submission.id);

    setEditData({
      ...submission.data,
      ingredients: submission.data.ingredients?.map((ingredient) => ({
        ...ingredient,
      })),
      instructions: submission.data.instructions
        ? [...submission.data.instructions]
        : [],
      tags: submission.data.tags ? [...submission.data.tags] : [],
    });

    setErrorMessage("");
  };

  const cancelEditing = () => {
    setEditingSubmissionId(null);
    setEditData({});
    setErrorMessage("");
  };

  const updateField = (field: keyof RecipeData, value: string | string[]) => {
    setEditData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addIngredient = () => {
    setEditData((current) => ({
      ...current,
      ingredients: [
        ...(current.ingredients ?? []),
        {
          quantity: "",
          item: "",
        },
      ],
    }));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string,
  ) => {
    setEditData((current) => ({
      ...current,
      ingredients: (current.ingredients ?? []).map((ingredient, i) =>
        i === index
          ? {
              ...ingredient,
              [field]: value,
            }
          : ingredient,
      ),
    }));
  };

  const removeIngredient = (index: number) => {
    setEditData((current) => ({
      ...current,
      ingredients: (current.ingredients ?? []).filter((_, i) => i !== index),
    }));
  };

  const addInstruction = () => {
    setEditData((current) => ({
      ...current,
      instructions: [...(current.instructions ?? []), ""],
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setEditData((current) => ({
      ...current,
      instructions: (current.instructions ?? []).map((instruction, i) =>
        i === index ? value : instruction,
      ),
    }));
  };

  const removeInstruction = (index: number) => {
    setEditData((current) => ({
      ...current,
      instructions: (current.instructions ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleSavePendingEdit = async (submissionId: string) => {
    setErrorMessage("");

    const { error } = await supabase.rpc("update_recipe_submission", {
      submission_id: submissionId,
      submission_data: editData,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === submissionId
          ? { ...submission, data: editData }
          : submission,
      ),
    );

    cancelEditing();
  };

  const handleApprove = async (submissionId: string) => {
    setErrorMessage("");

    const { error } = await supabase.rpc("approve_recipe_submission", {
      submission_id: submissionId,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSubmissions((current) =>
      current.filter((item) => item.id !== submissionId),
    );

    window.location.reload();
  };

  const handleReject = async (submissionId: string) => {
    setErrorMessage("");

    const { error } = await supabase.rpc("reject_recipe_submission", {
      submission_id: submissionId,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSubmissions((current) =>
      current.filter((submission) => submission.id !== submissionId),
    );
  };

  const renderEditForm = (saveLabel: string, onSave: () => void) => (
    <div style={commonStyles.form}>
      <label style={commonStyles.label}>
        Recipe Name
        <input
          value={editData.title ?? ""}
          onChange={(event) => updateField("title", event.target.value)}
          style={commonStyles.input}
        />
      </label>

      <label style={commonStyles.label}>
        Description
        <textarea
          value={editData.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          rows={3}
          style={commonStyles.textarea}
        />
      </label>

      <div style={styles.formSection}>
        <h3 style={commonStyles.sectionTitle}>Ingredients</h3>

        {(editData.ingredients ?? []).map((ingredient, index) => (
          <div key={index} style={commonStyles.ingredientRow}>
            <input
              placeholder="Quantity"
              value={ingredient.quantity}
              onChange={(event) =>
                updateIngredient(index, "quantity", event.target.value)
              }
              style={commonStyles.input}
            />

            <input
              placeholder="Ingredient"
              value={ingredient.item}
              onChange={(event) =>
                updateIngredient(index, "item", event.target.value)
              }
              style={commonStyles.input}
            />

            <Button
              viewModel={{
                type: "button",
                onClick: () => removeIngredient(index),
                variant: "secondary",
                content: "Remove",
              }}
            />
          </div>
        ))}

        <Button
          viewModel={{
            type: "button",
            onClick: addIngredient,
            variant: "secondary",
            content: "+ Add Ingredient",
          }}
        />
      </div>

      <div style={styles.formSection}>
        <h3 style={commonStyles.sectionTitle}>Instructions</h3>

        {(editData.instructions ?? []).map((instruction, index) => (
          <div key={index} style={commonStyles.instructionRow}>
            <span style={commonStyles.stepNumber}>{index + 1}.</span>

            <textarea
              value={instruction}
              onChange={(event) => updateInstruction(index, event.target.value)}
              rows={3}
              style={commonStyles.textarea}
            />

            <Button
              viewModel={{
                type: "button",
                onClick: () => removeInstruction(index),
                variant: "secondary",
                content: "Remove",
              }}
            />
          </div>
        ))}

        <Button
          viewModel={{
            type: "button",
            onClick: addInstruction,
            variant: "secondary",
            content: "+ Add Step",
          }}
        />
      </div>

      <div style={commonStyles.twoColumns}>
        <label style={commonStyles.label}>
          Prep Time (minutes)
          <input
            type="number"
            value={editData.prepMinutes ?? ""}
            onChange={(event) => updateField("prepMinutes", event.target.value)}
            style={commonStyles.input}
          />
        </label>

        <label style={commonStyles.label}>
          Cook Time (minutes)
          <input
            type="number"
            value={editData.cookMinutes ?? ""}
            onChange={(event) => updateField("cookMinutes", event.target.value)}
            style={commonStyles.input}
          />
        </label>
      </div>

      <label style={commonStyles.label}>
        Servings
        <input
          type="number"
          value={editData.servings ?? ""}
          onChange={(event) => updateField("servings", event.target.value)}
          style={commonStyles.input}
        />
      </label>

      <label style={commonStyles.label}>
        Category
        <select
          value={editData.category ?? ""}
          onChange={(event) => updateField("category", event.target.value)}
          required
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
          value={(editData.tags ?? []).join(", ")}
          onChange={(event) =>
            updateField(
              "tags",
              event.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            )
          }
          style={commonStyles.input}
        />
      </label>

      <label style={commonStyles.label}>
        Source
        <input
          value={editData.source ?? ""}
          onChange={(event) => updateField("source", event.target.value)}
          style={commonStyles.input}
        />
      </label>

      <label style={commonStyles.label}>
        Image URL
        <input
          type="url"
          value={editData.imageUrl ?? ""}
          onChange={(event) => updateField("imageUrl", event.target.value)}
          style={commonStyles.input}
        />
      </label>

      <label style={commonStyles.label}>
        Notes
        <textarea
          value={editData.notes ?? ""}
          onChange={(event) => updateField("notes", event.target.value)}
          rows={5}
          style={commonStyles.textarea}
        />
      </label>

      <div style={commonStyles.buttonRow}>
        <Button
          viewModel={{
            type: "button",
            onClick: cancelEditing,
            variant: "secondary",
            content: "Cancel",
          }}
        />

        <Button
          viewModel={{
            type: "button",
            onClick: onSave,
            content: saveLabel,
          }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <h1 style={commonStyles.title}>Admin Login</h1>

          <form onSubmit={handleLogin} style={commonStyles.form}>
            <label style={commonStyles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                style={commonStyles.input}
              />
            </label>

            <label style={commonStyles.label}>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                style={commonStyles.input}
              />
            </label>

            {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

            <Button
              viewModel={{
                type: "submit",
                content: "Log In",
              }}
            />
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={commonStyles.page}>
      <div style={commonStyles.container}>
        <div style={styles.admin.header}>
          <h1 style={commonStyles.title}>Admin</h1>

          <Button
            viewModel={{
              type: "button",
              onClick: handleLogout,
              variant: "secondary",
              content: "Log Out",
            }}
          />
        </div>

        {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

        <section>
          <h2 style={styles.admin.sectionHeading}>Pending Recipes</h2>

          {submissions.length === 0 ? (
            <p>No pending recipe submissions.</p>
          ) : (
            <div style={commonStyles.verticalList}>
              {submissions.map((submission) => (
                <details key={submission.id} style={styles.admin.item}>
                  <summary style={styles.admin.summary}>
                    {submission.data.recipeId ? "Suggested Edit — " : ""}
                    {submission.data.title || "Untitled Recipe"}
                  </summary>

                  <div style={styles.admin.details}>
                    {editingSubmissionId === submission.id ? (
                      renderEditForm("Save Changes", () =>
                        handleSavePendingEdit(submission.id),
                      )
                    ) : (
                      <>
                        {submission.data.description && (
                          <p>{submission.data.description}</p>
                        )}

                        {submission.data.category && (
                          <p>
                            <strong>Category:</strong>{" "}
                            {submission.data.category}
                          </p>
                        )}

                        <div style={commonStyles.buttonRow}>
                          <Button
                            viewModel={{
                              type: "button",
                              onClick: () => startEditingSubmission(submission),
                              variant: "secondary",
                              content: "Edit",
                            }}
                          />

                          <Button
                            viewModel={{
                              type: "button",
                              onClick: () => handleApprove(submission.id),
                              content: "Approve",
                            }}
                          />

                          <Button
                            viewModel={{
                              type: "button",
                              onClick: () => handleReject(submission.id),
                              variant: "danger",
                              content: "Reject",
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles = {
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: designTokens.spacing.m,
  },
  admin: {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: designTokens.spacing.l,
      marginBottom: designTokens.spacing.l,
    },
    sectionHeading: {
      fontSize: designTokens.typography.fontSize.m,
      marginBottom: designTokens.spacing.l,
    },
    item: {
      border: `1px solid ${designTokens.colors.border.default}`,
      borderRadius: designTokens.radius.sm,
      padding: designTokens.spacing.m,
    },
    summary: {
      cursor: "pointer",
      fontWeight: designTokens.typography.weightSemibold,
    },
    details: {
      marginTop: designTokens.spacing.m,
    },
  },
} as const;
