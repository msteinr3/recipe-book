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
    subtleBackground: "#f7f7f7",
    tagBackground: "#f0f0f0",
    previewBackground: "#f3f3f3",
    sectionBackground: "#fafafa",
    inputBorder: "#ccc",
    overlay: "rgba(0, 0, 0, 0.45)",
    dialogOverlay: "rgba(0, 0, 0, 0.4)",
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
    compact: "10px",
    roomy: "20px",
    wide: "30px",
    mdPlus: "15px",
    lgPlus: "18px",
    sectionLarge: "50px",
    xxxl: "60px",
    pageInset: "70px",
    page: "64px",
    hero: "80px",
    section: "40px",
  },

  sizes: {
    stepNumber: "30px",
    thumbnailHeight: "52px",
    timeInputWidth: "60px",
    servingsInputWidth: "64px",
    thumbnailWidth: "70px",
    editorMinWidth: "145px",
    ingredientUnit: "180px",
    imageHeight: "200px",
    cardMinWidth: "280px",
    recipeImage: "280px",
    recipeImageSpace: "320px",
    mediumContent: "500px",
    largeContent: "700px",
    heroText: "650px",
    narrowContainer: "800px",
    heroContent: "900px",
    container: "1100px",
    bookManageInput: "250px",
    bookManageRecipeImageWidth: "90px",
    bookManageRecipeImageHeight: "70px",
    bookManagePickerImageWidth: "60px",
    bookManagePickerImageHeight: "50px",
    previewCover: "650px",
    previewSection: "500px",
    previewContent: "600px",
    previewRecipeImageWidth: "220px",
    previewRecipeImageHeight: "160px",
    recipeFieldInput: "200px",
    recipeFieldTextareaHeight: "100px",
    bookManageDescriptionHeight: "90px",
    recipeImageLayer: "400px",
    quantityInput: "70px",
    instructionInput: "40px",
    ingredientAmount: "1fr",
  },

  typography: {
    small: "14px",
    bookDescription: "17px",
    body: "16px",
    recipeDescription: "18px",
    intro: "20px",
    headingSmall: "24px",
    closeButton: "28px",
    headingMedium: "32px",
    headingLarge: "40px",
    heroTitle: "56px",
    weightNormal: "400",
    weightSemibold: "600",
    weightBold: "700",
    lineHeightBody: 1.5,
    lineHeightRelaxed: 1.6,
    lineHeightDescription: 1.7,
  },

  radius: {
    sm: "6px",
    control: "8px",
    md: "10px",
    lg: "12px",
    pill: "999px",
  },

  shadows: {
    card: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },

  layout: {
    recipeImageTop: "120px",
    overlayZIndex: 1000,
    gridColumns: "1fr 1fr",
  },
};

const { colors, spacing, sizes, typography, radius, shadows, layout } =
  designTokens;

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

const commonCardSurface = {
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  background: colors.background,
  boxShadow: shadows.card,
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

const columnForm = {
  display: "flex",
  flexDirection: "column" as const,
};

const commonSecondaryButton = {
  ...commonButtonBase,
  border: `1px solid ${colors.border}`,
  background: colors.background,
  color: colors.text,
  textDecoration: "none",
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
  zIndex: layout.overlayZIndex,
};

const commonModal = {
  width: "100%",
  maxWidth: sizes.mediumContent,
  padding: spacing.xl,
  borderRadius: radius.md,
  background: colors.background,
  boxSizing: "border-box" as const,
};

export const bookPdfDownloadButtonStyle = {
  display: "inline-block" as const,
  padding: "10px 16px",
  borderRadius: 8,
  backgroundColor: colors.text,
  color: colors.background,
  textDecoration: "none",
  fontWeight: 600,
};

const pdfCenteredPage = {
  position: "relative",
  fontFamily: "Helvetica",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
} as const;

export const bookPdfStyles = {
  coverPage: {
    ...pdfCenteredPage,
    padding: 60,
  },
  coverContent: { width: "100%", alignItems: "center" },
  coverLabel: {
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 25,
    color: colors.muted,
  },
  coverTitle: { fontSize: 38, marginBottom: 25 },
  coverDescription: {
    fontSize: 14,
    lineHeight: 1.5,
    maxWidth: 420,
    color: colors.muted,
  },
  coverCount: { marginTop: 35, fontSize: 12, color: colors.muted },
  page: {
    position: "relative",
    paddingTop: 55,
    paddingBottom: 55,
    paddingLeft: 55,
    paddingRight: 55,
    fontFamily: "Helvetica",
  },
  pageTitle: { fontSize: 28, marginBottom: 35 },
  tocSection: { marginBottom: 22 },
  tocCategory: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 7,
  },
  tocRecipe: {
    fontSize: 11,
    color: colors.muted,
    marginLeft: 15,
    marginBottom: 4,
  },
  sectionPage: {
    ...pdfCenteredPage,
    padding: 55,
  },
  sectionContent: { alignItems: "center" },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 4,
    color: colors.muted,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 34, marginBottom: 15 },
  sectionCount: { fontSize: 12, color: colors.muted },
  recipeCategory: { fontSize: 11, color: colors.muted, marginBottom: 8 },
  recipeTitle: { fontSize: 28, marginBottom: 20 },
  description: {
    fontSize: 12,
    lineHeight: 1.5,
    color: colors.muted,
    marginBottom: 18,
  },
  meta: {
    flexDirection: "row",
    gap: 15,
    fontSize: 10,
    color: colors.muted,
    marginBottom: 15,
  },
  recipeSection: { marginTop: 24 },
  recipeSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  listItem: { fontSize: 11, lineHeight: 1.6, marginBottom: 5 },
  bodyText: { fontSize: 11, lineHeight: 1.6 },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: colors.muted,
  },
} as const;

const recipeDetailsContainer = {
  maxWidth: sizes.narrowContainer,
  margin: "0 auto",
  position: "relative" as const,
};

const bookManageTitleBase = {
  fontSize: typography.headingLarge,
  margin: 0,
};
const bookManageDescriptionBase = {
  fontSize: typography.bookDescription,
  lineHeight: 1.6,
  color: colors.muted,
  marginTop: spacing.compact,
};
const bookManageButtonBase = {
  padding: `${spacing.compact} ${spacing.lg}`,
  borderRadius: radius.control,
  fontWeight: typography.weightSemibold,
};
const bookManageImageBase = {
  objectFit: "cover" as const,
  flexShrink: 0,
};
const centeredBookPreview = {
  maxWidth: sizes.heroContent,
  margin: "0 auto",
};
const bookPreviewCenteredContent = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
};
const columnList = {
  display: "flex",
  flexDirection: "column" as const,
};
const tagList = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: spacing.sm,
};
const tagBase = {
  borderRadius: radius.pill,
  background: colors.tagBackground,
};

const recipePickerButton = horizontalButton;
const recipePickerButtonAdded = {
  ...horizontalButton,
  background: colors.disabled,
  cursor: "default",
};
const recipePickerButtonText = {
  color: colors.muted,
  fontSize: typography.small,
};
const recipePickerButtonTextAdded = {
  ...recipePickerButtonText,
  color: colors.text,
  fontWeight: typography.weightSemibold,
};

const fullWidthSubmitButton = {
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
};

export const commonStyles = {
  admin: {
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.xl,
      marginBottom: spacing.section,
    },
    sectionHeading: {
      fontSize: typography.closeButton,
      marginBottom: spacing.xl,
    },
    item: {
      border: `1px solid ${colors.border}`,
      borderRadius: radius.sm,
      padding: spacing.lg,
    },
    summary: {
      cursor: "pointer",
      fontWeight: typography.weightSemibold,
    },
    details: { marginTop: spacing.lg },
    rejectButton: {
      ...commonSecondaryButton,
      color: colors.danger,
      borderColor: colors.danger,
    },
  },

  bookManage: {
    header: { marginTop: "28px" },
    titleInput: {
      width: "100%",
      maxWidth: sizes.largeContent,
      boxSizing: "border-box" as const,
      fontSize: typography.headingMedium,
      fontWeight: typography.weightBold,
      padding: `${spacing.xs} ${spacing.sm}`,
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: radius.control,
      outline: "none",
    },
    description: bookManageDescriptionBase,
    descriptionInput: {
      display: "block",
      width: "100%",
      maxWidth: sizes.largeContent,
      minHeight: sizes.bookManageDescriptionHeight,
      boxSizing: "border-box" as const,
      fontSize: typography.bookDescription,
      lineHeight: 1.6,
      padding: spacing.sm,
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: radius.control,
      resize: "vertical" as const,
    },
    role: {
      display: "inline-block",
      marginTop: spacing.md,
      padding: "5px 10px",
      borderRadius: radius.pill,
      background: colors.tagBackground,
      color: colors.muted,
      fontSize: typography.small,
      fontWeight: typography.weightSemibold,
    },
    previewButton: {
      display: "inline-block",
      ...bookManageButtonBase,
      background: colors.text,
      color: colors.background,
      textDecoration: "none",
    },
    primaryButton: {
      ...bookManageButtonBase,
      border: "none",
      background: colors.text,
      color: colors.background,
      cursor: "pointer",
    },
    emptyState: {
      marginTop: spacing.section,
      padding: spacing.wide,
      borderRadius: radius.lg,
      background: colors.subtleBackground,
    },
    sections: { marginTop: spacing.section },
    section: { marginBottom: spacing.sectionLarge },
    sectionTitle: {
      fontSize: typography.closeButton,
      marginBottom: spacing.lgPlus,
    },
    recipeList: {
      ...columnList,
      gap: spacing.md,
    },
    recipeRow: {
      display: "flex",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
    },
    recipeLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.roomy,
      flex: 1,
      textDecoration: "none",
      color: "inherit",
    },
    recipeInfo: { minWidth: 0 },
    recipeTitle: { margin: 0, fontSize: "19px" },
    recipeCategory: {
      margin: "5px 0 0",
      color: colors.muted,
      fontSize: typography.small,
    },
    recipeImage: {
      width: sizes.bookManageRecipeImageWidth,
      height: sizes.bookManageRecipeImageHeight,
      ...bookManageImageBase,
      borderRadius: radius.control,
    },
    removeButton: {
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: radius.control,
      border: `1px solid ${colors.inputBorder}`,
      background: colors.background,
      cursor: "pointer",
    },
    collaborators: {
      marginTop: spacing.xxxl,
      paddingTop: "35px",
      borderTop: `1px solid ${colors.border}`,
    },
    collaboratorsTitle: { fontSize: "26px", marginBottom: spacing.roomy },
    memberList: {
      ...columnList,
      gap: spacing.compact,
    },
    memberRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.roomy,
      padding: "12px 14px",
      border: `1px solid ${colors.border}`,
      borderRadius: radius.control,
    },
    memberRole: {
      marginLeft: spacing.compact,
      color: colors.muted,
      fontSize: typography.small,
    },
    inviteBox: { marginTop: spacing.xxl },
    inviteTitle: { fontSize: typography.intro, marginBottom: spacing.md },
    inviteRow: {
      display: "flex",
      gap: spacing.compact,
      flexWrap: "wrap" as const,
    },
    input: {
      flex: 1,
      minWidth: sizes.bookManageInput,
      padding: `${spacing.compact} ${spacing.md}`,
      borderRadius: radius.control,
      border: `1px solid ${colors.inputBorder}`,
    },
    message: { marginTop: spacing.compact, color: colors.muted },
    error: { marginTop: spacing.roomy, color: colors.danger },
    pickerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.mdPlus,
      padding: spacing.compact,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.control,
    },
    pickerRecipeInfo: {
      display: "flex",
      alignItems: "center",
      gap: spacing.md,
      minWidth: 0,
    },
    pickerImage: {
      width: sizes.bookManagePickerImageWidth,
      height: sizes.bookManagePickerImageHeight,
      ...bookManageImageBase,
      borderRadius: radius.control,
    },
    pickerCategory: {
      marginTop: spacing.xs,
      color: colors.muted,
      fontSize: "13px",
    },
    addButton: {
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: radius.control,
      border: "none",
      background: colors.text,
      color: colors.background,
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
    },
    addedButton: {
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: radius.control,
      border: `1px solid ${colors.inputBorder}`,
      background: colors.previewBackground,
      color: colors.muted,
      cursor: "default",
      whiteSpace: "nowrap" as const,
    },
    collaboratorRemoveButton: {
      padding: "6px 12px",
      border: `1px solid ${colors.inputBorder}`,
      borderRadius: radius.sm,
      background: colors.background,
      cursor: "pointer",
    },
    bookTitleOwner: {
      ...bookManageTitleBase,
      cursor: "text",
    },
    bookTitleReadOnly: {
      ...bookManageTitleBase,
      cursor: "default",
    },
    bookDescriptionOwner: { ...bookManageDescriptionBase, cursor: "text" },
    bookDescriptionReadOnly: {
      ...bookManageDescriptionBase,
      cursor: "default",
    },
  },

  bookPreview: {
    page: {
      minHeight: "100vh",
      background: colors.previewBackground,
      paddingBottom: spacing.xxxl,
    },
    messagePage: {
      ...centeredBookPreview,
      padding: `${spacing.section} ${spacing.roomy}`,
    },
    topBar: {
      ...centeredBookPreview,
      padding: `${spacing.xl} ${spacing.roomy}`,
    },
    topBarContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.mdPlus,
      flexWrap: "wrap" as const,
    },
    backLink: { color: colors.text, textDecoration: "none" },
    book: {
      width: "100%",
      ...centeredBookPreview,
      background: colors.background,
    },
    cover: {
      minHeight: sizes.previewCover,
      ...bookPreviewCenteredContent,
      padding: `${spacing.xxxl} ${spacing.section}`,
      borderBottom: `1px solid ${colors.border}`,
    },
    coverLabel: {
      fontSize: typography.small,
      letterSpacing: "4px",
      color: colors.muted,
      marginBottom: spacing.xl,
    },
    coverTitle: { fontSize: "52px", lineHeight: 1.1, margin: 0 },
    coverDescription: {
      maxWidth: sizes.previewContent,
      margin: `${spacing.wide} auto 0`,
      fontSize: typography.recipeDescription,
      lineHeight: 1.7,
      color: colors.muted,
    },
    coverRecipeCount: { marginTop: spacing.section, color: colors.muted },
    pageSection: {
      minHeight: sizes.previewCover,
      padding: spacing.pageInset,
      borderBottom: `1px solid ${colors.border}`,
    },
    pageTitle: { fontSize: "36px", marginBottom: spacing.section },
    toc: { display: "flex", flexDirection: "column" as const, gap: "28px" },
    tocSection: {
      display: "flex",
      flexDirection: "column" as const,
      gap: spacing.sm,
    },
    tocSectionLink: {
      fontSize: "21px",
      fontWeight: "700",
      color: colors.text,
      textDecoration: "none",
    },
    tocRecipes: {
      display: "flex",
      flexDirection: "column" as const,
      gap: spacing.xs,
      paddingLeft: spacing.lgPlus,
    },
    tocRecipeLink: { color: colors.muted, textDecoration: "none" },
    sectionDivider: {
      minHeight: sizes.previewSection,
      ...bookPreviewCenteredContent,
      padding: `${spacing.xxxl} ${spacing.section}`,
      background: colors.sectionBackground,
      borderBottom: `1px solid ${colors.border}`,
      scrollMarginTop: spacing.roomy,
      pageBreakBefore: "always" as const,
    },
    sectionLabel: {
      fontSize: typography.small,
      letterSpacing: "4px",
      color: colors.muted,
      marginBottom: spacing.lgPlus,
    },
    sectionTitle: { fontSize: "48px", margin: 0 },
    sectionCount: { marginTop: spacing.roomy, color: colors.muted },
    recipePage: {
      minHeight: sizes.previewCover,
      padding: `${spacing.xxxl} ${spacing.pageInset}`,
      borderBottom: `1px solid ${colors.border}`,
      scrollMarginTop: spacing.roomy,
      pageBreakBefore: "always" as const,
    },
    recipeHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.wide,
    },
    recipeHeaderInfo: { flex: 1 },
    recipeCategory: { margin: 0, color: colors.muted, fontSize: typography.small },
    recipeTitle: {
      fontSize: "38px",
      lineHeight: 1.15,
      marginTop: spacing.compact,
    },
    recipeImage: {
      width: sizes.previewRecipeImageWidth,
      height: sizes.previewRecipeImageHeight,
      objectFit: "cover" as const,
      borderRadius: radius.md,
      flexShrink: 0,
    },
    recipeDescription: {
      fontSize: typography.recipeDescription,
      lineHeight: 1.7,
      color: colors.muted,
      marginTop: "25px",
    },
    meta: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: spacing.lgPlus,
      marginTop: "22px",
      color: colors.muted,
    },
    recipeSection: { marginTop: "38px" },
    recipeSectionTitle: { fontSize: "22px", marginBottom: "14px" },
    ingredientList: { lineHeight: 1.8, paddingLeft: spacing.xl },
    instructionList: { lineHeight: 1.9, paddingLeft: spacing.xl },
    tags: tagList,
    tag: {
      ...tagBase,
      padding: "5px 10px",
    },
  },

  aboutParagraph: {
    marginTop: spacing.xl,
    lineHeight: typography.lineHeightDescription,
    fontSize: typography.recipeDescription,
  },

  invitationMessage: {
    marginTop: spacing.xl,
    lineHeight: typography.lineHeightRelaxed,
  },

  contributeSection: {
    marginTop: spacing.section,
    padding: `${spacing.section} ${spacing.lg}`,
    background: colors.accentBackground,
  },

  recipeFieldInput: {
    padding: spacing.xs,
    fontSize: "inherit",
    width: "auto",
    minWidth: sizes.recipeFieldInput,
    boxSizing: "border-box" as const,
  },

  recipeFieldTextarea: {
    padding: spacing.xs,
    fontSize: "inherit",
    width: sizes.mediumContent,
    maxWidth: "100%",
    minHeight: sizes.recipeFieldTextareaHeight,
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },

  recipeFieldSelect: {
    padding: spacing.xs,
    fontSize: "inherit",
  },

  hiddenSubmitForm: { display: "none" },

  recipeDetailsContainer,

  recipePickerButton,
  recipePickerButtonAdded,
  recipePickerButtonText,
  recipePickerButtonTextAdded,

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

  fullWidthSubmitButton,

  secondaryButton: {
    ...commonSecondaryButton,
  },

  textButton: {
    border: "none",
    background: "transparent",
    color: colors.muted,
    cursor: "pointer",
    fontSize: typography.body,
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: spacing.md,
    marginTop: spacing.xl,
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
    ...commonCardSurface,
    overflow: "hidden" as const,
  },

  cardContent: {
    padding: spacing.lg,
  },

  cardTitle: {
    margin: 0,
    fontSize: typography.headingSmall,
  },

  emptyState: commonEmptyState,

  verticalList,

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
    display: "block",
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: sizes.imageHeight,
    objectFit: "contain" as const,
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
    background: colors.dialogOverlay,
  },

  modal: commonModal,
  largeModal: {
    ...commonModal,
    maxWidth: sizes.largeContent,
    maxHeight: "85vh",
    overflowY: "auto" as const,
  },
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

  messageTitle: {
    marginTop: spacing.wide,
  },

  messageText: {
    marginTop: spacing.md,
  },

  dialogActions: verticalList,

  destructiveButton: {
    ...commonButtonBase,
    background: colors.background,
    color: colors.danger,
    border: `1px solid ${colors.danger}`,
  },

  form: {
    ...columnForm,
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  profileCard: {
    ...commonCardSurface,
    marginTop: spacing.xxl,
    padding: spacing.xl,
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
    ...columnList,
    gap: spacing.md,
    marginTop: spacing.xxl,
  },

  formSection: {
    ...columnList,
    gap: spacing.md,
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
    ...columnForm,
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

  // Recipe form grid layouts
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
    gridTemplateColumns: layout.gridColumns,
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
    top: layout.recipeImageTop,
    maxWidth: "100%",
    maxHeight: sizes.recipeImageLayer,
    overflow: "hidden",
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
    ...fieldStyle,
    width: sizes.timeInputWidth,
    padding: spacing.xs,
  },

  servingsInput: {
    ...fieldStyle,
    width: sizes.servingsInputWidth,
    padding: spacing.xs,
  },

  // Recipe list editor
  ingredients: {
    lineHeight: 1.8,
    paddingLeft: spacing.xl,
  },

  instructions: {
    lineHeight: 1.8,
    paddingLeft: spacing.xl,
  },

  ingredientEditorRow: {
    display: "flex",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "center",
  },

  quantityInput: {
    width: sizes.quantityInput,
    padding: spacing.xs,
    boxSizing: "border-box" as const,
  },

  itemInput: {
    width: "35%",
    padding: spacing.xs,
    boxSizing: "border-box" as const,
  },

  instructionEditorRow: {
    display: "flex",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "flex-start",
  },

  instructionInput: {
    width: "50%",
    minHeight: sizes.instructionInput,
    padding: "6px",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    fontSize: "inherit",
  },

  removeButton: {
    padding: `${spacing.xs} ${spacing.sm}`,
    cursor: "pointer",
  },

  editorButtons: {
    display: "flex",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  editorButton: {
    ...commonButtonBase,
    padding: `${spacing.xs} ${spacing.sm}`,
  },

  tags: {
    ...tagList,
  },

  tag: {
    ...tagBase,
    padding: `${spacing.xs} ${spacing.md}`,
  },

  tagsInput: {
    width: "100%",
    padding: spacing.xs,
    boxSizing: "border-box" as const,
    fontSize: "inherit",
  },
};
