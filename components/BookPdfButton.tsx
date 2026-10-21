"use client";

import {
  Document,
  Page,
  PDFDownloadLink,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  bookPdfDownloadButtonStyle,
  bookPdfStyles as styles,
} from "@/styles/common";

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
      style={bookPdfDownloadButtonStyle}
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Generate PDF")}
    </PDFDownloadLink>
  );
}
