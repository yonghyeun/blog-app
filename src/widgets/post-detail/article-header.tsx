type ArticleHeaderProps = {
  title: string;
  publishedAt: string;
  tags: string[];
};

export function ArticleHeader({ publishedAt, tags, title }: ArticleHeaderProps) {
  return (
    <header className="space-y-6 border-b border-border pb-6">
      <h1 className="font-heading text-[32px] font-semibold leading-[42px] text-text">{title}</h1>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-[13px] leading-[20px] text-muted">
        <time dateTime={publishedAt}>{publishedAt}</time>
        {tags.length > 0 ? (
          <>
            <span>/</span>
            <span>{tags.join(", ")}</span>
          </>
        ) : null}
      </div>
    </header>
  );
}
