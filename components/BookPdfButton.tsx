"use client";

import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  prep_minutes: number | null;
  cook_minutes: number | null;
  servings: number | null;
  category: string | null;
  tags: string[] | null;
  source: string | null;
  notes: string | null;
  image_url: string | null;
};

type Section = {
  category: string;
  recipes: Recipe[];
};

type Book = {
  title: string;
  description: string | null;
};

type Props = {
  book: Book;
  sections: Section[];
};

function BookPdfDocument({ book, sections }: Props) {
  const totalRecipes = sections.reduce(
    (total, section) => total + section.recipes.length,
    0,
  );

  return (
    <Document>
      {/* COVER */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverContent}>
          <Text style={styles.coverLabel}>RECIPE BOOK</Text>

          <Text style={styles.coverTitle}>{book.title}</Text>

          {book.description && (
            <Text style={styles.coverDescription}>{book.description}</Text>
          )}

          <Text style={styles.coverCount}>
            {totalRecipes} {totalRecipes === 1 ? "recipe" : "recipes"}
          </Text>
        </View>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>

      {/* TABLE OF CONTENTS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>Table of Contents</Text>

        {sections.map((section) => (
          <View key={section.category} style={styles.tocSection}>
            <Text style={styles.tocCategory}>{section.category}</Text>

            {section.recipes.map((recipe) => (
              <Text key={recipe.id} style={styles.tocRecipe}>
                {recipe.title}
              </Text>
            ))}
          </View>
        ))}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </Page>

      {/* SECTION DIVIDERS + RECIPES */}
      {sections.flatMap((section) => [
        <Page
          key={`section-${section.category}`}
          size="A4"
          style={styles.sectionPage}
        >
          <View style={styles.sectionContent}>
            <Text style={styles.sectionLabel}>SECTION</Text>

            <Text style={styles.sectionTitle}>{section.category}</Text>

            <Text style={styles.sectionCount}>
              {section.recipes.length}{" "}
              {section.recipes.length === 1 ? "recipe" : "recipes"}
            </Text>
          </View>

          <Text
            style={styles.footer}
            fixed
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </Page>,

        ...section.recipes.map((recipe) => (
          <Page key={`recipe-${recipe.id}`} size="A4" style={styles.page} wrap>
            <Text style={styles.recipeCategory}>
              {recipe.category ?? "Other"}
            </Text>

            <Text style={styles.recipeTitle}>{recipe.title}</Text>

            {recipe.description && (
              <Text style={styles.description}>{recipe.description}</Text>
            )}

            <View style={styles.meta}>
              {recipe.prep_minutes !== null && (
                <Text>Prep: {recipe.prep_minutes} min</Text>
              )}

              {recipe.cook_minutes !== null && (
                <Text>Cook: {recipe.cook_minutes} min</Text>
              )}

              {recipe.servings !== null && (
                <Text>Serves: {recipe.servings}</Text>
              )}
            </View>

            {recipe.ingredients.length > 0 && (
              <View style={styles.recipeSection}>
                <Text style={styles.recipeSectionTitle}>Ingredients</Text>

                {recipe.ingredients.map((ingredient, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {ingredient}
                  </Text>
                ))}
              </View>
            )}

            {recipe.instructions.length > 0 && (
              <View style={styles.recipeSection}>
                <Text style={styles.recipeSectionTitle}>Instructions</Text>

                {recipe.instructions.map((instruction, index) => (
                  <Text key={index} style={styles.listItem}>
                    {index + 1}. {instruction}
                  </Text>
                ))}
              </View>
            )}

            {recipe.tags && recipe.tags.length > 0 && (
              <View style={styles.recipeSection}>
                <Text style={styles.recipeSectionTitle}>Tags</Text>

                <Text style={styles.bodyText}>{recipe.tags.join(", ")}</Text>
              </View>
            )}

            {recipe.source && (
              <View style={styles.recipeSection}>
                <Text style={styles.recipeSectionTitle}>Source</Text>

                <Text style={styles.bodyText}>{recipe.source}</Text>
              </View>
            )}

            {recipe.notes && (
              <View style={styles.recipeSection}>
                <Text style={styles.recipeSectionTitle}>Notes</Text>

                <Text style={styles.bodyText}>{recipe.notes}</Text>
              </View>
            )}

            <Text
              style={styles.footer}
              fixed
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
            />
          </Page>
        )),
      ])}
    </Document>
  );
}

export default function BookPdfButton({ book, sections }: Props) {
  const fileName = `${book.title.replace(/[^a-z0-9]+/gi, "-") || "recipe-book"}.pdf`;

  return (
    <PDFDownloadLink
      document={<BookPdfDocument book={book} sections={sections} />}
      fileName={fileName}
      style={styles.downloadButton}
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Generate PDF")}
    </PDFDownloadLink>
  );
}

const styles = StyleSheet.create({
  coverPage: {
    position: "relative",
    padding: 60,
    fontFamily: "Helvetica",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  coverContent: {
    width: "100%",
    alignItems: "center",
  },

  coverLabel: {
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 25,
    color: "#666666",
  },

  coverTitle: {
    fontSize: 38,
    marginBottom: 25,
  },

  coverDescription: {
    fontSize: 14,
    lineHeight: 1.5,
    maxWidth: 420,
    color: "#555555",
  },

  coverCount: {
    marginTop: 35,
    fontSize: 12,
    color: "#666666",
  },

  page: {
    position: "relative",
    paddingTop: 55,
    paddingBottom: 55,
    paddingLeft: 55,
    paddingRight: 55,
    fontFamily: "Helvetica",
  },

  pageTitle: {
    fontSize: 28,
    marginBottom: 35,
  },

  tocSection: {
    marginBottom: 22,
  },

  tocCategory: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 7,
  },

  tocRecipe: {
    fontSize: 11,
    color: "#555555",
    marginLeft: 15,
    marginBottom: 4,
  },

  sectionPage: {
    position: "relative",
    padding: 55,
    fontFamily: "Helvetica",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },

  sectionContent: {
    alignItems: "center",
  },

  sectionLabel: {
    fontSize: 12,
    letterSpacing: 4,
    color: "#666666",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 34,
    marginBottom: 15,
  },

  sectionCount: {
    fontSize: 12,
    color: "#666666",
  },

  recipeCategory: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 8,
  },

  recipeTitle: {
    fontSize: 28,
    marginBottom: 20,
  },

  description: {
    fontSize: 12,
    lineHeight: 1.5,
    color: "#555555",
    marginBottom: 18,
  },

  meta: {
    flexDirection: "row",
    gap: 15,
    fontSize: 10,
    color: "#666666",
    marginBottom: 15,
  },

  recipeSection: {
    marginTop: 24,
  },

  recipeSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  listItem: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 5,
  },

  bodyText: {
    fontSize: 11,
    lineHeight: 1.6,
  },

  footer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#888888",
  },

  downloadButton: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: 8,
    backgroundColor: "#222222",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 600,
  },
});
