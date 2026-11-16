import type { Metadata } from "next";
import Link from "next/link";
import "./style.css";

export const metadata: Metadata = {
  title: { default: "Synestharium", template: "%s — Synestharium" },
  description: "Short audiovisual studies in light, colour and sound.",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <a className="skip" href="#main">Skip to content</a>
    <header className="header wrap">
      <Link href="/" className="brand">Synestharium</Link>
      <nav aria-label="Main navigation">
        <Link href="/#work">Studies</Link>
        <Link href="/chat">Collective</Link>
        <Link href="/membership">Membership</Link>
      </nav>
    </header>
    <main id="main">{children}</main>
    <footer className="footer wrap">
      <span>© {new Date().getFullYear()} Synestharium</span>
    </footer>
  </body></html>;
}
