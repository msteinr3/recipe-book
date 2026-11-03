import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";


export default function AboutPage() {
  return (
    <main style={commonStyles.page}>
      <div style={commonStyles.narrowContainer}>
        <h1 style={commonStyles.title}>About</h1>

        <p style={styles.aboutParagraph}>
          Recipe Book is a place to collect, preserve, and share recipes.
        </p>

        <p style={styles.aboutParagraph}>
          Anyone can submit a recipe. Recipes are reviewed before they are added
          to the collection.
        </p>

        <p style={styles.aboutParagraph}>
          Over time, the collection will also be used to create recipe books
          that can be selected, organized, and printed.
        </p>
      </div>
    </main>
  );
}

const styles = {
  aboutParagraph: {
    marginTop: designTokens.spacing.xl,
    ...commonStyles.bodyDescription,
  },
} as const;
