import { commonStyles } from "@/styles/common";

export default function AboutPage() {
  return (
    <main style={commonStyles.page}>
      <div style={commonStyles.narrowContainer}>
        <h1 style={commonStyles.title}>About</h1>

        <p style={styles.paragraph}>
          Recipe Book is a place to collect, preserve, and share recipes.
        </p>

        <p style={styles.paragraph}>
          Anyone can submit a recipe. Recipes are reviewed before they are added
          to the collection.
        </p>

        <p style={styles.paragraph}>
          Over time, the collection will also be used to create recipe books
          that can be selected, organized, and printed.
        </p>
      </div>
    </main>
  );
}

const styles = {
  paragraph: {
    marginTop: "24px",
    lineHeight: 1.7,
    fontSize: "18px",
  },
};
