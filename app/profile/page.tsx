"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [processingInvitationId, setProcessingInvitationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
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
    } = supabase.auth.onAuthStateChange(() => {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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

    setBooks((current) =>
      [
        ...current,
        {
          id: newBookId,
          title: bookTitle.trim(),
          description: bookDescription || null,
          owner_id: userId ?? "",
          role: "owner",
        },
      ].sort((a, b) => a.title.localeCompare(b.title)),
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

    setBooks((current) => {
      if (current.some((book) => book.id === bookId)) {
        return current;
      }

      return [
        ...current,
        {
          id: bookId,
          title: invitation.book_title,
          description: null,
          owner_id: "",
          role: "editor",
        },
      ].sort((a, b) => a.title.localeCompare(b.title));
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

  if (loading) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.narrowContainer}>
          <p>Loading...</p>
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

          <form onSubmit={handleSubmit} style={styles.form}>
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
                minLength={6}
                style={commonStyles.input}
              />
            </label>

            {message && <p style={commonStyles.success}>{message}</p>}

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

        <div style={styles.profileCard}>
          <h2>Account</h2>

          <p>
            <strong>Email:</strong> {userEmail}
          </p>

          <button
            type="button"
            onClick={handleLogout}
            style={commonStyles.secondaryButton}
          >
            Log Out
          </button>
        </div>

        {invitations.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Pending Invitations</h2>

            <div style={styles.invitationList}>
              {invitations.map((invitation) => (
                <div key={invitation.id} style={styles.invitationRow}>
                  <div style={styles.invitationInfo}>
                    <h3 style={styles.bookTitle}>{invitation.book_title}</h3>

                    <p style={styles.bookDescription}>
                      {invitation.invited_by_email
                        ? `Invited by ${invitation.invited_by_email}`
                        : "You've been invited to collaborate on this book."}
                    </p>
                  </div>

                  <div style={styles.invitationActions}>
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

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>My Recipe Books</h2>

              <p style={styles.sectionDescription}>
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
            <form onSubmit={handleCreateBook} style={styles.createBookForm}>
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
            <div style={styles.empty}>
              <h3>No books yet</h3>

              <p>Create your first recipe book to get started.</p>
            </div>
          ) : (
            <div style={styles.bookList}>
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  style={styles.bookRow}
                >
                  <div>
                    <h3 style={styles.bookTitle}>{book.title}</h3>

                    {book.description && (
                      <p style={styles.bookDescription}>{book.description}</p>
                    )}
                  </div>

                  <span style={styles.role}>
                    {book.role === "owner" ? "Owner" : "Editor"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {isAdmin && (
          <section style={styles.adminSection}>
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

const styles = {
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    marginBottom: "20px",
  },

  profileCard: {
    marginTop: "30px",
    padding: "24px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  section: {
    marginTop: "40px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "28px",
  },

  sectionDescription: {
    marginTop: "8px",
    color: "#666",
  },

  invitationList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  invitationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "16px",
    borderRadius: "8px",
    background: "#f7f3ed",
  },

  invitationInfo: {
    flex: 1,
    minWidth: 0,
  },

  invitationActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },

  createBookForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },

  empty: {
    padding: "40px 20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center" as const,
  },

  bookList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  bookRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "16px",
    borderRadius: "8px",
    background: "#f7f3ed",
    textDecoration: "none",
    color: "inherit",
  },

  bookTitle: {
    margin: 0,
    fontSize: "20px",
  },

  bookDescription: {
    margin: "6px 0 0",
    color: "#666",
  },

  role: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
    flexShrink: 0,
  },

  adminSection: {
    marginTop: "40px",
    padding: "24px",
    borderRadius: "8px",
    background: "#f7f3ed",
  },
};
