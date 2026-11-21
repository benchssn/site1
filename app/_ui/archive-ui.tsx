import Image from "next/image";
import Link from "next/link";
import { activeThemes, formatDate, formatLabel, type ArchiveEntry } from "@/lib/archive";
import { findTheme, type ThemeId } from "@/lib/themes";
import { SeedMark } from "./icons";

export function ThemeList({ ids }: { ids: ThemeId[] }) {
  return <ul className="theme-list" aria-label="Themes">{ids.map((id) => {
    const theme = findTheme(id);
    if (!theme) return null;
    const linked = activeThemes.some((entry) => entry.id === id);
    return <li key={id}>{linked ? <Link href={"/archive/themes/" + id}>{theme.title}</Link> : <span>{theme.title}</span>}</li>;
  })}</ul>;
}

export function EntryCard({ entry, headingLevel = 3 }: { entry: ArchiveEntry; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const vertical = entry.format === "transmission";
  return <article className={"entry" + (vertical ? " entry-vertical" : "")}>
    <Link href={entry.href} className="entry-art" tabIndex={-1} aria-hidden="true">
      {entry.poster ? <Image src={entry.poster} alt="" width={vertical ? 540 : 960} height={vertical ? 960 : 540}
        sizes={vertical ? "(max-width: 700px) 50vw, 280px" : "(max-width: 700px) 100vw, 520px"} />
        : <span className="entry-blank"><SeedMark size={32} /></span>}
    </Link>
    <div className="entry-body">
      <p className="entry-meta mono">
        <span>{formatLabel[entry.format]}</span>
        {entry.duration && <span>{entry.duration}</span>}
        {entry.published && <time dateTime={entry.published}>{formatDate(entry.published)}</time>}
        {entry.members && <span className="entry-members">Members</span>}
      </p>
      <Heading className="entry-title"><Link href={entry.href}>{entry.title}</Link></Heading>
      <p className="entry-synopsis">{entry.synopsis}</p>
      <ThemeList ids={entry.themes} />
    </div>
  </article>;
}

/** Topic filters as real links, so each filtered view is its own static, shareable page. */
export function ThemeFilter({ current, base = "/archive" }: { current?: ThemeId; base?: string }) {
  return <nav className="theme-filter" aria-label="Filter by theme">
    <Link href={base} aria-current={!current ? "page" : undefined}>All</Link>
    {activeThemes.map((theme) => <Link key={theme.id} href={"/archive/themes/" + theme.id}
      aria-current={current === theme.id ? "page" : undefined}>{theme.title}</Link>)}
  </nav>;
}

export function EntryList({ entries }: { entries: ArchiveEntry[] }) {
  return <div className="entry-list">{entries.map((entry) => <EntryCard key={entry.slug} entry={entry} headingLevel={2} />)}</div>;
}
