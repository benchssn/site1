import Image from "next/image";
import Link from "next/link";
import { workHref, type Access, type Work } from "@/lib/catalog";
import { upgradeHref } from "@/lib/paths";
import type { Viewer } from "@/lib/viewer";
import { Icon } from "./icons";

/** Shows what a piece of content needs and whether this viewer already has it. */
export function AccessBadge({ access, viewer }: { access: Access; viewer: Viewer | null }) {
  if (access === "free") return <span className="badge badge-free">Free</span>;
  return viewer?.member
    ? <span className="badge badge-member">Synestharium+</span>
    : <span className="badge badge-locked"><Icon name="lock" size={12} /> Synestharium+</span>;
}

export const PlannedBadge = () => <span className="badge badge-planned">Planned</span>;
export const LiveBadge = ({ label = "Live" }: { label?: string }) =>
  <span className="badge badge-live"><span className="dot" aria-hidden="true" />{label}</span>;

export function WorkCard({ work, viewer, status, href }: {
  work: Work; viewer: Viewer | null; status?: string; href?: string;
}) {
  return <Link className="work-card" href={href ?? workHref(work)}>
    <span className="work-card-art">
      <Image src={work.poster} alt="" width={640} height={360} />
      {work.access === "member" && !viewer?.member && <span className="work-card-lock"><Icon name="lock" size={16} /></span>}
    </span>
    <span className="work-card-meta">
      <span className="mono">{work.index} · {work.category} · {work.duration}</span>
      <AccessBadge access={work.access} viewer={viewer} />
    </span>
    <strong>{work.title}</strong>
    <span className="work-card-text">{work.description}</span>
    {status && <span className="work-card-status">{status}</span>}
  </Link>;
}

/** The gate placed where playback, room entry or a space begins. */
export function UpgradeGate({ title, returnTo, viewer, children }: {
  title: string; returnTo: string; viewer: Viewer | null; children?: React.ReactNode;
}) {
  return <div className="gate" role="region" aria-label={title + " is for Synestharium+ members"}>
    <span className="gate-icon"><Icon name="lock" size={22} /></span>
    <div>
      <h2>{title} is part of Synestharium+</h2>
      {children ?? <p>Membership unlocks this and every other member work, room and space.</p>}
      {viewer?.statusUnavailable && <p className="fineprint">We couldn’t confirm your membership just now. Refresh to try again.</p>}
      <div className="actions">
        <Link className="button primary" href={upgradeHref(returnTo)}>Upgrade to Synestharium+</Link>
        <Link className="button secondary" href="/plans">Compare plans</Link>
      </div>
      <p className="fineprint">After checkout you’ll come straight back here.</p>
    </div>
  </div>;
}

/** Poster with the upgrade gate laid over it: the gate sits exactly where playback would start. */
export function LockedPlayer({ poster, title, returnTo, viewer }: {
  poster: string; title: string; returnTo: string; viewer: Viewer | null;
}) {
  return <div className="locked-player">
    <Image src={poster} alt="" width={1280} height={720} loading="eager" />
    <UpgradeGate title={title} returnTo={returnTo} viewer={viewer} />
  </div>;
}

export function PlannedPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="planned">
    <PlannedBadge />
    <h3>{title}</h3>
    <div className="planned-body">{children}</div>
  </div>;
}

export function ProgressBar({ value, total, label }: { value: number; total: number; label: string }) {
  return <div className="progress">
    <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
      <span style={{ width: (total ? value / total * 100 : 0) + "%" }} />
    </div>
    <span className="mono">{value}/{total}</span>
  </div>;
}
