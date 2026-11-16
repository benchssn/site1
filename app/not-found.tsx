import Link from "next/link";

export default function NotFound() {
  return <section className="wrap detail">
    <h1>Page not found</h1>
    <Link className="back" href="/#work">← Back to the studies</Link>
  </section>;
}
