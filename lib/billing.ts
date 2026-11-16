import "server-only";
import type { User } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { billingCustomer, database, stripeClient } from "./service";

export async function ensureCustomer(user: User) {
  const existing = await billingCustomer(user.id);
  if (existing) return existing.stripe_customer_id;

  const stripe = stripeClient();
  const customer = await stripe.customers.create(
    { metadata: { supabase_user_id: user.id } },
    { idempotencyKey: "synestharium-customer-" + user.id },
  );
  const { error } = await database().from("billing_customers").upsert(
    { user_id: user.id, stripe_customer_id: customer.id },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (error) throw error;
  const entry = await billingCustomer(user.id);
  if (!entry) throw new Error("Customer mapping unavailable");
  return entry.stripe_customer_id;
}

export async function subscriptionsFor(stripe: Stripe, customer: string) {
  const matching: Stripe.Subscription[] = [];
  for await (const subscription of stripe.subscriptions.list({ customer, status: "all", limit: 100 })) {
    if (subscription.items.data.some((item) => item.price.id === process.env.STRIPE_PRICE_ID)) {
      matching.push(subscription);
    }
  }
  return matching;
}

export async function reconcileCustomer(customer: string) {
  const db = database();
  const mapping = await db.from("billing_customers").select("user_id")
    .eq("stripe_customer_id", customer).maybeSingle();
  if (mapping.error) throw mapping.error;
  if (!mapping.data) return;

  // Reserve a revision before fetching Stripe so an older snapshot cannot overwrite a newer one.
  const revision = await db.rpc("next_billing_revision");
  if (revision.error) throw revision.error;
  const subscriptions = await subscriptionsFor(stripeClient(), customer);
  let accessUntil = 0;
  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    for (const item of sub.items.data) {
      if (item.price.id !== process.env.STRIPE_PRICE_ID) continue;
      const end = Math.min(item.current_period_end, sub.cancel_at ?? Infinity, sub.trial_end && sub.status === "trialing" ? sub.trial_end : Infinity);
      accessUntil = Math.max(accessUntil, end);
    }
  }
  const update = await db.from("billing_customers")
    .update({ access_until: accessUntil ? new Date(accessUntil * 1000).toISOString() : null, sync_revision: revision.data })
    .eq("stripe_customer_id", customer).lt("sync_revision", revision.data);
  if (update.error) throw update.error;
}
