import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryCard, ThemeList } from "@/app/_ui/archive-ui";
import { archive, conceptsFor, findStudioWork, relatedEntries } from "@/lib/archive";

export const dynamicParams = false;
export const generateStaticParams = () =>
  archive.filter((entry) => entry.format !== "transmission").map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const work = findStudioWork((await params).slug);
  return work ? { title: work.title, description: work.description } : {};
}

// Public page for a studio work: a wordless study, or an interactive experiment.
export default async function StudioWork({ params }: { params: Promise<{ slug: string }> }) {
  const work = findStudioWork((await params).slug);
  if (!work) notFound();
  const experiment = work.kind === "experience";
  const concepts = conceptsFor(work);
  const related = relatedEntries(work.slug);

  return <article className="wrap page studio-work">
    <Link className="back" href="/archive">← Archive</Link>
    <header className="page-head">
      <p className="entry-meta mono">
        <span>{experiment ? "Experiment" : "Study"}</span>
        <span>{work.category}</span>
        {!experiment && <span>{work.duration}</span>}
      </p>
      <h1>{work.title}</h1>
      <p className="lede">{work.description}</p>
      <ThemeList ids={work.themes} />
    </header>

    <div className="stage">
      {work.media.type === "public" ? (
        <video controls playsInline preload="none" poster={work.poster} src={work.media.src} aria-label={work.title + ", film"} />
      ) : (
        <div className="stage-still">
          <Image src={work.poster} alt="" width={1680} height={920} sizes="(max-width: 1120px) 100vw, 1120px" />
        </div>
      )}
      <p className="fineprint">{work.soundNote}</p>
    </div>

    {experiment && <div className="callout">
      <p>The experiment runs in your browser, full-frame, with optional sound. It is part of Synestharium+ membership.</p>
      <div className="actions">
        <Link className="button primary" href={"/spaces/" + work.slug}>Open the experiment</Link>
        <Link className="text-link" href="/plans">About membership</Link>
      </div>
    </div>}

    {concepts.length > 0 && <section className="detail-block" aria-labelledby="concepts-title">
      <h2 id="concepts-title" className="label mono">The ideas underneath</h2>
      <dl className="concepts">{concepts.map((concept) => <div key={concept.slug}>
        <dt>{concept.title}</dt><dd>{concept.summary}</dd>
      </div>)}</dl>
    </section>}

    {related.length > 0 && <section className="detail-block" aria-labelledby="related-title">
      <h2 id="related-title" className="label mono">Related</h2>
      <div className="entry-grid">{related.map((item) => <EntryCard key={item.slug} entry={item} />)}</div>
    </section>}
  </article>;
}
