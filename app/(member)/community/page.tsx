import type { Metadata } from "next";
import Link from "next/link";
import { AccessBadge, LiveBadge, PlannedBadge } from "@/app/_ui/cards";
import { CollectivePreview } from "@/app/_ui/collective/preview";
import { Icon } from "@/app/_ui/icons";
import { guidelines, rooms } from "@/lib/collective";
import { upgradeHref } from "@/lib/paths";
import { dataReady } from "@/lib/service";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "The Collective" };
export const dynamic = "force-dynamic";

export default async function Community() {
  const viewer = await requireViewer();
  const live = dataReady() || viewer.dev;
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Collective</p>
      <h1>The Collective</h1>
      <p className="intro">Moderated rooms for conversation about perception, art and science.</p>
    </header>

    {!viewer.member && <div className="notice">
      <p>Rooms are open to Synestharium+ members. You can browse the directory; joining a conversation needs a membership.</p>
      <Link className="button primary small" href={upgradeHref("/community")}>Upgrade to join</Link>
    </div>}
    {!live && <p className="notice" role="status">Live chat is temporarily unavailable.</p>}

    <section className="block" aria-labelledby="rooms-title">
      <h2 id="rooms-title">Rooms</h2>
      <ul className="room-list">{rooms.map((room, index) => <li key={room.id}>
        <Link href={"/community/" + room.id} className="room-card">
          <span className="mono room-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="room-body">
            <strong>{room.name}</strong>
            <span className="muted">{room.description}</span>
          </span>
          <span className="room-side">
            <AccessBadge access="member" viewer={viewer} />
            {viewer.member && live && <LiveBadge />}
          </span>
        </Link>
      </li>)}</ul>
    </section>

    <section className="block" aria-labelledby="messages-title">
      <div className="block-head"><h2 id="messages-title">Messages</h2><PlannedBadge /></div>
      <Link href="/community/messages" className="room-card is-planned">
        <span className="room-number"><Icon name="message" /></span>
        <span className="room-body">
          <strong>Direct messages</strong>
          <span className="muted">One-to-one conversations between members. Not open yet.</span>
        </span>
      </Link>
    </section>

    {!viewer.member && <section className="block" aria-label="Preview"><CollectivePreview /></section>}

    <details className="recovery">
      <summary>Community guidelines</summary>
      <ul>{guidelines.map((line) => <li key={line}>{line}</li>)}</ul>
    </details>
  </div>;
}
