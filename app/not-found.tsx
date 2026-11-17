import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="wrap page">
    <p className="eyebrow mono">404</p>
    <h1>Page not found</h1>
    <p className="intro">That page doesn’t exist or has moved.</p>
    <div className="actions">
      <Link className="button primary" href="/">Synestharium home</Link>
      <Link className="button secondary" href="/dashboard">Your workspace</Link>
    </div>
  </main>;
}
