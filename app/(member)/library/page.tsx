import type { Metadata } from "next";
import Link from "next/link";
import { PlannedBadge, WorkCard } from "@/app/_ui/cards";
import { Icon } from "@/app/_ui/icons";
import { concepts, works } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { LibraryTabs } from "./tabs";

export const metadata: Metadata = { title: "Library" };
export const dynamic = "force-dynamic";

export default async function Library() {
  const viewer = await requireViewer();
  const locked = works.filter((work) => work.access === "member").length;
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Library</p>
      <h1>Library</h1>
      <p className="intro">Every release, the ideas they explore, and the material behind them.</p>
    </header>
    <LibraryTabs current="/library" />

    <section className="block" aria-labelledby="lib-releases">
      <div className="block-head">
        <h2 id="lib-releases">Releases <span className="count mono">{works.length}</span></h2>
        <Link className="text-link" href="/library/releases">Browse releases <Icon name="arrow" size={14} /></Link>
      </div>
      {!viewer.member && locked > 0 && <p className="muted">{locked} member release{locked > 1 ? "s" : ""} marked with a lock. Open one to see how to unlock it.</p>}
      <div className="card-grid">{works.map((work) => <WorkCard key={work.slug} work={work} viewer={viewer} />)}</div>
    </section>

    <section className="block" aria-labelledby="lib-concepts">
      <div className="block-head">
        <h2 id="lib-concepts">Concepts <span className="count mono">{concepts.length}</span></h2>
        <Link className="text-link" href="/library/concepts">All concepts <Icon name="arrow" size={14} /></Link>
      </div>
      <ul className="concept-grid">{concepts.map((concept) => <li key={concept.slug}>
        <Link href={"/library/concepts/" + concept.slug}><strong>{concept.title}</strong><span>{concept.summary}</span></Link>
      </li>)}</ul>
    </section>

    <div className="split">
      <section className="block" aria-labelledby="lib-transcripts">
        <div className="block-head"><h2 id="lib-transcripts">Transcripts</h2></div>
        <p className="muted">Current releases are instrumental. Transcripts will appear here for works with spoken content.</p>
        <Link className="text-link" href="/library/transcripts">View status <Icon name="arrow" size={14} /></Link>
      </section>
      <section className="block" aria-labelledby="lib-sources">
        <div className="block-head"><h2 id="lib-sources">Sources</h2><PlannedBadge /></div>
        <p className="muted">Reading lists and references for each concept.</p>
        <Link className="text-link" href="/library/sources">What’s planned <Icon name="arrow" size={14} /></Link>
      </section>
    </div>
  </div>;
}
