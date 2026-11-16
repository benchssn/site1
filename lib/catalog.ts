export const observations = [
  { slug: "afterimage", index: "01", title: "Afterimage", category: "Light study", duration: "0:24",
    description: "A suspended blue corona flickers over a low, slow-moving harmonic bed." },
  { slug: "selenite", index: "02", title: "Selenite", category: "Texture study", duration: "0:20",
    description: "A fractured rose-colored surface paired with a cluster of slowly beating tones." },
] as const;

export function findObservation(slug: string) {
  return observations.find((entry) => entry.slug === slug);
}
