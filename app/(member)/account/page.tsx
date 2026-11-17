import type { Metadata } from "next";
import Link from "next/link";
import { openPortal, signOut } from "@/app/actions";
import { billingReady } from "@/lib/service";
import { requireViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  unavailable: "Billing is currently unavailable.",
  "billing-error": "Billing is temporarily unavailable. Try again in a moment.",
  "login-error": "We couldn’t sign you out. Try again.",
};

export default async function Account({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const viewer = await requireViewer();
  const message = notice && Object.hasOwn(notices, notice) ? notices[notice] : null;
  const until = viewer.accessUntil ? new Date(viewer.accessUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  return <div className="screen narrow">
    <header className="screen-head">
      <p className="eyebrow mono">Account</p>
      <h1>Account</h1>
    </header>
    {message && <p className="notice" role="status">{message}</p>}

    <section className="panel" aria-labelledby="profile-title">
      <h2 id="profile-title" className="tile-label mono">Signed in as</h2>
      <p className="account-email">{viewer.email}</p>
      <form action={signOut}><button className="text-button">Sign out</button></form>
    </section>

    <section className="panel" aria-labelledby="plan-title">
      <h2 id="plan-title" className="tile-label mono">Current plan</h2>
      <p className="tile-big">{viewer.member ? "Synestharium+" : "Free account"}</p>
      <p className="muted">{viewer.statusUnavailable ? "Membership status is temporarily unavailable."
        : viewer.member ? (until ? "Active. Access through " + until + "." : "Active.")
          : "Open studies, the Library and progress tracking."}</p>
      <div className="actions">
        <Link className="button primary small" href="/account/plan">{viewer.member ? "View plan" : "Upgrade to Synestharium+"}</Link>
        {viewer.hasCustomer && billingReady() && <form action={openPortal}><button className="button secondary small">Billing and invoices</button></form>}
      </div>
      <p className="fineprint">Cancel, update payment details or download invoices through the secure Stripe billing portal.</p>
    </section>
  </div>;
}
