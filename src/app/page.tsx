import { projectSummary } from "@/shared/project";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-[45rem]" aria-labelledby="page-title">
        <p className="mb-4 font-heading text-[0.8125rem] font-semibold leading-[1.25rem] text-muted">
          {projectSummary.foundation}
        </p>
        <h1
          id="page-title"
          className="mb-5 font-heading text-[2rem] font-semibold leading-[2.625rem] text-text"
        >
          {projectSummary.name}
        </h1>
        <p className="font-sans text-[1.0625rem] leading-[1.8125rem] text-text">
          {projectSummary.description}
        </p>
      </section>
    </main>
  );
}
