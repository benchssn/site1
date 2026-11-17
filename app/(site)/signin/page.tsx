import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requestLogin } from "@/app/actions";
import { safePath } from "@/lib/paths";
import { authReady } from "@/lib/service";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  unavailable: "Sign-in is currently unavailable. Please try again shortly.",
  email: "Enter a valid email address.",
  "login-error": "We couldn’t send that link. Try again in a moment.",
  sent: "Check your inbox. We’ve sent you a sign-in link.",
  "invalid-link": "That sign-in link is invalid or has expired. Request a new one below.",
};

export default async function SignIn({ searchParams }: {
  searchParams: Promise<{ mode?: string; notice?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safePath(params.next);
  const viewer = await getViewer().catch(() => null);
  if (viewer) redirect(next);
  const register = params.mode === "register";
  const message = params.notice && Object.hasOwn(notices, params.notice) ? notices[params.notice] : null;
  const sent = params.notice === "sent";
  const switchHref = (mode: string) => "/signin?mode=" + mode + (params.next ? "&next=" + encodeURIComponent(next) : "");

  return <section className="wrap page signin">
    <div>
      <p className="eyebrow mono">{register ? "Create account" : "Welcome back"}</p>
      <h1>{register ? "Create your Synestharium account" : "Sign in to Synestharium"}</h1>
      <p className="intro">{register
        ? "Enter your email and we’ll send a link that creates your free account and signs you in. You can upgrade to Synestharium+ at any time."
        : "We use passwordless sign-in. Enter your email and we’ll send you a secure link."}</p>
    </div>
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Account">
        <Link role="tab" aria-selected={!register} href={switchHref("signin")}>Sign in</Link>
        <Link role="tab" aria-selected={register} href={switchHref("register")}>Create account</Link>
      </div>
      {message && <p className={"notice" + (sent ? " notice-success" : "")} role="status">{message}</p>}
      {authReady() ? <form action={requestLogin}>
        <input type="hidden" name="mode" value={register ? "register" : "signin"} />
        <input type="hidden" name="next" value={next} />
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
        <button className="button primary wide">{sent ? "Send another link" : register ? "Create account" : "Email me a sign-in link"}</button>
      </form> : <p>Member sign-in is currently unavailable.</p>}
      <p className="fineprint">{register
        ? <>Already have an account? <Link href={switchHref("signin")}>Sign in</Link>.</>
        : <>New to Synestharium? <Link href={switchHref("register")}>Create a free account</Link>.</>}</p>
      <details className="recovery" open={params.notice === "invalid-link"}>
        <summary>Trouble signing in?</summary>
        <ul>
          <li>Links expire after a short time and work once. If yours has expired, request a new one above.</li>
          <li>Check spam or promotions folders for an email from Synestharium.</li>
          <li>You can open the link on any device. You’ll be taken to your workspace there.</li>
          <li>There’s no password to reset. Access always comes from the email address on your account.</li>
        </ul>
      </details>
    </div>
  </section>;
}
