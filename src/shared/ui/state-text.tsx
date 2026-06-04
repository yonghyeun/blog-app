import type { ReactNode } from "react";

type StateTextProps = {
  children: ReactNode;
  className?: string;
};

export function StateText({ children, className = "" }: StateTextProps) {
  return (
    <p
      className={["font-sans text-[1.0625rem] leading-[1.8125rem] text-muted", className].join(" ")}
    >
      {children}
    </p>
  );
}
