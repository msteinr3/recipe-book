"use client";

import Link from "next/link";
import ListRow from "@/components/shared/ListRow";
import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button, { getButtonStyle } from "@/components/shared/Button";
import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";
import { supabase } from "@/lib/supabase";


type AuthMode = "login" | "signup";

type Book = {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  role: "owner" | "editor";
};

type Invitation = {
  id: string;
  token: string;
  book_id: string;
  book_title: string;
  invited_by_email: string | null;
  created_at: string;
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main style={commonStyles.page}>
          <div style={commonStyles.container}>
            <p>Loading...</p>
          </div>
        </main>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [books, setBooks] = useState<Book[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [showCreateBook, setShowCreateBook] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [processingInvitationId, setProcessingInvitationId] = useState<
    string | null
  >(null);
  const showingResetPassword =
    isResettingPassword || searchParams.get("resetPassword") === "true";

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setUserId(null);
        setUserEmail(null);
        setBooks([]);
        setInvitations([]);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const currentUserId = data.user.id;

      setUserId(currentUserId);
      setUserEmail(data.user.email ?? null);

      const { data: adminStatus } = await supabase.rpc("is_admin", {
        user_id: currentUserId,
      });

      setIsAdmin(adminStatus === true);

      const { data: memberData, error: memberError } = await supabase
        .from("book_members")
        .select("book_id, role")
        .eq("user_id", currentUserId);

      if (memberError) {
        setErrorMessage(memberError.message);
        setLoading(false);
        return;
      }

      if (!memberData || memberData.length === 0) {
        setBooks([]);
      } else {
        const bookIds = memberData.map((member) => member.book_id);

        const { data: bookData, error: bookError } = await supabase
          .from("books")
          .select("id, title, description, owner_id")
          .in("id", bookIds)
          .order("title");

        if (bookError) {
          setErrorMessage(bookError.message);
          setLoading(false);
          return;
        }

        const roleByBookId = new Map(
          memberData.map((member) => [
            member.book_id,
            member.role as "owner" | "editor",
          ]),
        );

        setBooks(
          (bookData ?? []).map((book) => ({
            ...book,
            role: roleByBookId.get(book.id) ?? "editor",
          })),
        );
      }

      const { data: invitationData, error: invitationError } =
        await supabase.rpc("get_pending_book_invitations");

      if (invitationError) {
        setErrorMessage(invitationError.message);
        setLoading(false);
        return;
      }

      setInvitations((invitationData ?? []) as Invitation[]);
      setLoading(false);
    };

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResettingPassword(true);
      }

      loadProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      window.location.reload();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      window.location.reload();
      return;
    }

    setMessage(
      "Your account was created. Check your email to confirm your account, then log in.",
    );
  };

  const handleForgotPassword = async () => {
    setMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Enter your email address first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/profile?resetPassword=true`,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(
      "If an account exists for this email, a password reset link has been sent.",
    );
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMessage("The new passwords do not match.");
      return;
    }

    if (resetNewPassword.length < 6) {
      setErrorMessage("The new password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: resetNewPassword,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setResetNewPassword("");
    setResetConfirmPassword("");
    setIsResettingPassword(false);
    setMessage(
      "Your password has been reset successfully. You can now log in.",
    );

    await supabase.auth.signOut();
    router.replace("/profile");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("The new passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("The new password must be at least 6 characters.");
      return;
    }

    if (!userEmail) {
      setErrorMessage("Unable to identify your account.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      setErrorMessage("Your current password is incorrect.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsEditingAccount(false);
    setMessage("Your password was changed successfully.");
  };

  const handleCreateBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase.rpc("create_book", {
      book_title: bookTitle,
      book_description: bookDescription || null,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const newBookId = data as string;
    const newBook: Book = {
      id: newBookId,
      title: bookTitle.trim(),
      description: bookDescription || null,
      owner_id: userId ?? "",
      role: "owner",
    };

    setBooks((current) =>
      [...current, newBook].sort((a, b) => a.title.localeCompare(b.title)),
    );

    setBookTitle("");
    setBookDescription("");
    setShowCreateBook(false);
    setMessage("Your book was created.");
  };

  const handleAcceptInvitation = async (invitation: Invitation) => {
    setProcessingInvitationId(invitation.id);
    setErrorMessage("");
    setMessage("");

    const { data, error } = await supabase.rpc("accept_book_invitation", {
      p_invitation_token: invitation.token,
    });

    if (error) {
      setErrorMessage(error.message);
      setProcessingInvitationId(null);
      return;
    }

    setInvitations((current) =>
      current.filter((item) => item.id !== invitation.id),
    );

    const bookId = data as string;
    const joinedBook: Book = {
      id: bookId,
      title: invitation.book_title,
      description: null,
      owner_id: "",
      role: "editor",
    };

    setBooks((current) => {
      if (current.some((book) => book.id === bookId)) {
        return current;
      }

      return [...current, joinedBook].sort((a, b) =>
        a.title.localeCompare(b.title),
      );
    });

    setMessage(`You joined "${invitation.book_title}".`);
    setProcessingInvitationId(null);
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    setProcessingInvitationId(invitation.id);
    setErrorMessage("");
    setMessage("");

    const { error } = await supabase.rpc("decline_book_invitation", {
      p_invitation_id: invitation.id,
    });

    if (error) {
      setErrorMessage(error.message);
      setProcessingInvitationId(null);
      return;
    }

    setInvitations((current) =>
      current.filter((item) => item.id !== invitation.id),
    );

    setMessage(`You declined the invitation to "${invitation.book_title}".`);
    setProcessingInvitationId(null);
  };

  const handleDeleteBook = async (book: Book) => {
    const confirmed = window.confirm(
      `Delete "${book.title}"?\n\nThis will permanently delete the book, its contents, and collaborator access. The recipes themselves will remain in your collection.`,
    );

    if (!confirmed) return;

    setErrorMessage("");
    setMessage("");

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", book.id)
      .eq("owner_id", userId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setBooks((current) => current.filter((item) => item.id !== book.id));
    setMessage(`"${book.title}" was deleted.`);
  };

  if (loading) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (showingResetPassword) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <h1 style={commonStyles.title}>Reset Password</h1>
          <p style={commonStyles.subtitle}>
            Choose a new password for your account.
          </p>

          <form onSubmit={handleResetPassword} style={commonStyles.form}>
            <label style={commonStyles.label}>
              New Password
              <input
                type="password"
                value={resetNewPassword}
                onChange={(event) => setResetNewPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                style={commonStyles.input}
              />
            </label>

            <label style={commonStyles.label}>
              Confirm New Password
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(event) =>
                  setResetConfirmPassword(event.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
                style={commonStyles.input}
              />
            </label>

            {message && <p style={commonStyles.success}>{message}</p>}
            {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

            <Button
              viewModel={{
                type: "submit",
                content: "Reset Password",
              }}
            />
          </form>
        </div>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.container}>
          <h1 style={commonStyles.title}>
            {mode === "login" ? "Log In" : "Create an Account"}
          </h1>

          <p style={commonStyles.subtitle}>
            {mode === "login"
              ? "Log in to save and create recipe books."
              : "Create an account to save recipes and build your own books."}
          </p>

          <form onSubmit={handleSubmit} style={commonStyles.form}>
            <label style={commonStyles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
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
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                style={commonStyles.input}
              />
            </label>

            {message && <p style={commonStyles.success}>{message}</p>}

            {mode === "login" && (
              <Button
                viewModel={{
                  type: "button",
                  onClick: handleForgotPassword,
                  style: styles.forgotPasswordButton,
                  content: "Forgot password?",
                }}
              />
            )}

            {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

            <Button
              viewModel={{
                type: "submit",
                content: mode === "login" ? "Log In" : "Create Account",
              }}
            />
          </form>

          <Button
            viewModel={{
              type: "button",
              onClick: () => {
                setMode(mode === "login" ? "signup" : "login");
                setMessage("");
                setErrorMessage("");
              },
              variant: "secondary",
              content:
                mode === "login"
                  ? "Create a New Account"
                  : "Already Have an Account? Log In",
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main style={commonStyles.page}>
      <div style={commonStyles.container}>
        <h1 style={commonStyles.title}>Profile</h1>

        <div style={styles.profileCard}>
          <div style={styles.accountHeader}>
            <h2 style={commonStyles.sectionTitle}>Account</h2>

            <Button
              viewModel={{
                type: "button",
                onClick: () => {
                  setIsEditingAccount((current) => !current);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setMessage("");
                  setErrorMessage("");
                },
                style: styles.editButton,
                content: isEditingAccount ? "Cancel" : "Edit",
              }}
            />
          </div>

          <p>
            <strong>Email:</strong> {userEmail}
          </p>

          {isEditingAccount && (
            <form onSubmit={handleChangePassword} style={commonStyles.form}>
              <h3>Change Password</h3>

              <label style={commonStyles.label}>
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  style={commonStyles.input}
                />
              </label>

              <label style={commonStyles.label}>
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={commonStyles.input}
                />
              </label>

              <label style={commonStyles.label}>
                Confirm New Password
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) =>
                    setConfirmNewPassword(event.target.value)
                  }
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={commonStyles.input}
                />
              </label>

              <Button
                viewModel={{
                  type: "submit",
                  content: "Save Password",
                }}
              />
            </form>
          )}

          <Button
            viewModel={{
              type: "button",
              onClick: handleLogout,
              variant: "secondary",
              content: "Log Out",
            }}
          />
        </div>

        {invitations.length > 0 && (
          <section style={commonStyles.section}>
            <h2 style={commonStyles.sectionTitle}>Pending Invitations</h2>

            <div style={commonStyles.verticalList}>
              {invitations.map((invitation) => (
                <div key={invitation.id} style={styles.invitationRow}>
                  <div style={styles.invitationInfo}>
                    <h3 style={styles.bookTitle}>
                      {invitation.book_title}
                    </h3>

                    <p style={styles.bookDescription}>
                      {invitation.invited_by_email
                        ? `Invited by ${invitation.invited_by_email}`
                        : "You've been invited to collaborate on this book."}
                    </p>
                  </div>

                  <div style={styles.invitationActions}>
                    <Button
                      viewModel={{
                        type: "button",
                        onClick: () => handleAcceptInvitation(invitation),
                        disabled: processingInvitationId !== null,
                        content: processingInvitationId === invitation.id
                            ? "..."
                            : "Accept",
                      }}
                    />

                    <Button
                      viewModel={{
                        type: "button",
                        onClick: () => handleDeclineInvitation(invitation),
                        disabled: processingInvitationId !== null,
                        variant: "secondary",
                        content: "Decline",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {message && <p style={commonStyles.success}>{message}</p>}
        {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

        <section style={commonStyles.section}>
          <div style={commonStyles.sectionHeader}>
            <div>
              <h2 style={commonStyles.sectionTitle}>My Recipe Books</h2>

              <p style={styles.sectionDescription}>
                Books you own or collaborate on.
              </p>
            </div>

            <Button
              viewModel={{
                type: "button",
                onClick: () => {
                    setShowCreateBook((current) => !current);
                    setErrorMessage("");
                    setMessage("");
                },
                content: showCreateBook ? "Cancel" : "Create New Book",
              }}
            />
          </div>

          {showCreateBook && (
            <form
              onSubmit={handleCreateBook}
              style={styles.createBookForm}
            >
              <label style={commonStyles.label}>
                Book Title
                <input
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                  required
                  style={commonStyles.input}
                />
              </label>

              <label style={commonStyles.label}>
                Description
                <textarea
                  value={bookDescription}
                  onChange={(event) => setBookDescription(event.target.value)}
                  rows={3}
                  style={commonStyles.textarea}
                />
              </label>

              <Button
                viewModel={{
                  type: "submit",
                  content: "Create Book",
                }}
              />
            </form>
          )}

          {books.length === 0 ? (
            <div style={commonStyles.emptyState}>
              <h3>No books yet</h3>
              <p>Create your first recipe book to get started.</p>
            </div>
          ) : (
            <div style={commonStyles.verticalList}>
              {books.map((book) => (
                <ListRow
                  key={book.id}
                  viewModel={{
                    title: book.title,
                    titleLevel: 3,
                    subtitle: book.description ?? undefined,
                    href: `/books/${book.id}`,
                    media: {
                      type: "text",
                      content: book.role === "owner" ? "Owner" : "Editor",
                    },
                    action:
                      book.role === "owner"
                        ? {
                            label: "Delete",
                            onClick: () => handleDeleteBook(book),
                            variant: "danger",
                          }
                        : undefined,
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {isAdmin && (
          <section style={styles.adminSection}>
            <h2>Admin Tools</h2>
            <p>You have administrator access to the recipe collection.</p>

            <Link href="/admin" style={getButtonStyle({})}>
              Manage Recipes
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

const invitationRowBase = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: designTokens.spacing.m,
  padding: designTokens.spacing.m,
  borderRadius: designTokens.radius.md,
  background: designTokens.colors.surface.softBackground,
};

const styles = {
  forgotPasswordButton: {
    alignSelf: "flex-start",
    padding: 0,
    border: "none",
    background: "none",
    color: designTokens.colors.text.warmAccent,
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: designTokens.typography.fontSize.xs,
  },
  profileCard: {
    ...commonStyles.card,
    marginTop: designTokens.spacing.l,
    padding: designTokens.spacing.l,
  },
  accountHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: designTokens.spacing.m,
  },
  editButton: {
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.s}`,
    border: `1px solid ${designTokens.colors.border.default}`,
    borderRadius: designTokens.radius.sm,
    background: designTokens.colors.surface.content,
    cursor: "pointer",
    fontSize: designTokens.typography.fontSize.xs,
  },
  invitationRow: {
    ...invitationRowBase,
    gap: designTokens.spacing.l,
  },
  invitationInfo: {
    flex: 1,
    minWidth: 0,
  },
  bookTitle: {
    ...commonStyles.itemTitle,
  },
  bookDescription: {
    ...commonStyles.rowSubtitle,
  },
  invitationActions: {
    display: "flex",
    gap: designTokens.spacing.s,
    flexShrink: 0,
  },
  sectionDescription: {
    marginTop: designTokens.spacing.s,
    color: designTokens.colors.text.secondary,
  },
  createBookForm: {
    display: "flex",
    flexDirection: "column",
    gap: designTokens.spacing.m,
    padding: designTokens.spacing.m,
    marginBottom: designTokens.spacing.l,
    border: `1px solid ${designTokens.colors.border.default}`,
    borderRadius: designTokens.radius.md,
  },
  adminSection: {
    marginTop: designTokens.spacing.l,
    padding: designTokens.spacing.l,
    borderRadius: designTokens.radius.md,
    background: designTokens.colors.surface.softBackground,
  },
} as const;
