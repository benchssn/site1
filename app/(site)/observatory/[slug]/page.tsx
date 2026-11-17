import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findObservation, findWork, seriesForWork } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: findObservation((await params).slug)?.title ?? "Study" };
}

// Public page for free films. Member works only open inside the workspace.
export default async function ObservationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "low-orbit") redirect("/community");
  const item = findObservation(slug);
  if (!item) {
    if (findWork(slug)) redirect("/works/" + slug);
    notFound();
  }
  const inSeries = seriesForWork(item.slug)[0];

  return <section className="wrap page detail">
    <Link className="back" href="/">← Synestharium</Link>
    <p className="meta mono">{item.category} · {item.duration}</p>
    <h1>{item.title}</h1>
    <p className="intro">{item.description}</p>
    {item.media.type === "public" && <video controls playsInline preload="none" poster={item.poster}
      aria-label={item.title} src={item.media.src} />}
    <p className="fineprint">{item.soundNote}</p>
    <div className="detail-cta">
      <p>{inSeries
        ? <>This study is part of <strong>{inSeries.title}</strong>. Create a free account to track your progress through the series.</>
        : "Create a free account to track your progress."}</p>
      <div className="actions">
        <Link className="button primary" href={"/signin?mode=register&next=" + encodeURIComponent("/works/" + item.slug)}>Create a free account</Link>
        <Link className="button secondary" href="/plans">See plans</Link>
      </div>
    </div>
  </section>;
}
