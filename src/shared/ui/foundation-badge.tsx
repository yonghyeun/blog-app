import type { CSSProperties } from "react";

type FoundationBadgeProps = {
  label: string;
  tone?: "neutral" | "success";
};

const toneStyles = {
  neutral: {
    background: "#f8fafc",
    borderColor: "#cbd5e1",
    color: "#334155",
  },
  success: {
    background: "#ecfdf5",
    borderColor: "#6ee7b7",
    color: "#047857",
  },
} satisfies Record<NonNullable<FoundationBadgeProps["tone"]>, CSSProperties>;

export function FoundationBadge({ label, tone = "neutral" }: FoundationBadgeProps) {
  return (
    <span
      style={{
        ...toneStyles[tone],
        alignItems: "center",
        borderStyle: "solid",
        borderWidth: 1,
        borderRadius: 6,
        display: "inline-flex",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
        padding: "6px 8px",
      }}
    >
      {label}
    </span>
  );
}
