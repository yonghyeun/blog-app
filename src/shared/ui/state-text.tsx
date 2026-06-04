import type { ReactNode } from "react";

type StateTextProps = {
  children: ReactNode;
  className?: string;
};

export function StateText({ children, className = "" }: StateTextProps) {
  return (
    <p className={["font-heading text-[22px] leading-[30px] text-muted", className].join(" ")}>
      {children}
    </p>
  );
}
