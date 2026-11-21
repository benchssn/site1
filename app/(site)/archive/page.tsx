import type { Metadata } from "next";
import { EntryList, ThemeFilter } from "@/app/_ui/archive-ui";
import { archive, instagramProfile } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every Synestharium transmission, study and experiment, filed by the questions they explore.",
};

export default function Archive() {
  return <div className="wrap page">
    <header className="page-head">
      <p className="section-label mono">Archive</p>
      <h1>Archive</h1>
      <p className="lede">Every published work, filed by the questions it explores.</p>
    </header>
    {archive.length > 0 ? <>
      <ThemeFilter />
      <p className="count-line mono" role="status">{archive.length} {archive.length === 1 ? "work" : "works"}</p>
      <EntryList entries={archive} />
    </> : <div className="callout">
      <p>The archive is empty for now. Transmissions are published on Instagram first and gathered here with their transcripts and sources.</p>
      <a className="button secondary" href={instagramProfile} rel="noopener">Watch on Instagram · @synestharium</a>
    </div>}
  </div>;
}
