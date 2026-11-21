import type { Metadata } from "next";
import Link from "next/link";
import { LiveBadge, PlannedBadge, ProgressBar, WorkCard } from "@/app/_ui/cards";
import { Icon } from "@/app/_ui/icons";
import { playHref, series, spaces, workHref, works } from "@/lib/catalog";
import { rooms } from "@/lib/collective";
import { upgradeHref } from "@/lib/paths";
import { progressFor, seriesState } from "@/lib/progress";
import { canAccess, requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Home" };
export const dynamic = "force-dynamic";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const viewer = await requireViewer();
  const progress = await progressFor(viewer);
  const featured = series[0];
  const state = featured ? seriesState(featured, progress) : null;
  const next = state?.next?.item;
  const nextOpen = next ? canAccess(next.access, viewer) : false;
  const space = spaces.find((entry) => entry.status === "active");
  const doneLabel = (slug: string) => progress.done.has(slug) ? "Completed" : progress.started.has(slug) ? "In progress" : undefined;

  return <div className="screen">
    {welcome && viewer.member && <p className="notice notice-success" role="status">Welcome to Synestharium+. Everything is unlocked.</p>}
    <header className="screen-head">
      <p className="eyebrow mono">Home</p>
      <h1>Welcome back</h1>
    </header>

    <div className="dash-grid">
      <section className="tile tile-status" aria-labelledby="status-title">
        <h2 id="status-title" className="tile-label mono">Membership</h2>
        <p className="tile-big">{viewer.member ? "Synestharium+" : "Free account"}</p>
        <p className="muted">{viewer.statusUnavailable ? "Membership status is temporarily unavailable."
          : viewer.member && viewer.accessUntil ? "Access through " + formatDate(viewer.accessUntil)
            : "The Library and progress tracking."}</p>
        <div className="actions">
          {viewer.member ? <Link className="button secondary small" href="/account">Manage membership</Link>
            : <Link className="button primary small" href="/account/plan?return=/dashboard">Upgrade</Link>}
        </div>
      </section>

      {featured && state && next && <section className="tile tile-continue" aria-labelledby="continue-title">
        <h2 id="continue-title" className="tile-label mono">{state.begun ? "Continue your series" : "Start a series"}</h2>
        <p className="tile-big">{featured.title}</p>
        {progress.tracked
          ? <ProgressBar value={state.complete} total={state.total} label={featured.title + " progress"} />
          : <p className="muted">Progress tracking isn’t available right now.</p>}
        <p className="muted">{state.finished ? "You’ve completed every part. Revisit any work below."
          : <>Next: <strong>{next.title}</strong>{!nextOpen && " (Synestharium+)"}</>}</p>
        <div className="actions">
          {state.finished ? <Link className="button secondary small" href={"/learn/series/" + featured.slug}>Open syllabus</Link>
            : nextOpen ? <Link className="button primary small" href={playHref(next)}><Icon name="play" size={14} /> {state.begun ? "Continue" : "Start"}</Link>
              : <Link className="button primary small" href={upgradeHref(workHref(next))}>Unlock part {state.parts.indexOf(state.next) + 1}</Link>}
          <Link className="button secondary small" href={"/learn/series/" + featured.slug}>Syllabus</Link>
        </div>
      </section>}

      <section className="tile" aria-labelledby="collective-tile">
        <h2 id="collective-tile" className="tile-label mono">Collective</h2>
        <p className="tile-big">{rooms.length} rooms</p>
        <p className="muted">{viewer.member ? "Moderated live chat for members." : "Live rooms are part of Synestharium+."}</p>
        <div className="actions">
          {viewer.member ? <><LiveBadge label="Open" /><Link className="button secondary small" href={"/community/" + rooms[0].id}>Enter {rooms[0].name}</Link></>
            : <Link className="button secondary small" href="/community">View rooms</Link>}
        </div>
      </section>

      {space && <section className="tile" aria-labelledby="spaces-tile">
        <h2 id="spaces-tile" className="tile-label mono">Spaces</h2>
        <p className="tile-big">{space.title}</p>
        <p className="muted">{space.description}</p>
        <div className="actions">
          <Link className="button secondary small" href={"/spaces/" + space.slug}>{viewer.member ? "Enter" : "Preview"}</Link>
          <span className="muted small-text"><PlannedBadge /> More spaces</span>
        </div>
      </section>}
    </div>

    <section className="block" aria-labelledby="releases-title">
      <div className="block-head">
        <h2 id="releases-title">Releases</h2>
        <Link href="/library/releases" className="text-link">All releases <Icon name="arrow" size={14} /></Link>
      </div>
      {works.length === 0 && <p className="muted">No releases yet.</p>}
      <div className="card-grid">
        {[...works].reverse().map((work) => <WorkCard key={work.slug} work={work} viewer={viewer} status={doneLabel(work.slug)} />)}
      </div>
    </section>
  </div>;
}
