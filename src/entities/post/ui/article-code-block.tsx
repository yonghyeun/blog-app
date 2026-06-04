import type { CodeBlockNode } from "@/entities/post/types";

type ArticleCodeBlockProps = {
  node: CodeBlockNode;
};

export function ArticleCodeBlock({ node }: ArticleCodeBlockProps) {
  return (
    <figure className="border border-border bg-surface-muted p-4">
      {node.language ? (
        <figcaption className="mb-3 font-heading text-[0.75rem] leading-[1.125rem] text-muted">
          {node.language}
        </figcaption>
      ) : null}
      <pre
        className="overflow-x-auto font-mono text-[0.875rem] leading-[1.375rem] text-text"
        tabIndex={0}
      >
        <code>{node.code}</code>
      </pre>
    </figure>
  );
}
