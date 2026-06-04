import type { AnchorHTMLAttributes, ReactNode } from "react";

type TextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  children: ReactNode;
};

export function TextLink({ children, className = "", ...props }: TextLinkProps) {
  return (
    <a
      className={[
        "font-heading text-[14px] leading-[22px] underline decoration-border underline-offset-4",
        "transition-colors visited:text-muted hover:text-muted hover:decoration-strong",
        "active:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-strong",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}
