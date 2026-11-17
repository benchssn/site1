import Link from "next/link";

export function LearnTabs({ current }: { current: "series" | "studies" }) {
  return <nav className="subnav" aria-label="Learn">
    <Link href="/learn" aria-current={current === "series" ? "page" : undefined}>Series</Link>
    <Link href="/learn/studies" aria-current={current === "studies" ? "page" : undefined}>Studies</Link>
  </nav>;
}
