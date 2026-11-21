// The public archive: transmissions (Instagram reels) and the studio's studies and experiments,
// normalised into one list so the homepage, /transmissions, /archive and theme pages all agree.

import { transmissions as transmissionEntries } from "@/content/transmissions";
import { findConcept, works, type Work } from "./catalog";
import { themes, type ThemeId } from "./themes";

export type Register = "evidence" | "interpretation" | "speculation";

export type Source = {
  title: string;
  author?: string;
  year?: number;
  url?: string;
  kind: "research" | "book" | "essay" | "lecture";
};

export type Transmission = {
  slug: string;
  title: string;
  /** The reel's share link, e.g. https://www.instagram.com/reel/<code>/ */
  instagram: string;
  synopsis: string;
  themes: ThemeId[];
  published?: string;
  duration?: string;
  featured?: boolean;
  /** An exported still in /public, used before the reel is loaded. */
  poster?: string;
  register?: Register[];
  /** Narration, one string per paragraph. */
  transcript?: string[];
  sources?: Source[];
  related?: string[];
};

export type Format = "transmission" | "study" | "experiment";

export type ArchiveEntry = {
  slug: string;
  title: string;
  format: Format;
  href: string;
  synopsis: string;
  themes: ThemeId[];
  poster?: string;
  published?: string;
  duration?: string;
  members: boolean;
};

export const formatLabel: Record<Format, string> = {
  transmission: "Transmission",
  study: "Study",
  experiment: "Experiment",
};

export const registerLabel: Record<Register, { title: string; line: string }> = {
  evidence: { title: "Evidence", line: "What experiments and observation currently support." },
  interpretation: { title: "Interpretation", line: "A philosophical reading of the evidence, one among several." },
  speculation: { title: "Speculation", line: "An open possibility, offered as a question rather than a finding." },
};

const reelPattern = /^https:\/\/(?:www\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(reels?|p)\/([A-Za-z0-9_-]{5,})\/?(?:\?.*)?$/;

/** Reads the shortcode from a reel's share link. Fails the build on a malformed link rather than shipping a broken embed. */
export function reelCode(link: string) {
  const match = reelPattern.exec(link.trim());
  if (!match) throw new Error("Not an Instagram reel or post link: " + link);
  return match[2];
}

export const reelEmbedSrc = (link: string) => "https://www.instagram.com/reel/" + reelCode(link) + "/embed/";
export const reelPageHref = (link: string) => "https://www.instagram.com/reel/" + reelCode(link) + "/";

export const instagramProfile = "https://www.instagram.com/synestharium/";

const byDate = (a: { published?: string }, b: { published?: string }) => (b.published ?? "").localeCompare(a.published ?? "");

export const transmissions = [...transmissionEntries].sort(byDate);
transmissions.forEach((entry) => reelCode(entry.instagram));

export const findTransmission = (slug: string) => transmissions.find((entry) => entry.slug === slug);


// Studio works: the free films and the interactive experiment. Member-only films stay in the workspace.
const studioWorks = works.filter((work) => work.kind === "experience" || (work.access === "free" && work.media.type === "public"));

export const findStudioWork = (slug: string) => studioWorks.find((work) => work.slug === slug);

const fromTransmission = (entry: Transmission): ArchiveEntry => ({
  slug: entry.slug, title: entry.title, format: "transmission", href: "/transmissions/" + entry.slug,
  synopsis: entry.synopsis, themes: entry.themes, poster: entry.poster, published: entry.published,
  duration: entry.duration, members: false,
});

const fromWork = (work: Work): ArchiveEntry => ({
  slug: work.slug, title: work.title, format: work.kind === "experience" ? "experiment" : "study",
  href: "/archive/" + work.slug, synopsis: work.description, themes: work.themes, poster: work.poster,
  duration: work.kind === "film" ? work.duration : undefined, members: work.access === "member",
});

/** Featured first, then newest. */
export const featuredTransmissions = (count: number) =>
  [...transmissions.filter((entry) => entry.featured), ...transmissions.filter((entry) => !entry.featured)]
    .slice(0, count).map(fromTransmission);

/** Every public entry, transmissions first. */
export const archive: ArchiveEntry[] = [...transmissions.map(fromTransmission), ...studioWorks.map(fromWork)];

export const findEntry = (slug: string) => archive.find((entry) => entry.slug === slug);
export const entriesForTheme = (id: ThemeId) => archive.filter((entry) => entry.themes.includes(id));

/** Themes with at least one published entry. Only these get pages and links. */
export const activeThemes = themes.filter((theme) => entriesForTheme(theme.id).length > 0);

/** Explicitly related entries, then others sharing a theme. */
export function relatedEntries(slug: string, explicit: string[] = [], count = 3) {
  const self = findEntry(slug);
  const picked = explicit.map(findEntry).filter((entry): entry is ArchiveEntry => Boolean(entry));
  const shared = archive.filter((entry) => entry.slug !== slug && !explicit.includes(entry.slug)
    && entry.themes.some((theme) => self?.themes.includes(theme)));
  return [...picked, ...shared].slice(0, count);
}

export const conceptsFor = (work: Work) => work.concepts.map(findConcept).filter((concept) => concept !== undefined);

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
