import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryList, ThemeFilter } from "@/app/_ui/archive-ui";
import { activeThemes, entriesForTheme } from "@/lib/archive";

// Only themes with published work get a page.
export const dynamicParams = false;
export const generateStaticParams = () => activeThemes.map(({ id }) => ({ theme: id }));

export async function generateMetadata({ params }: { params: Promise<{ theme: string }> }): Promise<Metadata> {
  const { theme: id } = await params;
  const theme = activeThemes.find((entry) => entry.id === id);
  return theme ? { title: theme.title + " · Archive", description: theme.line } : {};
}

export default async function ThemePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: id } = await params;
  const theme = activeThemes.find((entry) => entry.id === id);
  if (!theme) notFound();
  const entries = entriesForTheme(theme.id);
  return <div className="wrap page">
    <header className="page-head">
      <p className="section-label mono">Archive · Theme</p>
      <h1>{theme.title}</h1>
      <p className="lede">{theme.line}</p>
    </header>
    <ThemeFilter current={theme.id} />
    <p className="count-line mono" role="status">{entries.length} {entries.length === 1 ? "work" : "works"}</p>
    <EntryList entries={entries} />
  </div>;
}
