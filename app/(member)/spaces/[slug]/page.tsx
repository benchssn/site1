import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LockedPlayer, PlannedPanel, UpgradeGate } from "@/app/_ui/cards";
import { findSpace, findWork } from "@/lib/catalog";
import { canAccess, requireViewer } from "@/lib/viewer";
import InterferenceSpace from "./interference-space";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: findSpace((await params).slug)?.title ?? "Space" };
}

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const space = findSpace((await params).slug);
  if (!space) notFound();
  const viewer = await requireViewer();

  if (space.status === "planned") return <div className="screen">
    <Link className="back" href="/spaces">← Spaces</Link>
    <h1>{space.title}</h1>
    <PlannedPanel title="This space isn’t open yet">
      <p>{space.description}</p>
      {space.dependency && <p className="muted">{space.dependency}</p>}
    </PlannedPanel>
  </div>;

  // The experience is only sent to entitled viewers.
  if (!canAccess(space.access, viewer)) {
    const work = findWork(space.slug);
    return <div className="screen">
      <Link className="back" href="/spaces">← Spaces</Link>
      <h1>{space.title}</h1>
      <p className="intro">{space.description}</p>
      <div className="player">{work ? <LockedPlayer poster={work.poster} title={space.title} returnTo={"/spaces/" + space.slug} viewer={viewer} />
        : <UpgradeGate title={space.title} returnTo={"/spaces/" + space.slug} viewer={viewer} />}</div>
    </div>;
  }

  return <div className="space-page"><h1 className="visually-hidden">{space.title}</h1><InterferenceSpace slug={space.slug} /></div>;
}
