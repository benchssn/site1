import type { Metadata } from "next";
import Link from "next/link";
import { concepts, worksForConcept } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { LibraryTabs } from "../tabs";

export const metadata: Metadata = { title: "Concepts" };
export const dynamic = "force-dynamic";

export default async function Concepts() {
  await requireViewer();
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Library</p>
      <h1>Concepts</h1>
      <p className="intro">Short entries on the perceptual and physical ideas behind each release.</p>
    </header>
    <LibraryTabs current="/library/concepts" />
    {concepts.length === 0 && <p className="muted">No concept entries yet.</p>}
    <ul className="concept-grid">{concepts.map((concept) => <li key={concept.slug}>
      <Link href={"/library/concepts/" + concept.slug}>
        <strong>{concept.title}</strong>
        <span>{concept.summary}</span>
        <span className="mono small-text">{worksForConcept(concept.slug).map((work) => work.title).join(" · ")}</span>
      </Link>
    </li>)}</ul>
  </div>;
}
