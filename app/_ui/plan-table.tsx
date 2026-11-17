import Link from "next/link";
import { openPortal, startCheckout } from "@/app/actions";
import { tiers } from "@/lib/plans";
import { billingReady } from "@/lib/service";
import type { Viewer } from "@/lib/viewer";

/** Shared by the public plan page and in-app plan management so both show identical entitlements. */
export function PlanTable({ viewer, price, returnTo, selected, upgradeFirst }: {
  viewer: Viewer | null; price: string | null; returnTo?: string; selected?: string;
  /** In-app upgrade flows lead with the paid tier so it is the first thing seen on mobile. */
  upgradeFirst?: boolean;
}) {
  const ordered = upgradeFirst ? [...tiers].reverse() : tiers;
  const checkoutNext = "/account/plan?select=plus" + (returnTo ? "&return=" + encodeURIComponent(returnTo) : "");
  return <div className="plans">
    {ordered.map((tier) => {
      const current = viewer && (tier.id === "plus" ? viewer.member : !viewer.member);
      return <article key={tier.id} className={"plan" + (tier.id === "plus" ? " plan-plus" : "") + (selected === tier.id ? " plan-selected" : "")}
        aria-labelledby={"plan-" + tier.id}>
        <header>
          <h2 id={"plan-" + tier.id}>{tier.name}</h2>
          {current && <span className="badge badge-member">Current plan</span>}
        </header>
        <p className="plan-price">{tier.id === "free" ? "Free" : price ?? "Price shown at checkout"}</p>
        <p className="plan-summary">{tier.summary}</p>
        <ul>{tier.unlocks.map((line) => <li key={line}>{line}</li>)}</ul>
        <div className="plan-action">
          {tier.id === "free" ? (
            !viewer ? <Link className="button secondary" href="/signin?mode=register">Create a free account</Link>
              : current ? <Link className="button secondary" href="/dashboard">Go to your workspace</Link>
                : <p className="fineprint">Included with Synestharium+.</p>
          ) : !viewer ? (
            <Link className="button primary" href={"/signin?mode=register&next=" + encodeURIComponent(checkoutNext)}>Join Synestharium+</Link>
          ) : viewer.member ? (
            viewer.hasCustomer && billingReady()
              ? <form action={openPortal}><button className="button secondary">Manage billing</button></form>
              : <p className="fineprint">Your membership is active.</p>
          ) : billingReady() ? (
            <form action={startCheckout}>
              {returnTo && <input type="hidden" name="return" value={returnTo} />}
              <button className="button primary">Continue to secure checkout</button>
              <p className="fineprint">Stripe Checkout confirms the price and billing interval before you pay.</p>
            </form>
          ) : <p className="fineprint">Checkout isn’t available right now. Please try again later.</p>}
        </div>
      </article>;
    })}
  </div>;
}
