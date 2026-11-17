import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CollectivePreview } from "@/app/_ui/collective/preview";
import ScrollStory from "@/app/_ui/scroll-story";
import SeedField from "@/app/_ui/seed-field";
import { concepts, observations, series, seriesWorks, spaces } from "@/lib/catalog";
import { rooms } from "@/lib/collective";
import { tiers } from "@/lib/plans";

export const metadata: Metadata = {
  title: { absolute: "Synestharium" },
  description: "Short audiovisual studies in light, colour and sound, and a members' collective for the people who explore them.",
};
// The header reflects the visitor's session.
export const dynamic = "force-dynamic";

function Chapter({ number, label, title, children, id }: {
  number: string; label: string; title: string; children: React.ReactNode; id: string;
}) {
  return <section className="chapter wrap" aria-labelledby={id} data-reveal>
    <div className="chapter-rail">
      <span className="mono">{number}</span>
      <span className="chapter-label">{label}</span>
    </div>
    <div className="chapter-body">
      <h2 id={id}>{title}</h2>
      {children}
    </div>
  </section>;
}

function JoinBand({ line }: { line: string }) {
  return <div className="join-band wrap" data-reveal>
    <p>{line}</p>
    <Link className="button primary" href="/plans">See membership plans</Link>
  </div>;
}

export default function Landing() {
  const featured = series[0];
  const plus = tiers.find((tier) => tier.id === "plus")!;
  const space = spaces.find((entry) => entry.status === "active")!;
  return <div className="landing">
    <ScrollStory />
    <section className="hero" aria-labelledby="hero-title">
      <SeedField />
      <div className="wrap hero-copy">
        <p className="eyebrow mono">Light · colour · sound</p>
        <h1 id="hero-title">Learn to notice what the senses are doing.</h1>
        <p className="intro">Synestharium makes short audiovisual studies on perception, arranges them into guided series, and hosts a members’ collective for the people who explore them.</p>
        <div className="actions">
          <Link className="button primary" href="/plans">Become a member</Link>
          <Link className="button secondary" href={"/observatory/" + observations[0].slug}>Watch a free study</Link>
        </div>
      </div>
      <a className="scroll-cue mono" href="#learn">Scroll ↓</a>
    </section>

    <div id="learn" />
    <Chapter number="01" label="Learn" title="Series that build, studies that stand alone" id="learn-title">
      <p className="chapter-lede">Each series is an ordered syllabus of short works with a single question running through it.
        Standalone studies can be watched in any order.</p>
      <div className="preview-series">
        <div>
          <p className="mono">{featured.availability}</p>
          <h3>{featured.title}</h3>
          <p>{featured.premise}</p>
        </div>
        <ol>{seriesWorks(featured).map(({ item }, index) => <li key={item.slug}>
          <span className="mono">{String(index + 1).padStart(2, "0")}</span>
          <span>{item.title}</span>
          <span className={"badge " + (item.access === "free" ? "badge-free" : "badge-locked")}>{item.access === "free" ? "Free" : "Synestharium+"}</span>
        </li>)}</ol>
      </div>
      <h3 className="subhead">Open studies. Watch now, no account needed.</h3>
      <ul className="film-row">{observations.map((work) => <li key={work.slug}>
        <Link href={"/observatory/" + work.slug}>
          <Image src={work.poster} alt="" width={640} height={360} />
          <span className="mono">{work.index} · {work.category} · {work.duration}</span>
          <strong>{work.title}</strong>
        </Link>
      </li>)}</ul>
    </Chapter>

    <JoinBand line="Membership unlocks the full syllabus, the Collective and Spaces." />

    <Chapter number="02" label="Library" title="A library that connects the works" id="library-title">
      <p className="chapter-lede">Every release is filed alongside the ideas it explores, with transcripts and sources as the catalogue grows.</p>
      <ul className="concept-row">{concepts.map((concept) => <li key={concept.slug}>
        <strong>{concept.title}</strong>
        <span>{concept.summary}</span>
      </li>)}</ul>
    </Chapter>

    <Chapter number="03" label="Collective" title="Rooms for thinking out loud" id="collective-title">
      <p className="chapter-lede">The Collective is a small, moderated members’ space with {rooms.length} rooms: {rooms.map(({ name }) => name).join(", ")}.</p>
      <CollectivePreview />
    </Chapter>

    <JoinBand line="Join the conversation in the members’ rooms." />

    <Chapter number="04" label="Spaces" title="Step inside a study" id="spaces-title">
      <div className="spaces-preview">
        <Image src="/art/interference.webp" alt="Fine lines tracing the surface where two sets of ripples overlap" width={800} height={490} />
        <div>
          <h3>{space.title}</h3>
          <p>{space.description}</p>
          <p className="fineprint">For Synestharium+ members.</p>
        </div>
      </div>
    </Chapter>

    <section className="closing wrap" aria-labelledby="closing-title" data-reveal>
      <h2 id="closing-title">Join Synestharium+</h2>
      <ul>{plus.unlocks.map((line) => <li key={line}>{line}</li>)}</ul>
      <div className="actions">
        <Link className="button primary" href="/plans">Choose your plan</Link>
        <Link className="button secondary" href="/signin">Sign in</Link>
      </div>
    </section>
  </div>;
}
