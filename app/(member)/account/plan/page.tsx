import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlanTable } from "@/app/_ui/plan-table";
import { reconcileCustomer } from "@/lib/billing";
import { describePath, safePath } from "@/lib/paths";
import { billingCustomer, billingReady, hasAccess } from "@/lib/service";
import { requireViewer, membershipPrice } from "@/lib/viewer";
import Recheck from "./recheck";

export const metadata: Metadata = { title: "Your plan" };
export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  unavailable: "Checkout is currently unavailable.",
  manage: "You already have a subscription. Use billing to review it.",
  "billing-error": "Billing is temporarily unavailable. Try again in a moment.",
};

export default async function PlanPage({ searchParams }: {
  searchParams: Promise<{ return?: string; checkout?: string; notice?: string; select?: string }>;
}) {
  const params = await searchParams;
  const viewer = await requireViewer();
  const returnTo = safePath(params.return, "");
  const returnLabel = returnTo ? describePath(returnTo) : undefined;

  // Returning from Stripe: read the subscription from Stripe directly rather than waiting for the webhook.
  let confirming = false;
  if (params.checkout === "success" && !viewer.dev) {
    let active = viewer.member;
    if (!active && billingReady()) {
      try {
        const entry = await billingCustomer(viewer.id);
        if (entry) {
          await reconcileCustomer(entry.stripe_customer_id);
          active = await hasAccess(viewer.id);
        }
      } catch { console.error("Post-checkout reconciliation failed"); }
    }
    if (active) redirect(returnTo || "/dashboard?welcome=1");
    confirming = true;
  }

  const price = await membershipPrice();
  const message = params.notice && Object.hasOwn(notices, params.notice) ? notices[params.notice] : null;
  return <div className="screen">
    <Link className="back" href={returnTo || "/account"}>← {returnLabel ? "Back to " + returnLabel : returnTo ? "Back" : "Account"}</Link>
    <header className="screen-head">
      <p className="eyebrow mono">Plan</p>
      <h1>{viewer.member ? "Your plan" : "Upgrade to Synestharium+"}</h1>
      <p className="intro">{viewer.member ? "Your Synestharium+ membership is active."
        : returnLabel ? "Unlock " + returnLabel + " and everything else in Synestharium+. After checkout you’ll go straight back to it."
          : "Compare what each plan unlocks. You can cancel at any time."}</p>
    </header>
    {confirming && <div className="notice" role="status">
      <p>Payment received. We’re confirming your membership with Stripe. This usually takes a few seconds.</p>
      <Recheck />
    </div>}
    {params.checkout === "cancelled" && <p className="notice" role="status">Checkout was cancelled. You haven’t been charged.</p>}
    {message && <p className="notice" role="status">{message}</p>}
    <PlanTable viewer={viewer} price={price} returnTo={returnTo || undefined} selected={params.select === "plus" ? "plus" : undefined}
      upgradeFirst={!viewer.member} />
    {viewer.dev && <p className="fineprint">Local preview account: checkout needs Stripe test keys.</p>}
  </div>;
}
