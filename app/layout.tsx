import type { Metadata } from "next";
import Link from "next/link";
import { commonStyles } from "@/styles/common";

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
      <body style={commonStyles.body}>
        <nav style={commonStyles.nav}>
          <Link href="/" style={commonStyles.logo}>
            Recipe Book
          </Link>

          <div style={commonStyles.links}>
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
