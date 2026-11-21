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
    slug: "afterimage", index: "01", title: "Afterimage", kind: "film", category: "Light study", duration: "0:24",
    description: "A suspended blue corona flickers over a low, slow-moving harmonic bed.",
    access: "free", poster: "/art/afterimage.webp", media: { type: "public", src: "/films/afterimage.mp4" },
    concepts: ["afterimage"], speech: "none", soundNote: "Instrumental soundtrack, no speech.", themes: ["mind"],
  },
  {
    slug: "selenite", index: "02", title: "Selenite", kind: "film", category: "Texture study", duration: "0:20",
    description: "A fractured rose-colored surface paired with a cluster of slowly beating tones.",
    access: "free", poster: "/art/selenite.webp", media: { type: "public", src: "/films/selenite.mp4" },
    concepts: ["beating"], speech: "none", soundNote: "Instrumental soundtrack, no speech.", themes: ["mind"],
  },
  {
    slug: "interference-field", index: "03", title: "Interference Field", kind: "experience", category: "Interactive study",
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

export const series: Series[] = [
  {
    slug: "perception-studies",
    title: "Perception Studies I",
    premise: "Three short studies on how the senses assemble an image from light, colour and vibration. Begin with what the eye keeps after the light has gone, listen to two close tones fold into one pulse, then shape a wave field by hand.",
    availability: "Available now · 3 parts",
    parts: [
      { work: "afterimage", note: "Watch for the colour that remains once the corona fades." },
      { work: "selenite", note: "Listen for the slow swell where neighbouring tones meet." },
      { work: "interference-field", note: "Move the phase and find where the surface flattens." },
    ],
  },
];

export type Concept = { slug: string; title: string; summary: string };

export const concepts: Concept[] = [
  { slug: "afterimage", title: "Afterimage",
    summary: "An image that persists after its stimulus has gone. Staring at a colour adapts the receptors that respond to it, so a complementary ghost appears on a neutral field." },
  { slug: "beating", title: "Beating",
    summary: "Two tones of slightly different frequency, sounded together, swell and fade at the rate of the difference between them." },
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
