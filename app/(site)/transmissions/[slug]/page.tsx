import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryCard, ThemeList } from "@/app/_ui/archive-ui";
import { Reel } from "@/app/_ui/reel";
import {
  findTransmission, formatDate, reelEmbedSrc, reelPageHref, registerLabel, relatedEntries, transmissions,
} from "@/lib/archive";

export const dynamicParams = false;
export const generateStaticParams = () => transmissions.map(({ slug }) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = findTransmission((await params).slug);
  return entry ? { title: entry.title, description: entry.synopsis } : {};
}

export default async function TransmissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = findTransmission((await params).slug);
  if (!entry) notFound();
  const related = relatedEntries(entry.slug, entry.related);

  return <article className="wrap page transmission">
    <Link className="back" href="/transmissions">← Transmissions</Link>
    <div className="transmission-layout">
      <Reel embedSrc={reelEmbedSrc(entry.instagram)} pageHref={reelPageHref(entry.instagram)} title={entry.title} poster={entry.poster} />
      <div className="transmission-info">
        <p className="entry-meta mono">
          <span>Transmission</span>
          {entry.duration && <span>{entry.duration}</span>}
          {entry.published && <time dateTime={entry.published}>{formatDate(entry.published)}</time>}
        </p>
        <h1>{entry.title}</h1>
        <p className="lede">{entry.synopsis}</p>
        <ThemeList ids={entry.themes} />
        {entry.register && entry.register.length > 0 && <section className="register-note" aria-labelledby="register-title">
          <h2 id="register-title" className="label mono">Kinds of claim in this piece</h2>
          <dl className="registers compact">{entry.register.map((id) => <div key={id} className={"register register-" + id}>
            <dt>{registerLabel[id].title}</dt><dd>{registerLabel[id].line}</dd>
          </div>)}</dl>
        </section>}
      </div>
    </div>

    {entry.transcript && entry.transcript.length > 0 && <section className="detail-block" aria-labelledby="transcript-title">
      <h2 id="transcript-title" className="label mono">Transcript</h2>
      <details className="transcript">
        <summary>Read the narration</summary>
        <div className="prose">{entry.transcript.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      </details>
    </section>}

    {entry.sources && entry.sources.length > 0 && <section className="detail-block" aria-labelledby="sources-title">
      <h2 id="sources-title" className="label mono">Sources and further reading</h2>
      <ul className="sources">{entry.sources.map((source) => <li key={source.title}>
        <span className="mono source-kind">{source.kind}</span>
        <span>
          {source.url ? <a href={source.url} rel="noopener">{source.title}</a> : <cite>{source.title}</cite>}
          {(source.author || source.year) && <span className="muted"> · {[source.author, source.year].filter(Boolean).join(", ")}</span>}
        </span>
      </li>)}</ul>
    </section>}

    {related.length > 0 && <section className="detail-block" aria-labelledby="related-title">
      <h2 id="related-title" className="label mono">Related</h2>
      <div className="entry-grid">{related.map((item) => <EntryCard key={item.slug} entry={item} />)}</div>
    </section>}
  </article>;
}
