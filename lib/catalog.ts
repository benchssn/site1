// One catalogue feeds Home, Learn, Library, Spaces and the public site, so every surface
// shows the same works with the same access rules.

import type { ThemeId } from "./themes";

export type Access = "free" | "member";
export type WorkKind = "film" | "experience";

export type Work = {
  slug: string;
  index: string;
  title: string;
  kind: WorkKind;
  category: string;
  duration: string;
  description: string;
  access: Access;
  poster: string;
  /** Public films live in /public/films. Member films live in the private `member-media` bucket. */
  media:
    | { type: "public"; src: string }
    | { type: "private"; path: string }
    | { type: "space" };
  concepts: string[];
  /** Instrumental works have no spoken content to transcribe. */
  speech: "none" | "transcript";
  soundNote: string;
  /** Areas of exploration this work belongs to in the public archive. */
  themes: ThemeId[];
};

export const works: Work[] = [
  {
    slug: "interference-field", index: "01", title: "Interference Field", kind: "experience", category: "Interactive study",
    duration: "Open-ended",
    description: "Two wave sources overlap on a fine-line surface. Shift their phase difference to move the peaks and troughs, and hear a sine tone swell and vanish as the phase moves from 0° to 180°.",
    access: "member", poster: "/art/interference.webp", media: { type: "space" },
    concepts: ["interference", "phase"], speech: "none", soundNote: "Optional generated sine tone, no speech.",
    themes: ["reality"],
  },
];

export type Series = {
  slug: string;
  title: string;
  premise: string;
  availability: string;
  parts: { work: string; note: string }[];
};

export const series: Series[] = [];

export type Concept = { slug: string; title: string; summary: string };

export const concepts: Concept[] = [
  { slug: "interference", title: "Interference",
    summary: "Overlapping waves add together. Where crest meets crest the surface rises; where crest meets trough the two cancel." },
  { slug: "phase", title: "Phase",
    summary: "Where a wave sits in its cycle. Two equal waves in phase double in height; offset by half a cycle (180°), they cancel." },
];

export const findWork = (slug: string) => works.find((entry) => entry.slug === slug);
export const findSeries = (slug: string) => series.find((entry) => entry.slug === slug);
export const findConcept = (slug: string) => concepts.find((entry) => entry.slug === slug);
export const worksForConcept = (slug: string) => works.filter((work) => work.concepts.includes(slug));
export const seriesForWork = (slug: string) => series.filter((entry) => entry.parts.some((part) => part.work === slug));
export const seriesWorks = (entry: Series) => entry.parts.map((part) => ({ ...part, item: findWork(part.work)! }));

/** Standalone audiovisual works, the Learn counterpart to series. */
export const studies = works.filter((work) => work.kind === "film");
export const memberWorks = works.filter((work) => work.access === "member");

/** In-app destination for a work. Experiences open in Spaces. */
export const workHref = (work: Work) => "/works/" + work.slug;
export const playHref = (work: Work) => work.kind === "experience" ? "/spaces/" + work.slug : "/works/" + work.slug + "#player";

// Public pages (signed-out visitors) only ever link to free films.
export const observations = works.filter((work) => work.access === "free" && work.media.type === "public");
export const findObservation = (slug: string) => observations.find((entry) => entry.slug === slug);

export type Space = {
  slug: string;
  title: string;
  status: "active" | "planned";
  access: Access;
  description: string;
  dependency?: string;
};

export const spaces: Space[] = [
  { slug: "interference-field", title: "Interference Field", status: "active", access: "member",
    description: "A full-frame wave surface you tune by hand, with a sine tone that rises and falls with the waves." },
  { slug: "world", title: "A navigable world", status: "planned", access: "member",
    description: "A walkable 3D space for gatherings and installations.",
    dependency: "Needs a 3D engine, world assets and a presence service. To be scoped as a separate build." },
];
export const findSpace = (slug: string) => spaces.find((entry) => entry.slug === slug);
