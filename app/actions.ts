"use server";

import { redirect } from "next/navigation";
import { subscriptionsFor, ensureCustomer } from "@/lib/billing";
import { auth, authReady, billingCustomer, billingReady, siteOrigin, stripeClient, verifiedUser } from "@/lib/service";

export async function requestLogin(form: FormData) {
  if (!authReady()) redirect("/membership?notice=unavailable");
  const email = form.get("email");
  if (typeof email !== "string" || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect("/membership?notice=email");
  }
  const client = await auth();
  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: siteOrigin() + "/auth/confirm" },
  });
  redirect(error ? "/membership?notice=login-error" : "/membership?notice=sent");
}

export async function signOut() {
  if (authReady()) {
    const client = await auth();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) redirect("/membership?notice=login-error");
  }
  redirect("/");
}

export async function startCheckout() {
  if (!billingReady()) redirect("/membership?notice=unavailable");
  const user = await verifiedUser();
  if (!user) redirect("/membership");
  const stripe = stripeClient();
  const price = process.env.STRIPE_PRICE_ID!;
  let destination: string;
  try {
    const customer = await ensureCustomer(user);
    const sessions = await stripe.checkout.sessions.list({ customer, limit: 1 });
    const mostRecent = sessions.data[0];
    const subscriptions = await subscriptionsFor(stripe, customer);
    if (subscriptions.some((entry) => !["canceled", "incomplete_expired"].includes(entry.status))) {
      destination = "/membership?notice=manage";
    } else if (mostRecent?.status === "open" && mostRecent.url) {
      destination = mostRecent.url;
    } else {
      const session = await stripe.checkout.sessions.create({
        customer,
        mode: "subscription",
        line_items: [{ price, quantity: 1 }],
        success_url: siteOrigin() + "/membership?notice=checkout",
        cancel_url: siteOrigin() + "/membership",
      }, { idempotencyKey: "synestharium-checkout-" + price + "-" + (mostRecent?.id ?? customer) });
      if (!session.url) throw new Error("Stripe returned no checkout URL");
      destination = session.url;
    }
  } catch {
    console.error("Unable to create Checkout session");
    destination = "/membership?notice=billing-error";
  }
  redirect(destination);
}

export async function openPortal() {
  if (!billingReady()) redirect("/membership?notice=unavailable");
  const user = await verifiedUser();
  if (!user) redirect("/membership");
  let destination: string;
  try {
    const entry = await billingCustomer(user.id);
    if (!entry) {
      destination = "/membership";
    } else {
      const session = await stripeClient().billingPortal.sessions.create({
        customer: entry.stripe_customer_id, return_url: siteOrigin() + "/membership",
      });
      destination = session.url;
    }
  } catch {
    console.error("Unable to open billing portal");
    destination = "/membership?notice=billing-error";
  }
  redirect(destination);
}
