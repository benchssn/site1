import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UpgradeGate } from "@/app/_ui/cards";
import Collective from "@/app/_ui/collective/room";
import { isRoom, rooms } from "@/lib/collective";
import { hasAccess } from "@/lib/service";
import { requireViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ room: string }> }): Promise<Metadata> {
  const { room } = await params;
  return { title: rooms.find(({ id }) => id === room)?.name ?? "Room" };
}

export default async function RoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  if (!isRoom(room)) notFound();
  const viewer = await requireViewer();
  const info = rooms.find(({ id }) => id === room)!;

  // Room entry uses the same billing check as the chat API and Realtime policy.
  let allowed = viewer.member;
  let unavailable = viewer.statusUnavailable;
  if (allowed && !viewer.dev) {
    try { allowed = await hasAccess(viewer.id); } catch { allowed = false; unavailable = true; }
  }
  if (!allowed) return <div className="screen">
    <Link className="back" href="/community">← All rooms</Link>
    <header className="screen-head">
      <p className="eyebrow mono">Collective</p>
      <h1>{info.name}</h1>
      <p className="intro">{info.description}</p>
    </header>
    {unavailable ? <p className="notice" role="status">Membership status is temporarily unavailable. Refresh to try again.</p>
      : <UpgradeGate title={info.name} returnTo={"/community/" + room} viewer={viewer}>
        <p>Members can read the room’s history and post. Rooms are moderated, and members choose a username before joining.</p>
      </UpgradeGate>}
  </div>;

  return <div className="room-page"><Collective initialRoom={room} /></div>;
}
