export const commonStyles = {
  page: {
    minHeight: "100vh",
    padding: "60px 20px",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  narrowContainer: {
    maxWidth: "800px",
    margin: "0 auto",
  },

  title: {
    fontSize: "42px",
    margin: 0,
  },

  subtitle: {
    marginTop: "10px",
    color: "#666",
  },

  label: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    fontWeight: "600",
  },

  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },

  textarea: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    resize: "vertical" as const,
  },

  button: {
    display: "inline-block",
    padding: "12px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#222",
    color: "white",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "16px",
  },

  secondaryButton: {
    display: "inline-block",
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "white",
    color: "#222",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "16px",
  },

  link: {
    textDecoration: "none",
    color: "#222",
  },

  error: {
    padding: "14px",
    borderRadius: "6px",
    background: "#ffebee",
  },

  success: {
    padding: "14px",
    borderRadius: "6px",
    background: "#e8f5e9",
  },
};
