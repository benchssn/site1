import type { Transmission } from "@/lib/archive";

/*
 * Transmissions: narrated audiovisual pieces, published as Instagram reels and embedded here.
 *
 * To publish one, copy the template below into the array and fill it in.
 * Only `slug`, `title`, `instagram`, `synopsis` and `themes` are required.
 * Leave anything you don't have yet (date, transcript, sources) out rather than guessing.
 * The homepage, /transmissions, the archive and the theme pages all update from this list.
 *
 * {
 *   slug: "consciousness-may-be-a-process",                 // URL: /transmissions/<slug>
 *   title: "Consciousness May Be a Process, Not a Thing",
 *   instagram: "https://www.instagram.com/reel/XXXXXXXXXXX/", // paste the reel's share link
 *   synopsis: "One or two sentences on the question the piece asks.",
 *   themes: ["consciousness", "mind"],                      // consciousness | mind | emergence | reality | ancient-wisdom
 *   published: "2026-10-04",                                // optional, ISO date
 *   duration: "1:12",                                       // optional
 *   featured: true,                                         // optional: shown on the homepage first
 *   poster: "/art/transmissions/consciousness.webp",        // optional: an exported still in /public
 *   register: ["evidence", "interpretation"],               // optional: which kinds of claim the piece makes
 *   transcript: ["First paragraph of narration…", "Second paragraph…"],
 *   sources: [
 *     { title: "Book title", author: "Author name", year: 2021, kind: "book" },
 *     { title: "Paper title", author: "Surname et al.", year: 2019, kind: "research", url: "https://doi.org/…" },
 *   ],
 *   related: ["afterimage"],                                // slugs of other archive entries
 * },
 */

export const transmissions: Transmission[] = [];
