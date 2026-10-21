"use client";

import Link from "next/link";
import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { commonStyles } from "@/styles/common";
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
          <div style={commonStyles.narrowContainer}>
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
        <div style={commonStyles.narrowContainer}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (showingResetPassword) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.narrowContainer}>
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

            <button type="submit" style={commonStyles.button}>
              Reset Password
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.narrowContainer}>
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
              <button
                type="button"
                onClick={handleForgotPassword}
                style={commonStyles.forgotPasswordButton}
              >
                Forgot password?
              </button>
            )}

            {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

            <button type="submit" style={commonStyles.button}>
              {mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
              setErrorMessage("");
            }}
            style={commonStyles.secondaryButton}
          >
            {mode === "login"
              ? "Create a New Account"
              : "Already Have an Account? Log In"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={commonStyles.page}>
      <div style={commonStyles.narrowContainer}>
        <h1 style={commonStyles.title}>Profile</h1>

        <div style={commonStyles.profileCard}>
          <div style={commonStyles.accountHeader}>
            <h2 style={commonStyles.sectionTitle}>Account</h2>

            <button
              type="button"
              onClick={() => {
                setIsEditingAccount((current) => !current);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setMessage("");
                setErrorMessage("");
              }}
              style={commonStyles.editButton}
            >
              {isEditingAccount ? "Cancel" : "Edit"}
            </button>
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

              <button type="submit" style={commonStyles.button}>
                Save Password
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={handleLogout}
            style={commonStyles.secondaryButton}
          >
            Log Out
          </button>
        </div>

        {invitations.length > 0 && (
          <section style={commonStyles.section}>
            <h2 style={commonStyles.sectionTitle}>Pending Invitations</h2>

            <div style={commonStyles.verticalList}>
              {invitations.map((invitation) => (
                <div key={invitation.id} style={commonStyles.invitationRow}>
                  <div style={commonStyles.invitationInfo}>
                    <h3 style={commonStyles.bookTitle}>
                      {invitation.book_title}
                    </h3>

                    <p style={commonStyles.bookDescription}>
                      {invitation.invited_by_email
                        ? `Invited by ${invitation.invited_by_email}`
                        : "You've been invited to collaborate on this book."}
                    </p>
                  </div>

                  <div style={commonStyles.invitationActions}>
                    <button
                      type="button"
                      onClick={() => handleAcceptInvitation(invitation)}
                      disabled={processingInvitationId !== null}
                      style={commonStyles.button}
                    >
                      {processingInvitationId === invitation.id
                        ? "..."
                        : "Accept"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeclineInvitation(invitation)}
                      disabled={processingInvitationId !== null}
                      style={commonStyles.secondaryButton}
                    >
                      Decline
                    </button>
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

              <p style={commonStyles.sectionDescription}>
                Books you own or collaborate on.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateBook((current) => !current);
                setErrorMessage("");
                setMessage("");
              }}
              style={commonStyles.button}
            >
              {showCreateBook ? "Cancel" : "Create New Book"}
            </button>
          </div>

          {showCreateBook && (
            <form
              onSubmit={handleCreateBook}
              style={commonStyles.createBookForm}
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

              <button type="submit" style={commonStyles.button}>
                Create Book
              </button>
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
                <div key={book.id} style={commonStyles.bookRow}>
                  <Link
                    href={`/books/${book.id}`}
                    style={commonStyles.bookLink}
                  >
                    <div>
                      <h3 style={commonStyles.bookTitle}>{book.title}</h3>

                      {book.description && (
                        <p style={commonStyles.bookDescription}>
                          {book.description}
                        </p>
                      )}
                    </div>

                    <span style={commonStyles.role}>
                      {book.role === "owner" ? "Owner" : "Editor"}
                    </span>
                  </Link>

                  {book.role === "owner" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBook(book)}
                      style={commonStyles.deleteButton}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {isAdmin && (
          <section style={commonStyles.adminSection}>
            <h2>Admin Tools</h2>
            <p>You have administrator access to the recipe collection.</p>

            <Link href="/admin" style={commonStyles.button}>
              Manage Recipes
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
