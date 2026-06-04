type SeparatorProps = {
  weight?: "thin" | "strong";
  className?: string;
};

export function Separator({ weight = "thin", className = "" }: SeparatorProps) {
  return (
    <hr
      className={[
        "w-full border-0 border-t",
        weight === "strong" ? "border-strong" : "border-border",
        className,
      ].join(" ")}
    />
  );
}
