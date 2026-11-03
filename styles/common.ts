import { designTokens } from "./tokens";

const { colors, spacing, sizes, typography, radius, layout } =
  designTokens;

const fieldStyle = {
  padding: spacing.m,
  border: `1px solid ${colors.lightGray}`,
  borderRadius: radius.sm,
  fontSize: typography.fontSize.s,
  boxSizing: "border-box" as const,
};

const commonButtonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.s,
  padding: `${spacing.s} ${spacing.m}`,
  borderRadius: radius.sm,
  cursor: "pointer",
  fontSize: typography.fontSize.s,
};

const columnLayoutBase = {
  display: "flex",
  flexDirection: "column" as const,
};

const feedbackMessageBase = {
  padding: spacing.m,
  borderRadius: radius.sm,
};

export const commonStyles = {
  // Page and layout
  page: {
    minHeight: "100vh",
    padding: `${spacing.xl} ${spacing.m}`,
  },

  container: {
    maxWidth: sizes.xl,
    margin: "0 auto",
  },

  section: {
    ...columnLayoutBase,
    gap: spacing.m,
    marginTop: spacing.l,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.l,
    marginBottom: spacing.l,
  },

  verticalList: {
    ...columnLayoutBase,
    gap: spacing.s,
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns: layout.gridColumns,
    gap: spacing.m,
  },

  // Text
  title: {
    fontSize: typography.fontSize.l,
    fontWeight: typography.weightBold,
    margin: 0,
  },

  subtitle: {
    marginTop: spacing.s,
    marginBottom: spacing.l,
    color: colors.gray,
  },

  bodyDescription: {
    fontSize: typography.fontSize.m,
    lineHeight: typography.lineHeightRelaxed,
  },

  sectionTitle: {
    fontSize: typography.fontSize.m,
    margin: 0,
  },

  itemTitle: {
    fontSize: typography.fontSize.m,
    margin: 0,
  },

  rowSubtitle: {
    marginTop: spacing.xs,
    color: colors.gray,
  },

  rowMediaText: {
    color: colors.gray,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.weightSemibold,
    flexShrink: 0,
  },

  category: {
    marginTop: spacing.s,
    color: colors.gray,
    fontWeight: typography.weightSemibold,
  },

  messageTitle: {
    marginTop: spacing.l,
  },

  messageText: {
    marginTop: spacing.m,
  },

  link: {
    textDecoration: "none",
    color: colors.black,
  },

  // Buttons
  buttonBase: commonButtonBase,

  button: {
    ...commonButtonBase,
    padding: `${spacing.m} ${spacing.l}`,
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

  dangerButton: {
    ...commonButtonBase,
    border: `1px solid ${colors.red}`,
    background: colors.white,
    color: colors.red,
    flexShrink: 0,
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.m,
    marginTop: spacing.l,
  },

  modalCloseButton: {
    border: "none",
    background: "transparent",
    fontSize: typography.fontSize.m,
    lineHeight: typography.lineHeightTitle,
    cursor: "pointer",
    color: colors.gray,
  },

  // Forms
  label: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.s,
    fontWeight: typography.weightSemibold,
  },

  input: fieldStyle,

  searchInput: {
    ...fieldStyle,
    width: "100%",
    marginBottom: spacing.m,
  },

  textarea: {
    ...fieldStyle,
    resize: "vertical" as const,
  },

  form: {
    ...columnLayoutBase,
    gap: spacing.l,
    marginBottom: spacing.l,
  },

  // Feedback and empty states
  error: {
    ...feedbackMessageBase,
    background: colors.paleRed,
  },

  success: {
    ...feedbackMessageBase,
    background: colors.paleGreen,
  },

  emptyState: {
    padding: `${spacing.l} ${spacing.m}`,
    textAlign: "center" as const,
    border: `1px solid ${colors.lightGray}`,
    borderRadius: radius.md,
  },

  // Surfaces
  card: {
    border: `1px solid ${colors.lightGray}`,
    borderRadius: radius.md,
    background: colors.white,
    boxShadow: designTokens.shadows.card,
  },

  // Modal
  modalOverlay: {
    position: "fixed" as const,
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.m,
    background: colors.blackOverlay,
    zIndex: layout.overlayZIndex,
  },

  modal: {
    width: "100%",
    maxWidth: sizes.l,
    padding: spacing.l,
    borderRadius: radius.md,
    background: colors.white,
    boxSizing: "border-box" as const,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.m,
    marginBottom: spacing.m,
  },

  // Recipe editor
  ingredientRow: {
    display: "grid",
    gridTemplateColumns: `1fr ${sizes.s} auto`,
    gap: spacing.s,
  },

  instructionRow: {
    display: "grid",
    gridTemplateColumns: `${sizes.xs} 1fr auto`,
    gap: spacing.s,
    alignItems: "start",
  },

  stepNumber: {
    paddingTop: spacing.m,
    fontWeight: typography.weightSemibold,
  },

  editable: {
    cursor: "text",
  },
};
