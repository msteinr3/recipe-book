import { designTokens } from "./tokens";

const { colors, spacing, sizes, typography, radius, layout } =
  designTokens;

const fieldStyle = {
  padding: spacing.m,
  border: `1px solid ${colors.border.default}`,
  borderRadius: radius.sm,
  fontSize: typography.fontSize.s,
  boxSizing: "border-box" as const,
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
    color: colors.text.secondary,
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
    color: colors.text.secondary,
  },

  rowMediaText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.weightSemibold,
    flexShrink: 0,
  },

  category: {
    marginTop: spacing.s,
    color: colors.text.secondary,
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
    color: colors.text.primary,
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
    color: colors.text.secondary,
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
    background: colors.surface.danger,
  },

  success: {
    ...feedbackMessageBase,
    background: colors.surface.success,
  },

  emptyState: {
    padding: `${spacing.l} ${spacing.m}`,
    textAlign: "center" as const,
    border: `1px solid ${colors.border.default}`,
    borderRadius: radius.md,
  },

  // Surfaces
  card: {
    border: `1px solid ${colors.border.default}`,
    borderRadius: radius.md,
    background: colors.surface.card,
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
    background: colors.surface.overlay,
    zIndex: layout.overlayZIndex,
  },

  modal: {
    width: "100%",
    maxWidth: sizes.l,
    padding: spacing.l,
    borderRadius: radius.md,
    background: colors.surface.content,
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
