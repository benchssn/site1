import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findStudioWork } from "@/lib/archive";
import { findWork } from "@/lib/catalog";

// Former public film pages. Studies now live in the archive; old links keep working.
export default async function ObservatoryRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "low-orbit") redirect("/community");
  if (findStudioWork(slug)) permanentRedirect("/archive/" + slug);
  if (findWork(slug)) redirect("/works/" + slug);
  notFound();
}
