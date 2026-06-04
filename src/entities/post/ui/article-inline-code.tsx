import type { ReactNode } from "react";

type ArticleInlineCodeProps = {
  children: ReactNode;
};

export function ArticleInlineCode({ children }: ArticleInlineCodeProps) {
  return (
    <code className="bg-surface-muted px-1 py-0.5 font-mono text-[14px] leading-[22px] text-text">
      {children}
    </code>
  );
}
