import type { ImageNode } from "@/entities/post/types";

type ArticleImageProps = {
  node: ImageNode;
};

export function ArticleImage({ node }: ArticleImageProps) {
  const src = node.assetUrl;

  return (
    <figure className="space-y-3">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={node.target}
          width={node.width}
          height={node.height}
          className="w-full border border-border bg-surface object-contain"
        />
      ) : (
        <div className="flex min-h-[220px] items-center justify-center border border-border bg-surface-muted px-4 text-center font-heading text-[13px] leading-[20px] text-muted">
          {node.target}
        </div>
      )}
      <figcaption className="font-heading text-[12px] leading-[18px] text-muted">
        {node.target}
      </figcaption>
    </figure>
  );
}
