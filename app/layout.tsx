import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recipe Book",
  description: "A collection of recipes shared and curated together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <nav style={styles.nav}>
          <Link href="/" style={styles.logo}>
            Recipe Book
          </Link>

          <div style={styles.links}>
            <Link href="/" style={styles.link}>
              Home
            </Link>

            <Link href="/recipes" style={styles.link}>
              Recipes
            </Link>

            <Link href="/about" style={styles.link}>
              About
            </Link>

            <Link href="/admin" style={styles.link}>
              Admin
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    color: "#222",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 32px",
    borderBottom: "1px solid #ddd",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    textDecoration: "none",
    color: "#222",
  },
  links: {
    display: "flex",
    gap: "24px",
  },
  link: {
    textDecoration: "none",
    color: "#222",
  },
};
