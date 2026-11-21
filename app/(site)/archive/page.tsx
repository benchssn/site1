import type { Metadata } from "next";
import { EntryList, ThemeFilter } from "@/app/_ui/archive-ui";
import { archive } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every Synestharium transmission, study and experiment, filed by the questions they explore.",
};

export default function Archive() {
  return <div className="wrap page">
    <header className="page-head">
      <p className="section-label mono">Archive</p>
      <h1>Archive</h1>
      <p className="lede">Every published work, filed by the questions it explores: narrated transmissions, wordless studies in light
        and sound, and experiments you can operate yourself.</p>
    </header>
    <ThemeFilter />
    <p className="count-line mono" role="status">{archive.length} {archive.length === 1 ? "work" : "works"}</p>
    <EntryList entries={archive} />
  </div>;
}
