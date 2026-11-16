import type { Metadata } from "next";
import Link from "next/link";
import WaveField from "./home/wave-field";
import "./home/home.css";

export const metadata: Metadata = {
  title: { absolute: "Synestharium — Consciousness, perception and audiovisual art" },
  description: "An independent audiovisual exploration of consciousness, connection, and the nature of reality. Explore studies of mind, matter, meaning, and machines.",
};

const investigations = [
  { key: "mind", heading: "MIND", text: "Perception, cognition, consciousness, and the nervous system. How does a world of signals become a lived experience?" },
  { key: "matter", heading: "MATTER", text: "Nature, mathematics, complexity, and emergence. How do local interactions become patterns across scales?" },
  { key: "meaning", heading: "MEANING", text: "Philosophy, symbolism, and spiritual traditions. How do inherited ideas and lived experience shape what matters to us?" },
  { key: "machine", heading: "MACHINE", text: "Cybernetics, artificial intelligence, and feedback. What happens when the tools we make begin to reshape the way we think?" },
];

export default function Home() {
  return <div className="syn-home">
    <section className="syn-hero syn-wrap" aria-labelledby="syn-title">
      <p className="syn-label"><span className="syn-point" aria-hidden="true" /> Independent audiovisual observatory</p>
      <h1 id="syn-title">SYNESTHARIUM</h1>
      <div className="syn-hero-body">
        <div className="syn-hero-copy">
          <p className="syn-premise">An exploration of consciousness, connection, and the nature of reality.</p>
          <p>Between neuroscience and philosophy, ancient thought and emerging technology, Synestharium investigates the patterns through which we perceive, interpret, and experience existence.</p>
          <a className="syn-link syn-link-strong" href="#archive">Explore the transmissions <span aria-hidden="true">↓</span></a>
        </div>
        <WaveField variant="hero" />
      </div>
    </section>

    <section className="syn-wrap syn-section syn-split" id="introduction" aria-labelledby="syn-intro">
      <div><p className="syn-label">Introduction</p><h2 id="syn-intro">A Different Way<br className="syn-break" /> of Seeing</h2></div>
      <div className="syn-prose">
        <p className="syn-lede">What feels immediate has already been interpreted.</p>
        <p>Perception takes shape as the nervous system integrates sensory information, signals from the body, and expectations formed through experience. That process makes the observer part of the question.</p>
        <p>Synestharium follows that question across mind, nature, and technology. Scientific findings, philosophical arguments, and spiritual traditions each have their own methods and histories.</p>
      </div>
    </section>

    <section className="syn-wrap syn-section" id="investigations" aria-labelledby="syn-investigations">
      <h2 id="syn-investigations">The Investigations</h2>
      <div className="syn-investigations">
        {investigations.map(({ key, heading, text }) => <article key={key} className="syn-chapter">
          <div><h3>{heading}</h3><p>{text}</p></div>
          <div className={"syn-motif syn-motif-" + key} aria-hidden="true">
            <span /><span /><span /><span />
          </div>
        </article>)}
      </div>
    </section>

    <section className="syn-wrap syn-section syn-split" id="archive" aria-labelledby="syn-transmissions">
      <h2 id="syn-transmissions">The Transmissions</h2>
      <div className="syn-prose">
        <p>Short audiovisual investigations pair scientific narration and philosophical questions with generative images and sound.</p>
      </div>
    </section>

    <section className="syn-wrap syn-section syn-lab" id="laboratory" aria-labelledby="syn-laboratory">
      <div className="syn-lab-copy">
        <h2 id="syn-laboratory">The Laboratory</h2>
        <p>Interactive simulations, audiovisual systems, and creative code make patterns something you can change and observe.</p>
        <h3>Wave interference</h3>
        <p>Two sources emit waves at the same frequency. Move the phase slider to change their timing. Watch where peaks reinforce one another and where a peak meets a trough.</p>
      </div>
      <WaveField variant="laboratory" />
    </section>

    <section className="syn-wrap syn-section syn-split syn-collective" aria-labelledby="syn-collective">
      <div><p className="syn-label">The Collective</p><h2 id="syn-collective">Consciousness is explored together.</h2></div>
      <div className="syn-prose">
        <p>The Collective is a private space for conversation, experimentation, and the exchange of ideas across science, philosophy, art, and the unknown.</p>
        <p>Synestharium+ members can join three live rooms for open conversation, research into mind and perception, and shared experiments.</p>
        <div className="syn-actions">
          <Link className="syn-link syn-link-strong" href="/chat">Visit The Collective <span aria-hidden="true">↗</span></Link>
          <Link className="syn-link" href="/membership">Membership <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>

    <section className="syn-wrap syn-section syn-close" aria-labelledby="syn-closing">
      <WaveField variant="closing" />
      <h2 id="syn-closing">The world is not only something to be understood. <em>It is something to be experienced.</em></h2>
      <a className="syn-link" href="#archive">Explore the transmissions <span aria-hidden="true">↑</span></a>
    </section>
  </div>;
}
