import Image from "next/image";
import Link from "next/link";
import { observations } from "@/lib/catalog";

export default function Home() {
  return <>
    <section className="hero" aria-labelledby="intro">
      <Image src="/art/afterimage.webp" alt="" className="hero-art" fill priority sizes="100vw" />
      <div className="hero-shade" />
      <div className="wrap hero-content">
        <p className="eyebrow"><span className="signal" /> AUDIOVISUAL OBSERVATORY</p>
        <h1 id="intro">Light has<br /><em>a frequency.</em></h1>
        <p className="intro">Short films and sound studies at the edges of perception.</p>
        <div className="hero-actions">
          <a className="button primary" href="#archive">Explore the archive <span aria-hidden="true">↓</span></a>
          <Link className="hero-link" href="/observatory/afterimage">Play Afterimage <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <p className="hero-caption"><span aria-hidden="true">✦</span> STUDY 01 / AFTERIMAGE</p>
    </section>
    <section className="wrap archive" id="archive" aria-labelledby="archive-title">
      <div className="section-heading">
        <div><p className="eyebrow">THE COLLECTION</p><h2 id="archive-title">Selected observations</h2></div>
        <p>Two studies in light, texture and sound.</p>
      </div>
      <div className="grid">
        {observations.map((item) => <Link className="card" href={"/observatory/" + item.slug} key={item.slug}>
          <div className="card-art">
            <Image src={"/art/" + item.slug + ".webp"} alt="" fill sizes="(max-width: 680px) 92vw, 32vw" />
            <span className="card-label">OPEN ARCHIVE</span>
          </div>
          <div className="card-meta"><span>{item.index} / {item.category}</span><span>{item.duration}</span></div>
          <div className="card-title"><h3>{item.title}</h3><span aria-hidden="true">↗</span></div>
        </Link>)}
      </div>
    </section>
    <aside className="wrap">
      <div className="member-panel">
        <div><p className="eyebrow">SYNESTHARIUM+</p><h2>The Collective</h2><p>Three private rooms for conversation, research, and experiments in perception.</p></div>
        <Link href="/chat" className="button secondary">Explore The Collective <span aria-hidden="true">↗</span></Link>
      </div>
    </aside>
  </>;
}
