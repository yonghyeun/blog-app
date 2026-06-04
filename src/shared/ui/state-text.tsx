import type { ReactNode } from "react";

type StateTextProps = {
  children: ReactNode;
  className?: string;
};

export function StateText({ children, className = "" }: StateTextProps) {
  return (
    <p className={["font-sans text-[17px] leading-[29px] text-muted", className].join(" ")}>
      {children}
    </p>
  );
}
