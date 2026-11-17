import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Access } from "./catalog";
import { billingCustomer, billingReady, stripeClient, verifiedUser } from "./service";

export type Viewer = {
  id: string;
  email: string;
  member: boolean;
  accessUntil: string | null;
  hasCustomer: boolean;
  /** Billing status could not be read; treat as no premium access and say so. */
  statusUnavailable: boolean;
  dev: boolean;
};

// Local-only preview accounts for checking signed-in layouts without Supabase.
// `next dev` sets NODE_ENV=development; production builds ignore this variable.
function devViewer(): Viewer | null {
  const mode = process.env.NODE_ENV === "development" ? process.env.SYNESTHARIUM_DEV_ACCOUNT : undefined;
  if (mode !== "free" && mode !== "member") return null;
  return {
    id: "00000000-0000-4000-8000-000000000000", email: "preview@localhost", member: mode === "member",
    accessUntil: mode === "member" ? new Date(Date.now() + 30 * 864e5).toISOString() : null,
    hasCustomer: mode === "member", statusUnavailable: false, dev: true,
  };
}

/** The signed-in visitor and their entitlement, read once per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const dev = devViewer();
  if (dev) return dev;
  const user = await verifiedUser();
  if (!user) return null;
  let entry: Awaited<ReturnType<typeof billingCustomer>> = null;
  let statusUnavailable = false;
  try { entry = await billingCustomer(user.id); }
  catch { statusUnavailable = true; }
  const accessUntil = entry?.access_until ?? null;
  return {
    id: user.id, email: user.email ?? "", accessUntil, hasCustomer: Boolean(entry), statusUnavailable, dev: false,
    member: Boolean(accessUntil && Date.parse(accessUntil) > Date.now()),
  };
});

export const canAccess = (access: Access, viewer: Viewer | null) => access === "free" || Boolean(viewer?.member);

/** Member pages call this; the proxy forwards the requested path so sign-in can return to it. */
export async function requireViewer() {
  const viewer = await getViewer();
  if (viewer) return viewer;
  const path = (await headers()).get("x-synestharium-path") ?? "/dashboard";
  redirect("/signin?next=" + encodeURIComponent(path));
}

let priceMemo: { label: string | null; at: number } | null = null;

/** The configured Stripe price, formatted for the plan page. Falls back to Checkout showing it. */
export async function membershipPrice() {
  if (!billingReady()) return null;
  if (priceMemo && Date.now() - priceMemo.at < 10 * 60_000) return priceMemo.label;
  let label: string | null = null;
  try {
    const price = await stripeClient().prices.retrieve(process.env.STRIPE_PRICE_ID!);
    if (price.unit_amount !== null) {
      const amount = new Intl.NumberFormat("en-GB", {
        style: "currency", currency: price.currency.toUpperCase(),
        minimumFractionDigits: price.unit_amount % 100 ? 2 : 0,
      }).format(price.unit_amount / 100);
      const recurring = price.recurring;
      label = recurring
        ? amount + " / " + (recurring.interval_count > 1 ? recurring.interval_count + " " + recurring.interval + "s" : recurring.interval)
        : amount;
    }
  } catch {
    console.error("Unable to read membership price");
  }
  priceMemo = { label, at: Date.now() };
  return label;
}
