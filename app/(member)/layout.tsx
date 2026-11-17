import type { Metadata } from "next";
import Link from "next/link";
import { SeedMark } from "@/app/_ui/icons";
import { requireViewer } from "@/lib/viewer";
import { AccountLink, MemberNav } from "./nav";

export const metadata: Metadata = { robots: { index: false } };

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  return <div className="member-shell">
    <aside className="member-rail">
      <Link href="/dashboard" className="brand"><SeedMark /> Synestharium</Link>
      <MemberNav variant="rail" />
      <div className="member-rail-foot">
        {!viewer.member && <Link className="upgrade-link" href="/account/plan">Upgrade to Synestharium+</Link>}
        <AccountLink member={viewer.member} />
      </div>
    </aside>
    <header className="member-topbar">
      <Link href="/dashboard" className="brand"><SeedMark /> Synestharium</Link>
      <AccountLink member={viewer.member} compact />
    </header>
    <main id="main" className="member-main">
      {viewer.dev && <p className="dev-banner mono" role="note">Local preview account ({viewer.member ? "Synestharium+" : "free"}). Not available in production.</p>}
      {children}
    </main>
    <MemberNav variant="bar" />
  </div>;
}
