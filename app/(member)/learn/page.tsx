import type { Metadata } from "next";
import Link from "next/link";
import { AccessBadge, ProgressBar } from "@/app/_ui/cards";
import { series, seriesWorks } from "@/lib/catalog";
import { progressFor, seriesState } from "@/lib/progress";
import { requireViewer } from "@/lib/viewer";
import { LearnTabs } from "./tabs";

export const metadata: Metadata = { title: "Learn" };
export const dynamic = "force-dynamic";

export default async function Learn() {
  const viewer = await requireViewer();
  const progress = await progressFor(viewer);
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Learn</p>
      <h1>Series</h1>
      <p className="intro">Ordered syllabi of short works. Each part builds on the one before.</p>
    </header>
    <LearnTabs current="series" />
    {series.length === 0 && <p className="muted">No series are published yet.</p>}
    <ul className="series-list">{series.map((entry) => {
      const state = seriesState(entry, progress);
      const memberParts = seriesWorks(entry).filter(({ item }) => item.access === "member").length;
      return <li key={entry.slug}>
        <Link href={"/learn/series/" + entry.slug} className="series-card">
          <span className="mono">{entry.availability}</span>
          <strong>{entry.title}</strong>
          <span className="series-premise">{entry.premise}</span>
          <span className="series-foot">
            {memberParts > 0 ? <AccessBadge access="member" viewer={viewer} /> : <AccessBadge access="free" viewer={viewer} />}
            {memberParts > 0 && <span className="muted small-text">{state.total - memberParts} free · {memberParts} member</span>}
          </span>
          {progress.tracked && <ProgressBar value={state.complete} total={state.total} label={entry.title + " progress"} />}
        </Link>
      </li>;
    })}</ul>
  </div>;
}
