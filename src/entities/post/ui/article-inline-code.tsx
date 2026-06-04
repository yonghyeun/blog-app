import type { ReactNode } from "react";

type ArticleInlineCodeProps = {
  children: ReactNode;
};

export function ArticleInlineCode({ children }: ArticleInlineCodeProps) {
  return (
    <code className="bg-surface-muted px-1 py-0.5 font-mono text-[0.875rem] leading-[1.375rem] text-text">
      {children}
    </code>
  );
}
