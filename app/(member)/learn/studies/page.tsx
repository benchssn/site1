import type { Metadata } from "next";
import { WorkCard } from "@/app/_ui/cards";
import { studies } from "@/lib/catalog";
import { progressFor } from "@/lib/progress";
import { requireViewer } from "@/lib/viewer";
import { LearnTabs } from "../tabs";

export const metadata: Metadata = { title: "Studies" };
export const dynamic = "force-dynamic";

export default async function Studies() {
  const viewer = await requireViewer();
  const progress = await progressFor(viewer);
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Learn</p>
      <h1>Studies</h1>
      <p className="intro">Standalone audiovisual works. Watch them in any order, on their own or as a short practice of attention.</p>
    </header>
    <LearnTabs current="studies" />
    {studies.length === 0 && <p className="muted">No standalone studies are published yet.</p>}
    <div className="card-grid">{studies.map((work) => <WorkCard key={work.slug} work={work} viewer={viewer}
      status={progress.done.has(work.slug) ? "Completed" : progress.started.has(work.slug) ? "In progress" : undefined} />)}</div>
  </div>;
}
