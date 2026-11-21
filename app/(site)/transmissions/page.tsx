import type { Metadata } from "next";
import { EntryCard } from "@/app/_ui/archive-ui";
import { featuredTransmissions, instagramProfile, transmissions } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Transmissions",
  description: "Short audiovisual pieces on consciousness, the mind and the nature of reality, pairing narration with original generative film.",
};

export default function Transmissions() {
  const entries = featuredTransmissions(transmissions.length);
  return <div className="wrap page">
    <header className="page-head">
      <p className="section-label mono">Transmissions</p>
      <h1>Transmissions</h1>
      <p className="lede">Short audiovisual pieces that take one idea from neuroscience, physics or philosophy and follow it further
        than usual. Each pairs narration with an original generative film. Where they exist, the transcript and sources sit
        alongside the piece.</p>
    </header>
    {entries.length > 0
      ? <div className="entry-grid entry-grid-vertical">{entries.map((entry) => <EntryCard key={entry.slug} entry={entry} headingLevel={2} />)}</div>
      : <div className="callout">
        <p>Transmissions are published on Instagram first and gathered here with their transcripts and sources as they are added.</p>
        <a className="button secondary" href={instagramProfile} rel="noopener">Watch on Instagram · @synestharium</a>
      </div>}
    <p className="page-foot">Every transmission is free to watch. <a href={instagramProfile} rel="noopener">Follow @synestharium</a> for new ones.</p>
  </div>;
}
