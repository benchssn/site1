import Link from "next/link";
import { hasAccess, verifiedUser } from "@/lib/service";
import Collective from "./room";
import { CollectivePreview } from "./preview";

export const metadata = { title: "The Collective" };
export const dynamic = "force-dynamic";

export default async function CollectivePage() {
  let active = false;
  let unavailable = false;
  try {
    const user = await verifiedUser();
    active = Boolean(user && await hasAccess(user.id));
  } catch { unavailable = true; }

  if (active) return <Collective />;
  return <section className="wrap detail collective-locked">
    <Link href="/" className="back">← Back to Synestharium</Link>
    <p className="eyebrow"><span className="signal" /> SYNESTHARIUM+</p>
    <h1>The Collective</h1>
    <p className="intro">A private meeting place for people curious about minds, machines, and the nature of reality.</p>
    <p className="collective-gate-note">{unavailable
      ? "Membership status is temporarily unavailable."
      : "The Commons, The Mind, and The Laboratory are open to active Synestharium+ members."}</p>
    <Link className="button primary" href="/membership">View membership <span aria-hidden="true">↗</span></Link>
    <CollectivePreview />
  </section>;
}
