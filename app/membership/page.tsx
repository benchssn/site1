import Link from "next/link";
import { CollectivePreview } from "@/app/chat/preview";
import { openPortal, requestLogin, signOut, startCheckout } from "@/app/actions";
import { authReady, billingCustomer, billingReady, verifiedUser } from "@/lib/service";

export const metadata = { title: "Membership" };
export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  unavailable: "This service is currently unavailable.",
  email: "Enter a valid email address.",
  "login-error": "The sign-in request failed. Try again in a moment.",
  sent: "Check your inbox for a sign-in link.",
  "invalid-link": "This sign-in link is invalid or has expired. Request a new one below.",
  checkout: "Stripe has returned you to the observatory. If you subscribed, access will appear here after payment confirmation.",
  manage: "You already have a subscription. Open billing to review it.",
  "billing-error": "Billing is temporarily unavailable. Try again in a moment.",
};

export default async function Membership({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { notice } = await searchParams;
  const message = notice && Object.hasOwn(notices, notice) ? notices[notice] : null;
  const user = await verifiedUser();
  let entry: Awaited<ReturnType<typeof billingCustomer>> = null;
  let unavailable = false;
  if (user) {
    try { entry = await billingCustomer(user.id); }
    catch { unavailable = true; }
  }
  const member = Boolean(entry?.access_until && Date.parse(entry.access_until) > Date.now());
  return <><section className="wrap account">
    <div>
      <p className="eyebrow"><span className="signal" /> THE OBSERVATORY</p>
      <h1>Membership</h1>
      <p className="intro">Synestharium+ opens The Collective, three private rooms for conversation, research, and creative experiments.</p>
      <Link href="/#archive" className="back">← Explore the archive</Link>
    </div>
    <div className="account-panel">
      <h2>{user ? "Your membership" : "Sign in"}</h2>
      {message && <p className="notice" role="status">{message}</p>}
      {user ? <>
        <p className="account-email">{user.email}</p>
        <p>{unavailable ? "Membership status is temporarily unavailable." : member ? "Your membership is active." : "No active membership."}</p>
        {member && <Link className="button primary" href="/chat">Enter The Collective <span aria-hidden="true">↗</span></Link>}
        {!member && billingReady() && !unavailable && <form action={startCheckout}>
          <button className="button primary">Subscribe <span aria-hidden="true">↗</span></button>
          <p className="fineprint">Stripe Checkout shows the price and billing interval before you pay.</p>
        </form>}
        {entry && billingReady() && <form action={openPortal}><button className="button secondary">Manage billing <span aria-hidden="true">↗</span></button></form>}
        {!billingReady() && <p>Subscriptions are currently unavailable.</p>}
        <form action={signOut}><button className="text-button">Sign out</button></form>
        {notice === "checkout" && !member && <a className="back" href="/membership?notice=checkout">Refresh membership status</a>}
      </> : authReady() ? <form action={requestLogin}>
        <p>Enter your email to receive a sign-in link.</p>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
        <button className="button primary">Send sign-in link <span aria-hidden="true">↗</span></button>
      </form> : <p>Member sign-in is currently unavailable. The public archive is open.</p>}
    </div>
  </section><section className="wrap" aria-label="The Collective preview"><CollectivePreview /></section></>;
}
