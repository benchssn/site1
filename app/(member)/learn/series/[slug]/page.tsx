import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessBadge, ProgressBar } from "@/app/_ui/cards";
import { Icon } from "@/app/_ui/icons";
import { findSeries, playHref, workHref } from "@/lib/catalog";
import { upgradeHref } from "@/lib/paths";
import { progressFor, seriesState } from "@/lib/progress";
import { canAccess, requireViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: findSeries((await params).slug)?.title ?? "Series" };
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = findSeries((await params).slug);
  if (!entry) notFound();
  const viewer = await requireViewer();
  const progress = await progressFor(viewer);
  const state = seriesState(entry, progress);
  const next = state.next.item;
  const nextOpen = canAccess(next.access, viewer);
  const nextNumber = state.parts.indexOf(state.next) + 1;

  return <div className="screen">
    <Link className="back" href="/learn">← Learn</Link>
    <header className="series-hero">
      <p className="eyebrow mono">Series · {entry.availability}</p>
      <h1>{entry.title}</h1>
      <p className="intro">{entry.premise}</p>
      {progress.tracked && <ProgressBar value={state.complete} total={state.total} label="Series progress" />}
      <div className="actions">
        {nextOpen
          ? <Link className="button primary" href={playHref(next)}><Icon name="play" size={14} />
            {state.finished ? "Watch again" : state.begun ? "Continue: part " + nextNumber : "Start the series"}</Link>
          : <Link className="button primary" href={upgradeHref(workHref(next))}>Unlock part {nextNumber} with Synestharium+</Link>}
      </div>
    </header>

    <section aria-labelledby="syllabus-title" className="block">
      <h2 id="syllabus-title">Syllabus</h2>
      <ol className="syllabus">{state.parts.map(({ item, note }, index) => {
        const open = canAccess(item.access, viewer);
        const status = progress.done.has(item.slug) ? "Completed" : progress.started.has(item.slug) ? "In progress" : open ? "Available" : "Locked";
        return <li key={item.slug} className={open ? "" : "is-locked"}>
          <span className="syllabus-number mono">{String(index + 1).padStart(2, "0")}</span>
          <div className="syllabus-body">
            <Link href={workHref(item)}><strong>{item.title}</strong></Link>
            <span className="muted small-text">{item.category} · {item.duration}</span>
            <p>{note}</p>
          </div>
          <div className="syllabus-side">
            <AccessBadge access={item.access} viewer={viewer} />
            <span className={"status status-" + status.toLowerCase().replace(" ", "-")}>{status}</span>
            {open ? <Link className="button secondary small" href={playHref(item)}>{item.kind === "experience" ? "Enter" : "Watch"}</Link>
              : <Link className="button secondary small" href={upgradeHref(workHref(item))}><Icon name="lock" size={14} /> Unlock</Link>}
          </div>
        </li>;
      })}</ol>
    </section>
  </div>;
}
