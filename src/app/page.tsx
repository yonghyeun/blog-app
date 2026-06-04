import { projectSummary } from "@/shared/project";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-[720px]" aria-labelledby="page-title">
        <p className="mb-4 font-heading text-[13px] font-semibold leading-[20px] text-muted">
          {projectSummary.foundation}
        </p>
        <h1
          id="page-title"
          className="mb-5 font-heading text-[32px] font-semibold leading-[42px] text-text"
        >
          {projectSummary.name}
        </h1>
        <p className="font-sans text-[17px] leading-[29px] text-text">
          {projectSummary.description}
        </p>
      </section>
    </main>
  );
}
