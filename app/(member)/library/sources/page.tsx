import type { Metadata } from "next";
import Link from "next/link";
import { PlannedPanel } from "@/app/_ui/cards";
import { requireViewer } from "@/lib/viewer";
import { LibraryTabs } from "../tabs";

export const metadata: Metadata = { title: "Sources" };
export const dynamic = "force-dynamic";

export default async function Sources() {
  await requireViewer();
  return <div className="screen">
    <header className="screen-head">
      <p className="eyebrow mono">Library</p>
      <h1>Sources</h1>
    </header>
    <LibraryTabs current="/library/sources" />
    <PlannedPanel title="Reading lists and references">
      <p>Each concept will link to the papers, books and recordings behind it.</p>
      <p className="muted">Needs: a reviewed reference list for each concept. Until then, start from the <Link className="text-link" href="/library/concepts">concept entries</Link>.</p>
    </PlannedPanel>
  </div>;
}
