import Link from "next/link";
import { SeedMark } from "@/app/_ui/icons";
import { getViewer } from "@/lib/viewer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let signedIn = false;
  try { signedIn = Boolean(await getViewer()); } catch { /* Header falls back to signed-out links. */ }
  return <>
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand"><SeedMark /> Synestharium</Link>
        <nav aria-label="Site">
          <Link href="/plans" className="hide-small">Plans</Link>
          {signedIn
            ? <Link href="/dashboard" className="button primary small">Open workspace</Link>
            : <>
              <Link href="/signin">Sign in</Link>
              <Link href="/plans" className="button primary small">Join</Link>
            </>}
        </nav>
      </div>
    </header>
    <main id="main">{children}</main>
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <span><SeedMark size={16} /> © {new Date().getFullYear()} Synestharium</span>
        <nav aria-label="Footer">
          <Link href="/plans">Plans</Link>
          <Link href="/signin">Sign in</Link>
          <Link href="/signin?mode=register">Create account</Link>
        </nav>
      </div>
    </footer>
  </>;
}
