"use client";

type AppErrorProps = {
  error: Error;
  reset: () => void;
};

export default function AppError({ reset }: AppErrorProps) {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto w-full max-w-[45rem] space-y-6 border border-border bg-surface-muted p-6">
        <h1 className="font-heading text-[1.375rem] font-semibold leading-[1.875rem] text-text">
          렌더러 설정 오류
        </h1>
        <p className="font-sans text-[1.0625rem] leading-[1.8125rem] text-muted">
          게시글 원천을 불러올 수 없습니다.
        </p>
        <button
          type="button"
          onClick={reset}
          className="font-heading text-[0.875rem] leading-[1.375rem] underline decoration-border underline-offset-4 transition-colors hover:text-muted hover:decoration-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-strong"
        >
          다시 시도
        </button>
      </section>
    </main>
  );
}
