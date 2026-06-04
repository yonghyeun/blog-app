type FoundationBadgeProps = {
  label: string;
  tone?: "neutral" | "success";
};

const toneClassNames = {
  neutral: "border-border bg-surface text-text",
  success: "border-strong bg-strong text-inverse",
} satisfies Record<NonNullable<FoundationBadgeProps["tone"]>, string>;

export function FoundationBadge({ label, tone = "neutral" }: FoundationBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center border px-2 py-1 font-heading text-[0.8125rem] font-semibold leading-none",
        toneClassNames[tone],
      ].join(" ")}
    >
      {label}
    </span>
  );
}
