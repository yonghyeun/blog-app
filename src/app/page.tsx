import { projectSummary } from "@/shared/project";

export default function Home() {
  return (
    <main className="page">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">{projectSummary.foundation}</p>
        <h1 id="page-title">{projectSummary.name}</h1>
        <p>{projectSummary.description}</p>
      </section>
    </main>
  );
}
