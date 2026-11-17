import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AccessBadge, LiveBadge, PlannedBadge } from "@/app/_ui/cards";
import { findWork, spaces } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Spaces" };
export const dynamic = "force-dynamic";

export default async function Spaces() {
  const viewer = await requireViewer();
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Spaces</p>
      <h1>Spaces</h1>
      <p className="intro">Immersive studies you step into, not just watch.</p>
    </header>
    <ul className="space-list">{spaces.map((space) => {
      const poster = findWork(space.slug)?.poster;
      const planned = space.status === "planned";
      return <li key={space.slug} className={planned ? "is-planned" : ""}>
        <Link href={"/spaces/" + space.slug} className="space-card">
          <span className="space-card-art">{poster ? <Image src={poster} alt="" width={800} height={490} /> : <span className="space-card-blank" aria-hidden="true" />}</span>
          <span className="space-card-body">
            <span className="work-badges">{planned ? <PlannedBadge /> : <LiveBadge label="Open" />}<AccessBadge access={space.access} viewer={viewer} /></span>
            <strong>{space.title}</strong>
            <span className="muted">{space.description}</span>
            {space.dependency && <span className="muted small-text">{space.dependency}</span>}
          </span>
        </Link>
      </li>;
    })}</ul>
  </div>;
}
