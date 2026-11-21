import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlannedPanel } from "@/app/_ui/cards";
import { findSpace } from "@/lib/catalog";
import { requireViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: findSpace((await params).slug)?.title ?? "Space" };
}

// No space is open at the moment. When one is built, render it here behind the canAccess() gate.
export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const space = findSpace((await params).slug);
  if (!space || space.status !== "planned") notFound();
  await requireViewer();

  return <div className="screen">
    <Link className="back" href="/spaces">← Spaces</Link>
    <h1>{space.title}</h1>
    <PlannedPanel title="This space isn’t open yet">
      <p>{space.description}</p>
      {space.dependency && <p className="muted">{space.dependency}</p>}
    </PlannedPanel>
  </div>;
}
