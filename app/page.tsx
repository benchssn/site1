import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./home/home.css";

export const metadata: Metadata = {
  title: { absolute: "Synestharium" },
  description: "Short audiovisual studies in light, colour and sound.",
};

export default function Home() {
  return <div className="home">
    <section className="wrap home-intro" aria-labelledby="home-title">
      <div>
        <h1 id="home-title">Synestharium</h1>
        <p>Short audiovisual studies in light, colour and sound.</p>
      </div>
      <Image src="/art/seed.jpg" alt="Seven overlapping circles forming a flower-like geometric pattern" width={600} height={600} priority />
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
