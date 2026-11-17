"use server";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { subscriptionsFor, ensureCustomer } from "@/lib/billing";
import { nextCookie, safePath } from "@/lib/paths";
import { auth, authReady, billingCustomer, billingReady, siteOrigin, stripeClient, verifiedUser } from "@/lib/service";

export async function requestLogin(form: FormData) {
  const mode = form.get("mode") === "register" ? "register" : "signin";
  const next = safePath(form.get("next"));
  const back = (notice: string) => "/signin?mode=" + mode + "&notice=" + notice + "&next=" + encodeURIComponent(next);
  if (!authReady()) redirect(back("unavailable"));
  const email = form.get("email");
  if (typeof email !== "string" || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect(back("email"));
  }
  // Remember where to land after the emailed link is confirmed on this device.
  (await cookies()).set(nextCookie, next, {
    httpOnly: true, sameSite: "lax", secure: siteOrigin().startsWith("https:"), path: "/auth", maxAge: 60 * 60,
  });
  const client = await auth();
  // Magic links create the account on first use, so registration and sign-in share one flow.
  const { error } = await client.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: siteOrigin() + "/auth/confirm" },
  });
  redirect(back(error ? "login-error" : "sent"));
}

export async function signOut() {
  if (authReady()) {
    const client = await auth();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) redirect("/account?notice=login-error");
  }
  redirect("/");
}

export async function startCheckout(form: FormData) {
  const returnTo = safePath(form.get("return"), "");
  const plan = (extra: string) => "/account/plan?" + extra + (returnTo ? "&return=" + encodeURIComponent(returnTo) : "");
  if (!billingReady()) redirect(plan("notice=unavailable"));
  const user = await verifiedUser();
  if (!user) redirect("/signin?next=" + encodeURIComponent(plan("select=plus")));
  const stripe = stripeClient();
  const price = process.env.STRIPE_PRICE_ID!;
  let destination: string;
  try {
    const customer = await ensureCustomer(user);
    const sessions = await stripe.checkout.sessions.list({ customer, limit: 1 });
    const mostRecent = sessions.data[0];
    const subscriptions = await subscriptionsFor(stripe, customer);
    if (subscriptions.some((entry) => !["canceled", "incomplete_expired"].includes(entry.status))) {
      destination = plan("notice=manage");
    } else if (mostRecent?.status === "open" && mostRecent.url) {
      destination = mostRecent.url;
    } else {
      const returnKey = createHash("sha256").update(returnTo).digest("hex").slice(0, 16);
      const session = await stripe.checkout.sessions.create({
        customer,
        mode: "subscription",
        line_items: [{ price, quantity: 1 }],
        success_url: siteOrigin() + plan("checkout=success"),
        cancel_url: siteOrigin() + plan("checkout=cancelled"),
      }, { idempotencyKey: "synestharium-checkout-" + price + "-" + (mostRecent?.id ?? customer) + "-" + returnKey });
      if (!session.url) throw new Error("Stripe returned no checkout URL");
      destination = session.url;
    }
  } catch {
    console.error("Unable to create Checkout session");
    destination = plan("notice=billing-error");
  }
  redirect(destination);
}

export async function openPortal() {
  if (!billingReady()) redirect("/account?notice=unavailable");
  const user = await verifiedUser();
  if (!user) redirect("/signin?next=/account");
  let destination: string;
  try {
    const entry = await billingCustomer(user.id);
    if (!entry) {
      destination = "/account/plan";
    } else {
      const session = await stripeClient().billingPortal.sessions.create({
        customer: entry.stripe_customer_id, return_url: siteOrigin() + "/account",
      });
      destination = session.url;
    }
  } catch {
    console.error("Unable to open billing portal");
    destination = "/account?notice=billing-error";
  }
  redirect(destination);
}
