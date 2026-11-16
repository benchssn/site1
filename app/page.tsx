import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import WaveField from "./home/wave-field";
import { observations } from "@/lib/catalog";
import "./home/home.css";

export const metadata: Metadata = {
  title: { absolute: "Synestharium" },
  description: "Short audiovisual studies in light, colour and sound, and small interactive experiments about perception.",
};

export default function Home() {
  return <div className="home">
    <section className="wrap home-intro" aria-labelledby="home-title">
      <div>
        <h1 id="home-title">Synestharium</h1>
        <p>Short audiovisual studies in light, colour and sound, and small interactive experiments about how we perceive them.</p>
      </div>
      <Image src="/art/seed.jpg" alt="Seven overlapping circles forming a flower-like geometric pattern" width={600} height={600} priority />
    </section>

    <section className="wrap home-section" id="work" aria-labelledby="home-work">
      <h2 id="home-work">Studies</h2>
      <ul className="work-list">
        {observations.map((item) => <li key={item.slug}>
          <Link href={"/observatory/" + item.slug}>
            <Image src={"/art/" + item.slug + ".webp"} alt="" width={640} height={360} />
            <span className="work-title">{item.title}</span>
            <span className="work-meta">{item.category} · {item.duration}</span>
            <span className="work-text">{item.description}</span>
          </Link>
        </li>)}
      </ul>
    </section>

    <section className="wrap home-section home-lab" id="laboratory" aria-labelledby="home-lab">
      <div>
        <h2 id="home-lab">Wave interference</h2>
        <p>Two sources emit waves at the same frequency. Move the slider to shift their timing and watch where peaks reinforce each other and where a peak meets a trough.</p>
      </div>
      <WaveField variant="laboratory" />
    </section>

    <section className="wrap home-section home-collective" aria-labelledby="home-collective">
      <h2 id="home-collective">The Collective</h2>
      <div>
        <p>A small members’ space with three rooms for conversation, research into mind and perception, and shared experiments.</p>
        <p><Link href="/chat">Visit The Collective</Link> · <Link href="/membership">Membership</Link></p>
      </div>
    </section>
  </div>;
}
