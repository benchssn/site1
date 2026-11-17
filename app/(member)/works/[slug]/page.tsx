import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessBadge, LockedPlayer } from "@/app/_ui/cards";
import { Icon } from "@/app/_ui/icons";
import { findConcept, findWork, seriesForWork, seriesWorks, workHref } from "@/lib/catalog";
import { progressFor } from "@/lib/progress";
import { dataReady, database } from "@/lib/service";
import { canAccess, requireViewer } from "@/lib/viewer";
import TrackedVideo from "./tracked-video";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: findWork((await params).slug)?.title ?? "Work" };
}

/** Member films are served from the private bucket through a short-lived signed URL. */
async function mediaSource(path: string) {
  if (!dataReady()) return null;
  const { data, error } = await database().storage.from("member-media").createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const work = findWork((await params).slug);
  if (!work) notFound();
  const viewer = await requireViewer();
  const progress = await progressFor(viewer);
  const open = canAccess(work.access, viewer);
  const inSeries = seriesForWork(work.slug)[0];
  const parts = inSeries ? seriesWorks(inSeries) : [];
  const position = parts.findIndex(({ item }) => item.slug === work.slug);
  const nextPart = position >= 0 ? parts[position + 1]?.item : undefined;

  // Only resolve the media once access is confirmed, so locked visitors never receive a playable URL.
  let src: string | null = null;
  if (open && work.media.type === "public") src = work.media.src;
  if (open && work.media.type === "private") src = await mediaSource(work.media.path);

  return <div className="screen">
    <Link className="back" href={inSeries ? "/learn/series/" + inSeries.slug : "/learn/studies"}>← {inSeries ? inSeries.title : "Studies"}</Link>
    <header className="work-head">
      <p className="eyebrow mono">{inSeries ? "Part " + (position + 1) + " of " + parts.length + " · " : ""}{work.category} · {work.duration}</p>
      <h1>{work.title}</h1>
      <div className="work-badges">
        <AccessBadge access={work.access} viewer={viewer} />
        {progress.done.has(work.slug) && <span className="status status-completed">Completed</span>}
      </div>
      <p className="intro">{work.description}</p>
    </header>

    <div id="player" className="player">
      {!open ? <LockedPlayer poster={work.poster} title={work.title} returnTo={workHref(work)} viewer={viewer} />
        : work.kind === "experience" ? (
        <Link className="player-poster enter" href={"/spaces/" + work.slug}>
          <Image src={work.poster} alt="" width={1280} height={720} />
          <span className="button primary"><Icon name="spaces" size={16} /> Enter the space</span>
        </Link>
      ) : src ? (
        <TrackedVideo slug={work.slug} src={src} poster={work.poster} title={work.title}
          resumeAt={progress.started.get(work.slug) ?? 0} track={progress.tracked} />
      ) : <p className="notice" role="status">This work is temporarily unavailable. Please try again shortly.</p>}
      <p className="fineprint">{work.soundNote}</p>
    </div>

    <div className="work-aside">
      {work.concepts.length > 0 && <section aria-labelledby="concepts-title">
        <h2 id="concepts-title" className="tile-label mono">Concepts</h2>
        <ul className="chip-list">{work.concepts.map((slug) => {
          const concept = findConcept(slug);
          return concept && <li key={slug}><Link href={"/library/concepts/" + slug}>{concept.title}</Link></li>;
        })}</ul>
      </section>}
      <section aria-labelledby="transcript-title">
        <h2 id="transcript-title" className="tile-label mono">Transcript</h2>
        <p className="muted">{work.speech === "none" ? "No spoken content, so there is no transcript." : "Transcript available in the Library."}</p>
      </section>
      {nextPart && <section aria-labelledby="next-title">
        <h2 id="next-title" className="tile-label mono">Next in series</h2>
        <Link className="text-link" href={workHref(nextPart)}>{nextPart.title} {!canAccess(nextPart.access, viewer) && <Icon name="lock" size={14} />} <Icon name="arrow" size={14} /></Link>
      </section>}
    </div>
  </div>;
}
