"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { commonStyles } from "@/styles/common";
import { supabase } from "@/lib/supabase";

export default function BookInvitePage() {
  const params = useParams();
  const router = useRouter();

  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }

      setLoggedIn(true);
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleAccept = async () => {
    setMessage("");
    setErrorMessage("");
    setLoading(true);

    const { data, error } = await supabase.rpc("accept_book_invitation", {
      invitation_token: token,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(`/books/${data}`);
  };

  if (loading) {
    return (
      <main style={commonStyles.page}>
        <div style={commonStyles.narrowContainer}>
          <p>Loading invitation...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={commonStyles.page}>
      <div style={commonStyles.narrowContainer}>
        <h1 style={commonStyles.title}>Book Invitation</h1>

        {!loggedIn ? (
          <>
            <p style={styles.message}>
              You've been invited to collaborate on a recipe book.
            </p>

            <p style={styles.message}>
              Log in or create an account using the email address that received
              this invitation.
            </p>

            <Link href="/profile" style={commonStyles.button}>
              Log In / Create Account
            </Link>
          </>
        ) : (
          <>
            <p style={styles.message}>
              You've been invited to collaborate on a recipe book.
            </p>

            {errorMessage && <p style={commonStyles.error}>{errorMessage}</p>}

            {message && <p style={commonStyles.success}>{message}</p>}

            <button
              type="button"
              onClick={handleAccept}
              style={commonStyles.button}
            >
              Accept Invitation
            </button>
          </>
        )}
      </div>
    </main>
  );
}

const styles = {
  message: {
    marginTop: "20px",
    lineHeight: 1.6,
  },
};
