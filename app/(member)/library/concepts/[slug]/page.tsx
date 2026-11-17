import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkCard } from "@/app/_ui/cards";
import { concepts, findConcept, worksForConcept } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: findConcept((await params).slug)?.title ?? "Concept" };
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const concept = findConcept((await params).slug);
  if (!concept) notFound();
  const viewer = await requireViewer();
  const related = concepts.filter((other) => other.slug !== concept.slug
    && worksForConcept(other.slug).some((work) => work.concepts.includes(concept.slug)));
  return <div className="screen">
    <Link className="back" href="/library/concepts">← Concepts</Link>
    <header className="screen-head">
      <p className="eyebrow mono">Concept</p>
      <h1>{concept.title}</h1>
      <p className="intro">{concept.summary}</p>
    </header>
    <section className="block" aria-labelledby="concept-works">
      <h2 id="concept-works">Explored in</h2>
      <div className="card-grid">{worksForConcept(concept.slug).map((work) => <WorkCard key={work.slug} work={work} viewer={viewer} />)}</div>
    </section>
    {related.length > 0 && <section className="block" aria-labelledby="concept-related">
      <h2 id="concept-related">Related concepts</h2>
      <ul className="chip-list">{related.map((other) => <li key={other.slug}><Link href={"/library/concepts/" + other.slug}>{other.title}</Link></li>)}</ul>
    </section>}
  </div>;
}
