import Link from "next/link";

const sections = [
  { href: "/library", label: "Overview" },
  { href: "/library/releases", label: "Releases" },
  { href: "/library/concepts", label: "Concepts" },
  { href: "/library/transcripts", label: "Transcripts" },
  { href: "/library/sources", label: "Sources" },
];

export function LibraryTabs({ current }: { current: string }) {
  return <nav className="subnav" aria-label="Library">
    {sections.map(({ href, label }) => <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</Link>)}
  </nav>;
}
