import type { Metadata } from "next";
import Link from "next/link";
import "./style.css";

export const metadata: Metadata = {
  title: { default: "Synestharium — An audiovisual observatory", template: "%s — Synestharium" },
  description: "An independent audiovisual observatory. Explore short studies in light, color and sound.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <a className="skip" href="#main">Skip to content</a>
    <header className="header wrap">
      <Link href="/" className="brand"><span className="mark" aria-hidden="true">⟐</span> SYNESTHARIUM</Link>
      <nav aria-label="Main navigation">
        <Link href="/#archive">Archive</Link>
        <Link href="/chat">The Collective</Link>
        <Link href="/membership" className="nav-member">Membership <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
    <main id="main">{children}</main>
    <footer className="footer wrap">
      <Link href="/" className="brand"><span className="mark" aria-hidden="true">⟐</span> SYNESTHARIUM</Link>
      <p>An independent audiovisual observatory.</p>
    </footer>
  </body></html>;
}
