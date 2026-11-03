import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { designTokens } from "@/styles/tokens";

export type ButtonViewModel = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "content"
> & {
  content?: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
};

export default function Button({
  viewModel,
}: {
  viewModel: ButtonViewModel;
}) {
  const {
    content,
    style,
    size,
    variant,
    ...buttonProps
  } = viewModel;

  return (
    <button
      {...buttonProps}
      style={style ?? getButtonStyle({ size, variant })}
    >
      {content}
    </button>
  );
}

export function getButtonStyle({
  variant = "primary",
  size,
}: Pick<
  ButtonViewModel,
  "size" | "variant"
> = {}): CSSProperties {
  const resolvedSize = size ?? (variant === "primary" ? "medium" : "small");

  return {
    ...styles.base,
    ...styles.sizes[resolvedSize],
    ...styles.variants[variant],
    textDecoration: "none",
  };
}

const styles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: designTokens.spacing.s,
    borderRadius: designTokens.radius.sm,
    cursor: "pointer",
  },
  sizes: {
    small: {
      padding: `${designTokens.spacing.s} ${designTokens.spacing.m}`,
      fontSize: designTokens.typography.fontSize.s,
    },
    medium: {
      padding: `${designTokens.spacing.m} ${designTokens.spacing.l}`,
      fontSize: designTokens.typography.fontSize.s,
    },
    large: {
      padding: `${designTokens.spacing.l} ${designTokens.spacing.xl}`,
      fontSize: designTokens.typography.fontSize.m,
    },
  },
  variants: {
    primary: {
      border: "none",
      background: designTokens.colors.surface.emphasis,
      color: designTokens.colors.text.onEmphasis,
    },
    secondary: {
      border: `1px solid ${designTokens.colors.border.default}`,
      background: designTokens.colors.surface.content,
      color: designTokens.colors.text.primary,
    },
    danger: {
      border: `1px solid ${designTokens.colors.border.danger}`,
      background: designTokens.colors.surface.content,
      color: designTokens.colors.text.danger,
    },
  },
} satisfies {
  base: CSSProperties;
  sizes: Record<NonNullable<ButtonViewModel["size"]>, CSSProperties>;
  variants: Record<NonNullable<ButtonViewModel["variant"]>, CSSProperties>;
};
