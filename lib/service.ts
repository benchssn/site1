import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Stripe from "stripe";

export const authReady = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
export const dataReady = () => authReady() && Boolean(process.env.SUPABASE_SECRET_KEY);
export const billingReady = () => dataReady() && Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID && process.env.STRIPE_WEBHOOK_SECRET
);

export function siteOrigin() {
  return new URL(process.env.SITE_URL || "http://localhost:3000").origin;
}

export async function auth() {
  const jar = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (entries) => {
        for (const { name, value, options } of entries) jar.set(name, value, options);
      },
    },
  });
}

export async function verifiedUser() {
  if (!authReady()) return null;
  const jar = await cookies();
  // Page renders are read-only. The proxy handles session refresh and persists cookies.
  const client = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: { getAll: () => jar.getAll() },
  });
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

export function database() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function stripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function billingCustomer(userId: string) {
  if (!dataReady()) return null;
  const { data, error } = await database().from("billing_customers")
    .select("stripe_customer_id, access_until").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function hasAccess(userId: string) {
  const entry = await billingCustomer(userId);
  return Boolean(entry?.access_until && Date.parse(entry.access_until) > Date.now());
}
