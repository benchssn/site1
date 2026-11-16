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
    <Link href="/" className="back">← Home</Link>
    <h1>The Collective</h1>
    <p className="intro">A members’ space for conversation about perception, art and science.</p>
    <p className="collective-gate-note">{unavailable
      ? "Membership status is temporarily unavailable."
      : "The Commons, The Mind, and The Laboratory are open to members."}</p>
    <Link className="button primary" href="/membership">View membership</Link>
    <CollectivePreview />
  </section>;
}
