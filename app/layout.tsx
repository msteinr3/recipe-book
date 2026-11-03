import type { Metadata } from "next";
import Link from "next/link";
import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";


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
            <Link href="/" style={commonStyles.link}>
              Home
            </Link>
            <Link href="/recipes" style={commonStyles.link}>
              Recipes
            </Link>
            <Link href="/about" style={commonStyles.link}>
              About
            </Link>
            <Link href="/profile" style={commonStyles.link}>
              Profile
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
    color: designTokens.colors.black,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${designTokens.spacing.m} ${designTokens.spacing.l}`,
    borderBottom: `1px solid ${designTokens.colors.lightGray}`,
  },
  logo: {
    fontSize: designTokens.typography.fontSize.m,
    fontWeight: designTokens.typography.weightBold,
    textDecoration: "none",
    color: designTokens.colors.black,
  },
  links: {
    display: "flex",
    gap: designTokens.spacing.l,
  },
} as const;
