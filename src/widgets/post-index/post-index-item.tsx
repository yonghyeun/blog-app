export type PostIndexItemProps = {
  href: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  className?: string;
};

export function PostIndexItem({
  className = "",
  description,
  href,
  publishedAt,
  tags,
  title,
}: PostIndexItemProps) {
  return (
    <a
      href={href}
      className={[
        "group block border-t border-border py-4 transition-colors",
        "visited:text-muted hover:bg-surface focus-visible:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-strong active:bg-surface-muted",
        className,
      ].join(" ")}
    >
      <article className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-[13px] leading-[20px] text-muted">
          <time dateTime={publishedAt}>{publishedAt}</time>
          {tags.length > 0 ? (
            <>
              <span>/</span>
              <span>{tags.join(", ")}</span>
            </>
          ) : null}
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-[22px] font-semibold leading-[30px] text-text group-visited:text-muted">
            {title}
          </h3>
          <p className="max-w-[680px] font-sans text-[14px] leading-[22px] text-muted">
            {description}
          </p>
        </div>
      </article>
    </a>
  );
}
