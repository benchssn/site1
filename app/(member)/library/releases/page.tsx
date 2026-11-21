import type { Metadata } from "next";
import Link from "next/link";
import { WorkCard } from "@/app/_ui/cards";
import { works, type Access } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";
import { LibraryTabs } from "../tabs";

export const metadata: Metadata = { title: "Releases" };
export const dynamic = "force-dynamic";

const filters: { id: string; label: string; access?: Access }[] = [
  { id: "all", label: "All" }, { id: "free", label: "Free", access: "free" }, { id: "member", label: "Synestharium+", access: "member" },
];

export default async function Releases({ searchParams }: { searchParams: Promise<{ access?: string }> }) {
  const viewer = await requireViewer();
  const { access } = await searchParams;
  const filter = filters.find(({ id }) => id === access) ?? filters[0];
  const shown = works.filter((work) => !filter.access || work.access === filter.access);
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Library</p>
      <h1>Releases</h1>
    </header>
    <LibraryTabs current="/library/releases" />
    <nav className="filter-row" aria-label="Filter releases">
      {filters.map(({ id, label }) => <Link key={id} href={id === "all" ? "/library/releases" : "/library/releases?access=" + id}
        aria-current={filter.id === id ? "page" : undefined}>{label}</Link>)}
    </nav>
    {shown.length === 0 && <p className="muted">No releases yet.</p>}
    <div className="card-grid">{shown.map((work) => <WorkCard key={work.slug} work={work} viewer={viewer} />)}</div>
  </div>;
}
