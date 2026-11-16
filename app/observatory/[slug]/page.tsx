import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findObservation } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: findObservation((await params).slug)?.title ?? "Observation" };
}

export default async function ObservationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "low-orbit") redirect("/chat");
  const item = findObservation(slug);
  if (!item) notFound();

  return <section className="wrap detail">
    <Link className="back" href="/#archive">← Back to archive</Link>
    <p className="eyebrow">STUDY {item.index} / {item.category.toUpperCase()} / {item.duration}</p>
    <h1>{item.title}</h1>
    <p className="intro">{item.description}</p>
    <video controls playsInline preload="none" poster={"/art/" + item.slug + ".webp"}
      aria-label={item.title} src={"/films/" + item.slug + ".mp4"} />
    <p className="fineprint">Original demo study. The soundtrack is instrumental and contains no speech.</p>
  </section>;
}
