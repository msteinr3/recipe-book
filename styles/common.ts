import { designTokens } from "./tokens";

const { colors, spacing, sizes, typography, radius, layout } =
  designTokens;

const fieldStyle = {
  padding: spacing.md,
  border: `1px solid ${colors.lightGray}`,
  borderRadius: radius.sm,
  fontSize: typography.body,
  boxSizing: "border-box" as const,
};

const commonButtonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: radius.sm,
  cursor: "pointer",
  fontSize: typography.body,
};

export const commonStyles = {
  // Page and layout
  page: {
    minHeight: "100vh",
    padding: `${spacing.page} ${spacing.lg}`,
  },

  container: {
    maxWidth: sizes.px1100,
    margin: "0 auto",
  },

  narrowContainer: {
    maxWidth: sizes.px800,
    margin: "0 auto",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  verticalList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.sm,
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns: layout.gridColumns,
    gap: spacing.lg,
  },

  // Text
  title: {
    fontSize: typography.headingLarge,
    fontWeight: typography.weightBold,
    margin: 0,
  },

  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    color: colors.gray,
  },

  bodyDescription: {
    fontSize: typography.bodyLarge,
    lineHeight: typography.lineHeightRelaxed,
  },

  sectionTitle: {
    fontSize: typography.headingSmall,
    margin: 0,
  },

  cardTitle: {
    margin: 0,
    fontSize: typography.headingSmall,
  },

  category: {
    marginTop: spacing.sm,
    color: colors.gray,
    fontWeight: typography.weightSemibold,
  },

  link: {
    textDecoration: "none",
    color: colors.black,
  },

  // Buttons
  button: {
    ...commonButtonBase,
    padding: `${spacing.md} ${spacing.xl}`,
    border: "none",
    background: colors.black,
    color: colors.white,
    textDecoration: "none",
  },

  secondaryButton: {
    ...commonButtonBase,
    border: `1px solid ${colors.lightGray}`,
    background: colors.white,
    color: colors.black,
    textDecoration: "none",
  },

  textButton: {
    border: "none",
    background: "transparent",
    color: colors.gray,
    cursor: "pointer",
    fontSize: typography.body,
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.md,
    marginTop: spacing.xl,
  },

  // Forms
  label: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.sm,
    fontWeight: typography.weightSemibold,
  },

  input: fieldStyle,

  searchInput: {
    ...fieldStyle,
    width: "100%",
    marginBottom: spacing.lg,
  },

  textarea: {
    ...fieldStyle,
    resize: "vertical" as const,
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  // Feedback and empty states
  error: {
    padding: spacing.md,
    borderRadius: radius.sm,
    background: colors.paleRed,
  },

  success: {
    padding: spacing.md,
    borderRadius: radius.sm,
    background: colors.paleGreen,
  },

  emptyState: {
    padding: `${spacing.xxl} ${spacing.lg}`,
    textAlign: "center" as const,
    border: `1px solid ${colors.lightGray}`,
    borderRadius: radius.md,
  },

  messageTitle: {
    marginTop: spacing.wide,
  },

  messageText: {
    marginTop: spacing.md,
  },

  // Modal
  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    background: colors.blackOverlay,
    zIndex: layout.overlayZIndex,
  },

  modal: {
    width: "100%",
    maxWidth: sizes.px500,
    padding: spacing.xl,
    borderRadius: radius.md,
    background: colors.white,
    boxSizing: "border-box" as const,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },

  modalCloseButton: {
    border: "none",
    background: "transparent",
    fontSize: typography.closeButton,
    lineHeight: typography.lineHeightTitle,
    cursor: "pointer",
    color: colors.gray,
  },

  // Sections
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
    marginTop: spacing.xxl,
  },

  // Recipe editor
  ingredientRow: {
    display: "grid",
    gridTemplateColumns: `${sizes.ingredientAmount} ${sizes.px180} auto`,
    gap: spacing.sm,
  },

  instructionRow: {
    display: "grid",
    gridTemplateColumns: `${sizes.px30} 1fr auto`,
    gap: spacing.sm,
    alignItems: "start",
  },

  stepNumber: {
    paddingTop: spacing.md,
    fontWeight: typography.weightSemibold,
  },

  recipeTitle: {
    fontSize: typography.headingMedium,
    fontWeight: typography.weightBold,
    marginTop: spacing.xxl,
  },

  recipeSection: {
    marginTop: spacing.xxl,
  },

  editable: {
    cursor: "text",
  },

};
