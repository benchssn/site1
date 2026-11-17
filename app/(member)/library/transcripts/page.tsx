import type { Metadata } from "next";
import Link from "next/link";
import { AccessBadge } from "@/app/_ui/cards";
import { workHref, works } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { LibraryTabs } from "../tabs";

export const metadata: Metadata = { title: "Transcripts" };
export const dynamic = "force-dynamic";

export default async function Transcripts() {
  const viewer = await requireViewer();
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Library</p>
      <h1>Transcripts</h1>
      <p className="intro">Transcripts follow the same access rules as the work they belong to.</p>
    </header>
    <LibraryTabs current="/library/transcripts" />
    <ul className="row-list">{works.map((work) => <li key={work.slug}>
      <Link href={workHref(work)}><strong>{work.title}</strong></Link>
      <AccessBadge access={work.access} viewer={viewer} />
      <span className="muted">{work.speech === "none" ? work.soundNote : "Transcript available"}</span>
    </li>)}</ul>
    <p className="muted">Every current release is instrumental, so there’s nothing to transcribe yet.</p>
  </div>;
}
