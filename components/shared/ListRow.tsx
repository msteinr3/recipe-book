import Link from "next/link";
import Button from "@/components/shared/Button";
import { commonStyles } from "@/styles/common";
import { designTokens } from "@/styles/tokens";
import type { ButtonViewModel } from "@/components/shared/Button";

export type ListRowViewModel = {
  title: string;
  titleLevel?: 2 | 3 | 4;
  subtitle?: string;
  href?: string;
  media?:
    | { type: "image"; src: string; alt: string }
    | { type: "text"; content: string };
  action?: {
    label: string;
    onClick: () => void;
  } & Pick<
    ButtonViewModel,
    "size" | "variant"
  >;
};

type ListRowProps = {
  viewModel: ListRowViewModel;
};

export default function ListRow({ viewModel }: ListRowProps) {
  const {
    title,
    titleLevel = 2,
    subtitle,
    href,
    media,
    action,
  } = viewModel;
  const Title = titleLevel === 4 ? "h4" : titleLevel === 3 ? "h3" : "h2";
  const content = (
    <>
      <div style={styles.info}>
        <Title style={commonStyles.itemTitle}>{title}</Title>
        {subtitle && <div style={commonStyles.rowSubtitle}>{subtitle}</div>}
      </div>

      {media?.type === "image" ? (
        <img src={media.src} alt={media.alt} style={styles.image} />
      ) : (
        media?.type === "text" && (
          <span style={commonStyles.rowMediaText}>{media.content}</span>
        )
      )}
    </>
  );

  return (
    <div style={styles.row}>
      {href ? (
        <Link href={href} style={styles.link}>
          {content}
        </Link>
      ) : (
        <div style={styles.link}>{content}</div>
      )}

      {action && (
        <Button
          viewModel={{
            type: "button",
            onClick: action.onClick,
            size: action.size ?? "small",
            variant: action.variant ?? "secondary",
            content: action.label,
          }}
        />
      )}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: designTokens.spacing.m,
    padding: `${designTokens.spacing.s} ${designTokens.spacing.m}`,
    borderRadius: designTokens.radius.sm,
    background: designTokens.colors.surface.softBackground,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: designTokens.spacing.m,
    flex: 1,
    minWidth: 0,
    textDecoration: "none",
    color: "inherit",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  image: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
    borderRadius: designTokens.radius.sm,
    background: designTokens.colors.surface.content,
    flexShrink: 0,
  },
} as const;
