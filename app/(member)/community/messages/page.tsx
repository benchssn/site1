import type { Metadata } from "next";
import Link from "next/link";
import { PlannedPanel } from "@/app/_ui/cards";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Messages" };

export default async function Messages() {
  await requireViewer();
  return <div className="screen">
    <Link className="back" href="/community">← The Collective</Link>
    <header className="screen-head">
      <p className="eyebrow mono">Collective</p>
      <h1>Messages</h1>
    </header>
    <PlannedPanel title="Direct messages aren’t open yet">
      <p>One-to-one conversations between members are planned. Until then, conversations happen in the moderated rooms.</p>
      <p className="muted">Needs: private conversation tables with per-participant access rules, a Realtime channel for each conversation, and blocking and reporting that extend the room moderation tools.</p>
      <Link className="button secondary small" href="/community">Go to the rooms</Link>
    </PlannedPanel>
  </div>;
}
