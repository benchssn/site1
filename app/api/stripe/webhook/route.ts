import type Stripe from "stripe";
import { billingReady, stripeClient } from "@/lib/service";
import { reconcileCustomer } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!billingReady()) return new Response("Billing unavailable", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing Stripe signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const body = Buffer.from(await request.arrayBuffer());
    event = stripeClient().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid Stripe signature", { status: 400 });
  }

  let customer: string | Stripe.Customer | Stripe.DeletedCustomer | null = null;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "invoice.paid":
    case "invoice.payment_failed":
      customer = event.data.object.customer;
      break;
  }

  if (customer) {
    try {
      await reconcileCustomer(typeof customer === "string" ? customer : customer.id);
    } catch {
      console.error("Stripe reconciliation failed", event.id);
      return new Response("Retry reconciliation", { status: 500 });
    }
  }
  return Response.json({ received: true });
}
