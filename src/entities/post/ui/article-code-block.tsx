import type { CodeBlockNode } from "@/entities/post/types";

type ArticleCodeBlockProps = {
  node: CodeBlockNode;
};

export function ArticleCodeBlock({ node }: ArticleCodeBlockProps) {
  return (
    <figure className="border border-border bg-surface p-4">
      {node.language ? (
        <figcaption className="mb-3 font-heading text-[12px] leading-[18px] text-muted">
          {node.language}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto font-mono text-[14px] leading-[22px] text-text">
        <code>{node.code}</code>
      </pre>
    </figure>
  );
}
