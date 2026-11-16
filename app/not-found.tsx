import Link from "next/link";

export default function NotFound() {
  return <section className="wrap detail">
    <h1>Study not found</h1>
    <Link className="back" href="/#archive">← Return to the archive</Link>
  </section>;
}
