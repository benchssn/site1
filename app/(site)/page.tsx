import type { Metadata } from "next";
import Link from "next/link";
import { EntryCard } from "@/app/_ui/archive-ui";
import ScrollStory from "@/app/_ui/scroll-story";
import SeedField from "@/app/_ui/seed-field";
import {
  archive, entriesForTheme, featuredTransmissions, instagramProfile, registerLabel, type Register,
} from "@/lib/archive";
import { guidelines, rooms } from "@/lib/collective";
import { themes } from "@/lib/themes";

export const metadata: Metadata = {
  title: { absolute: "Synestharium: consciousness and the nature of reality" },
  description: "An audiovisual exploration of consciousness and the nature of reality. Where neuroscience meets philosophy, ancient wisdom and generative art.",
};

function Section({ id, number, label, title, children, className = "" }: {
  id: string; number: string; label: string; title: string; children: React.ReactNode; className?: string;
}) {
  return <section id={id} className={"section wrap " + className} aria-labelledby={id + "-title"} data-reveal>
    <header className="section-head">
      <p className="section-label mono"><span>{number}</span> {label}</p>
      <h2 id={id + "-title"}>{title}</h2>
    </header>
    {children}
  </section>;
}

export default function Home() {
  const reels = featuredTransmissions(6);
  const studio = archive.filter((entry) => entry.format !== "transmission");
  const registers = Object.entries(registerLabel) as [Register, { title: string; line: string }][];
  const collectiveRule = guidelines[1];

  return <div className="home">
    <ScrollStory />
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-art" aria-hidden="true"><SeedField /></div>
      <div className="wrap hero-copy">
        <h1 id="hero-title">
          <span className="wordmark">Synestharium</span>
          <span className="tagline">An exploration of consciousness and the nature of reality.</span>
        </h1>
        <p className="hero-line">Where neuroscience meets philosophy, ancient wisdom, and generative art.</p>
        <p className="hero-sub">Audiovisual transmissions exploring the mind, the universe, and the invisible patterns connecting them.</p>
        <div className="actions">
          <Link className="button primary" href="/transmissions">Explore Transmissions</Link>
          <Link className="button ghost" href="#philosophy">About the Project</Link>
        </div>
      </div>
    </section>

    <Section id="transmissions" number="01" label="Transmissions" title="Ideas, set to light and sound">
      <p className="section-lede">Short audiovisual pieces that take one idea from neuroscience, physics or philosophy and follow it
        further than usual. Each pairs narration with an original generative film.</p>
      {reels.length > 0 ? <>
        <div className="entry-grid entry-grid-vertical">{reels.map((entry) =>
          <EntryCard key={entry.slug} entry={entry} />)}</div>
        <Link className="text-link" href="/transmissions">All transmissions →</Link>
      </> : <div className="callout">
        <p>Transmissions are published on Instagram first and gathered here with their transcripts and sources.</p>
        <a className="button secondary" href={instagramProfile} rel="noopener">Watch on Instagram · @synestharium</a>
      </div>}

      <h3 className="subhead">From the studio</h3>
      <div className="entry-grid">{studio.map((entry) => <EntryCard key={entry.slug} entry={entry} />)}</div>
    </Section>

    <Section id="themes" number="02" label="Areas of exploration" title="Five questions that keep returning">
      <ol className="theme-index">{themes.map((theme, index) => {
        const count = entriesForTheme(theme.id).length;
        return <li key={theme.id}>
          <span className="mono theme-number">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>{count > 0 ? <Link href={"/archive/themes/" + theme.id}>{theme.title}</Link> : theme.title}</h3>
            <p>{theme.line}</p>
          </div>
          <span className="mono theme-count">{count > 0 ? count + (count === 1 ? " work" : " works") : ""}</span>
        </li>;
      })}</ol>
    </Section>

    <Section id="philosophy" number="03" label="The philosophy" title="Open questions, honestly held" className="philosophy">
      <div className="prose">
        <p>Synestharium does not claim to have solved consciousness or found the final nature of reality. Nobody has.
          The work sits where neuroscience, physics and philosophy start asking the same questions, and where older
          contemplative traditions turn out to have asked them first.</p>
        <p>The aim is not to hand you conclusions. It is to loosen a few assumptions about what you are and what the world is,
          and to look closely at what remains.</p>
        <p>That only works if the different kinds of claim stay distinct:</p>
      </div>
      <dl className="registers">{registers.map(([id, entry]) => <div key={id} className={"register register-" + id}>
        <dt>{entry.title}</dt>
        <dd>{entry.line}</dd>
      </div>)}</dl>
      <p className="section-foot">The visuals are made in TouchDesigner and other generative systems. They are not illustrations of the
        science. They are a second way into the same question.</p>
    </Section>

    <Section id="collective" number="04" label="The Collective" title="A place to think out loud">
      <div className="collective-intro">
        <div className="prose">
          <p>The Collective is the members’ space for conversation about the ideas behind the work. Bring what a transmission
            got right, what it left out, and what you would ask next.</p>
          <blockquote className="rule">
            <p>“{collectiveRule}”</p>
            <footer className="mono">From the Collective’s guidelines</footer>
          </blockquote>
        </div>
        <ul className="room-index">{rooms.map((room, index) => <li key={room.id}>
          <span className="mono">{String(index + 1).padStart(2, "0")}</span>
          <div><strong>{room.name}</strong><p>{room.description}</p></div>
        </li>)}</ul>
      </div>
      <div className="actions">
        <Link className="button secondary" href="/community">Enter the Collective</Link>
        <span className="fineprint">Open to Synestharium+ members.</span>
      </div>
    </Section>

    <section className="support wrap" aria-labelledby="support-title" data-reveal>
      <h2 id="support-title">Support the work</h2>
      <p>Synestharium is independent. Synestharium+ membership helps keep it that way, and opens the Collective, the
        Interference Field experiment and member works.</p>
      <div className="actions">
        <Link className="text-link" href="/plans">Membership →</Link>
        <Link className="text-link muted-link" href="/signin">Sign in</Link>
      </div>
    </section>
  </div>;
}
