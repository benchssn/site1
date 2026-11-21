import Link from "next/link";
import { SeedMark } from "@/app/_ui/icons";
import { SiteNav } from "@/app/_ui/site-nav";
import { instagramProfile } from "@/lib/archive";

// Static shell: the account link is resolved client-side so public pages can be prerendered.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand" aria-label="Synestharium, home"><SeedMark /> <span>Synestharium</span></Link>
        <SiteNav />
      </div>
    </header>
    <main id="main" className="site-main">{children}</main>
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <div className="footer-brand">
          <span className="brand"><SeedMark size={16} /> Synestharium</span>
          <p>An independent audiovisual project on consciousness and the nature of reality.</p>
        </div>
        <nav aria-label="Footer">
          <Link href="/transmissions">Transmissions</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/plans">Membership</Link>
          <Link href="/signin">Sign in</Link>
          <a href={instagramProfile} rel="noopener">Instagram</a>
        </nav>
        <p className="footer-legal mono">© {new Date().getFullYear()} Synestharium</p>
      </div>
    </footer>
  </>;
}
