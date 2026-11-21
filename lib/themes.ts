// The recurring questions Synestharium returns to. Every work in the archive carries one or more.

export type ThemeId = "consciousness" | "mind" | "emergence" | "reality" | "ancient-wisdom";

export type Theme = { id: ThemeId; title: string; line: string };

export const themes: Theme[] = [
  { id: "consciousness", title: "Consciousness", line: "The nature of subjective experience." },
  { id: "mind", title: "The Mind", line: "Identity, perception, emotion, and the unconscious." },
  { id: "emergence", title: "Emergence", line: "How complexity and intelligence arise from simple interactions." },
  { id: "reality", title: "Reality", line: "Physics, mathematics, time, and the structure of the universe." },
  { id: "ancient-wisdom", title: "Ancient Wisdom", line: "Philosophical and contemplative traditions examined in dialogue with modern knowledge." },
];

export const findTheme = (id: string) => themes.find((theme) => theme.id === id);
