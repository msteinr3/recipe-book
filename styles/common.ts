export const designTokens = {
  colors: {
    text: "#222",
    muted: "#666",
    border: "#ddd",
    background: "#fff",
    accentBackground: "#f7f3ed",
    error: "#ffebee",
    success: "#e8f5e9",
    disabled: "#eee",
    overlay: "rgba(0, 0, 0, 0.45)",
    danger: "#b42318",
    accentText: "#5b5147",
    primaryButton: "green",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    page: "64px",
    hero: "80px",
  },
  sizes: {
    imageHeight: "200px",
    cardMinWidth: "280px",
    heroText: "650px",
    narrowContainer: "800px",
    heroContent: "900px",
    container: "1100px",
    thumbnailWidth: "70px",
    thumbnailHeight: "52px",
    modalWidth: "500px",
    recipeImage: "280px",
    recipeImageSpace: "320px",
    editorMinWidth: "145px",
    timeInputWidth: "60px",
    servingsInputWidth: "64px",
    ingredientAmount: "1fr",
    ingredientUnit: "180px",
    stepNumber: "30px",
  },
  typography: {
    body: "16px",
    intro: "20px",
    headingSmall: "24px",
    headingMedium: "32px",
    headingLarge: "40px",
    heroTitle: "56px",
    weightNormal: "400",
    weightSemibold: "600",
    weightBold: "700",
    lineHeightBody: 1.5,
    lineHeightRelaxed: 1.6,
    lineHeightDescription: 1.7,
    small: "14px",
    closeButton: "28px",
    recipeDescription: "18px",
  },
  radius: {
    sm: "6px",
    md: "10px",
  },
  shadows: {
    card: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
};

const { colors, spacing, sizes, typography, radius, shadows } = designTokens;

const fieldStyle = {
  padding: spacing.md,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  fontSize: typography.body,
  boxSizing: "border-box" as const,
};

const feedbackStyle = {
  padding: spacing.md,
  borderRadius: radius.sm,
};

const flexRow = {
  display: "flex",
  alignItems: "center",
  gap: spacing.md,
};

const verticalList = {
  display: "flex",
  flexDirection: "column" as const,
  gap: spacing.sm,
};

const flexFill = {
  flex: 1,
  minWidth: 0,
};

const commonEmptyState = {
  padding: `${spacing.xxl} ${spacing.lg}`,
  textAlign: "center" as const,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
};

const horizontalButton = {
  ...flexRow,
  justifyContent: "space-between",
  width: "100%",
  padding: `${spacing.md} ${spacing.lg}`,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  background: colors.accentBackground,
  color: colors.text,
  cursor: "pointer",
  textAlign: "left" as const,
  fontSize: typography.body,
};

const commonTextButton = {
  border: "none",
  background: "transparent",
  fontSize: typography.closeButton,
  lineHeight: 1,
  cursor: "pointer",
  color: colors.muted,
};

const commonModalOverlay = {
  position: "fixed" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.lg,
  background: colors.overlay,
  zIndex: 1000,
};

const commonModal = {
  width: "100%",
  maxWidth: sizes.modalWidth,
  padding: spacing.xl,
  borderRadius: radius.md,
  background: colors.background,
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
  body: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    color: colors.text,
  },

  page: {
    minHeight: "100vh",
    padding: `${spacing.page} ${spacing.lg}`,
  },

  container: {
    maxWidth: sizes.container,
    margin: "0 auto",
  },

  narrowContainer: {
    maxWidth: sizes.narrowContainer,
    margin: "0 auto",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing.lg} ${spacing.xxl}`,
    borderBottom: `1px solid ${colors.border}`,
  },

  logo: {
    fontSize: typography.headingSmall,
    fontWeight: typography.weightBold,
    textDecoration: "none",
    color: colors.text,
  },

  links: {
    display: "flex",
    gap: spacing.xl,
  },

  title: {
    fontSize: typography.headingLarge,
    margin: 0,
  },

  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    color: colors.muted,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.headingSmall,
    margin: 0,
  },

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

  button: {
    ...commonButtonBase,
    padding: `${spacing.md} ${spacing.xl}`,
    border: "none",
    background: colors.text,
    color: colors.background,
    textDecoration: "none",
  },

  primaryButton: {
    ...commonButtonBase,
    border: "none",
    background: colors.primaryButton,
    color: colors.background,
    fontWeight: typography.weightSemibold,
  },

  fullWidthSubmitButton: {
    display: "block",
    width: "100%",
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    background: colors.primaryButton,
    color: colors.background,
    border: "none",
    borderRadius: radius.md,
    fontSize: typography.intro,
    fontWeight: typography.weightBold,
    cursor: "pointer",
  },

  secondaryButton: {
    ...commonButtonBase,
    border: `1px solid ${colors.border}`,
    background: colors.background,
    color: colors.text,
    textDecoration: "none",
  },

  textButton: {
    border: "none",
    background: "transparent",
    color: colors.muted,
    cursor: "pointer",
    fontSize: typography.body,
  },

  link: {
    textDecoration: "none",
    color: colors.text,
  },

  error: {
    ...feedbackStyle,
    background: colors.error,
  },

  success: {
    ...feedbackStyle,
    background: colors.success,
  },

  card: {
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    overflow: "hidden" as const,
    background: colors.background,
    boxShadow: shadows.card,
  },

  cardContent: {
    padding: spacing.lg,
  },

  cardTitle: {
    margin: 0,
    fontSize: typography.headingSmall,
  },

  emptyState: commonEmptyState,
  empty: commonEmptyState,

  verticalList,
  invitationList: verticalList,
  bookList: verticalList,

  listRow: {
    ...flexRow,
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.sm,
    background: colors.accentBackground,
  },

  horizontalLink: {
    ...flexRow,
    flex: 1,
    minWidth: 0,
    textDecoration: "none",
    color: "inherit",
  },

  flexFill,

  image: {
    width: "100%",
    height: sizes.imageHeight,
    objectFit: "cover" as const,
  },

  thumbnail: {
    width: sizes.thumbnailWidth,
    height: sizes.thumbnailHeight,
    objectFit: "contain" as const,
    borderRadius: radius.sm,
    background: colors.background,
    flexShrink: 0,
  },

  category: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontWeight: typography.weightSemibold,
  },

  description: {
    lineHeight: typography.lineHeightBody,
    marginBottom: spacing.lg,
  },

  hero: {
    padding: `${spacing.hero} ${spacing.lg}`,
    background: colors.accentBackground,
  },

  heroContent: {
    maxWidth: sizes.heroContent,
    margin: "0 auto",
    textAlign: "center" as const,
  },

  heroTitle: {
    fontSize: typography.heroTitle,
    margin: 0,
  },

  heroText: {
    maxWidth: sizes.heroText,
    margin: `${spacing.xl} auto ${spacing.xxl}`,
    fontSize: typography.intro,
    lineHeight: typography.lineHeightRelaxed,
    color: colors.muted,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${sizes.cardMinWidth}, 1fr))`,
    gap: spacing.xl,
  },

  contributeText: {
    margin: `${spacing.md} 0 ${spacing.xl}`,
    color: colors.muted,
  },

  modalOverlay: commonModalOverlay,

  dialogOverlay: {
    ...commonModalOverlay,
    background: "rgba(0, 0, 0, 0.4)",
  },

  modal: commonModal,
  dialog: commonModal,

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },

  modalCloseButton: commonTextButton,

  dialogTitle: {
    marginTop: 0,
    marginBottom: spacing.sm,
  },

  dialogText: {
    marginBottom: spacing.lg,
  },

  dialogActions: verticalList,

  destructiveButton: {
    ...commonButtonBase,
    background: colors.background,
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
  },

  pickerButton: horizontalButton,

  pickerButtonAdded: {
    background: colors.disabled,
    cursor: "default",
  },

  mutedSmallText: {
    color: colors.muted,
    fontSize: typography.small,
  },

  addedText: {
    color: colors.text,
    fontWeight: typography.weightSemibold,
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  profileCard: {
    marginTop: spacing.xxl,
    padding: spacing.xl,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    background: colors.background,
    boxShadow: shadows.card,
  },

  accountHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },

  editButton: {
    padding: `${spacing.xs} ${spacing.sm}`,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    background: colors.background,
    cursor: "pointer",
    fontSize: typography.small,
  },

  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
    marginTop: spacing.xxl,
  },

  sectionDescription: {
    marginTop: spacing.sm,
    color: colors.muted,
  },

  invitationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    background: colors.accentBackground,
  },

  invitationInfo: flexFill,

  invitationActions: {
    display: "flex",
    gap: spacing.sm,
    flexShrink: 0,
  },

  createBookForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
  },

  bookRow: {
    ...flexRow,
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radius.md,
    background: colors.accentBackground,
  },

  bookLink: {
    ...flexRow,
    justifyContent: "space-between",
    flex: 1,
    minWidth: 0,
    textDecoration: "none",
    color: "inherit",
  },

  deleteButton: {
    ...commonButtonBase,
    border: `1px solid ${colors.danger}`,
    background: colors.background,
    color: colors.danger,
    flexShrink: 0,
  },

  bookTitle: {
    margin: 0,
    fontSize: typography.intro,
  },

  bookDescription: {
    margin: `${spacing.xs} 0 0`,
    color: colors.muted,
  },

  role: {
    fontSize: typography.small,
    fontWeight: typography.weightSemibold,
    color: colors.muted,
    flexShrink: 0,
  },

  adminSection: {
    marginTop: spacing.xxl,
    padding: spacing.xl,
    borderRadius: radius.md,
    background: colors.accentBackground,
  },

  forgotPasswordButton: {
    alignSelf: "flex-start",
    padding: 0,
    border: "none",
    background: "none",
    color: colors.accentText,
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: typography.small,
  },

  ingredientRow: {
    display: "grid",
    gridTemplateColumns: `${sizes.ingredientAmount} ${sizes.ingredientUnit} auto`,
    gap: spacing.sm,
  },

  instructionRow: {
    display: "grid",
    gridTemplateColumns: `${sizes.stepNumber} 1fr auto`,
    gap: spacing.sm,
    alignItems: "start",
  },

  stepNumber: {
    paddingTop: spacing.md,
    fontWeight: typography.weightSemibold,
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.lg,
  },

  recipeTitle: {
    fontSize: typography.headingMedium,
    fontWeight: typography.weightBold,
    marginTop: spacing.xxl,
  },

  recipeImageLayer: {
    position: "absolute" as const,
    right: 0,
    top: "120px",
  },

  recipeDetailImage: {
    display: "block",
    width: "auto",
    height: "auto",
    maxWidth: sizes.recipeImage,
    maxHeight: sizes.recipeImage,
    borderRadius: radius.md,
  },

  recipeDescription: {
    width: `calc(100% - ${sizes.recipeImageSpace})`,
    marginTop: spacing.xxl,
    fontSize: typography.recipeDescription,
    lineHeight: typography.lineHeightDescription,
  },

  recipeSection: {
    marginTop: spacing.xxl,
  },

  meta: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.lg,
    marginTop: spacing.lg,
    color: colors.muted,
  },

  metaItem: {
    whiteSpace: "nowrap" as const,
  },

  editable: {
    cursor: "text",
  },

  editor: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    minWidth: sizes.editorMinWidth,
  },

  timeInput: {
    width: sizes.timeInputWidth,
    padding: spacing.xs,
    boxSizing: "border-box" as const,
  },

  servingsInput: {
    width: sizes.servingsInputWidth,
    padding: spacing.xs,
    boxSizing: "border-box" as const,
  },
};
