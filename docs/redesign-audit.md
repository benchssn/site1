# Synestharium redesign: audit and implementation plan

Status: **steps 1–4 implemented** (see Progress at the end). Audit Written 21 November 2026, against `main` at `e3842a4`.

How this was assessed: by reading the whole repository, running a production build (which passes), and screenshotting the current homepage at 1440px and 390px. The live site at synestharium.com could not be reached from the build environment, which blocks it at the network level. `render.yaml` deploys this repository to that domain, so the repository is treated as what is live. A web search found no public Synestharium channels or transmissions.

---

## 1. Existing architecture

| Layer | What is there | Verdict |
|---|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript, plain CSS (`app/style.css`, 473 lines), no UI library | Keep |
| Hosting | Render web service (`render.yaml`), health check `/api/health` | Keep |
| Auth | Supabase email magic link (`/signin`, `/auth/confirm`); `proxy.ts` gates member routes | **Keep unchanged** |
| Payments | Stripe Checkout, Billing Portal, webhook → `billing_customers.access_until` (`lib/billing.ts`, `app/actions.ts`, `/api/stripe/webhook`) | **Keep unchanged** |
| Member data | Supabase tables: `billing_customers`, `collective_*` (rooms, messages, presence, reports, mutes), `member_progress`, legacy `chat_messages`; private `member-media` bucket | **Keep unchanged** |
| Content | One static TS file, `lib/catalog.ts`: works, series, concepts, spaces | Extend (see §5) |
| Community | The Collective: 3 Realtime rooms (Commons, Mind, Laboratory) with moderation, reporting and SQL-level access checks | Keep; reposition |
| Interactive | `/spaces/interference-field`: a canvas wave field with a sine tone | Keep as an *Experiment* |

### Live routes

- **Public:** `/`, `/observatory/[slug]` (free films), `/plans`, `/signin`
- **Members** (sign-in required, `noindex`): `/dashboard`, `/community[/room|/messages]`, `/learn[/series/…|/studies]`, `/works/[slug]`, `/spaces[/slug]`, `/library[/releases|/concepts|/transcripts|/sources]`, `/account[/plan]`
- **API:** `/api/chat`, `/api/progress`, `/api/stripe/webhook`, `/api/health`
- **Redirects:** `/membership` and `/chat`

### External integrations

Supabase (auth, Postgres, Realtime, Storage), Stripe, and Google Fonts (CSS `@import`). Environment variables are in `.env.example`.

## 2. Real media assets

| Asset | What it is | Notes |
|---|---|---|
| `public/films/afterimage.mp4` | 24s, 960×540, H.264/AAC, instrumental | Blue corona; a real generative work |
| `public/films/selenite.mp4` | 20s, 960×540, H.264/AAC, instrumental | Rose/violet variant of the same system |
| `public/art/afterimage.webp`, `selenite.webp` | 1680×920 posters | Good hero material |
| `public/art/interference.webp` | Poster for the interference experiment | Browser-made, not a TouchDesigner export |
| `public/art/seed.jpg` | Seed-of-life line drawing | **Unused** |
| `member-media` bucket | Unknown contents | Cannot be inspected without credentials |

**The six narrated transmissions named in the brief are not in the repository.** These are "Consciousness May Be a Process, Not a Thing", "The Self Is Not the Commander", "Intelligence Does Not Require a Brain", "Your Brain Creates Order From Chaos", "The Fourth Dimension Is Hiding in Plain Sight" and "You Were Never Separate". There are no video files, transcripts, sources, dates or platform links for any of them. Both existing films are instrumental. Per the brief, these titles will not be published until real files and verified metadata are supplied.

## 3. Audit findings

### Positioning (the main problem)

- The hero reads "Learn to notice what the senses are doing." The eyebrow is "Light · colour · sound", and the primary CTA is **Become a member**. This frames Synestharium as a perception-training course, which the brief says it is not.
- The homepage has 4 chapters (Learn, Library, Collective, Spaces) and **3 separate membership calls to action**, plus a closing "Join Synestharium+" section. Membership currently defines the identity.
- The vocabulary is course vocabulary: "syllabus", "series that build", "Learn", "progress", "Start/Continue". Consciousness, the mind, reality, philosophy and emergence are absent from all public copy and metadata.
- The meta description says "Short audiovisual studies in light, colour and sound…", which also undersells the project.

### Content and honesty

- The Collective homepage preview shows **invented member messages** from "aftertone" and "prismfield" (`app/_ui/collective/preview.tsx`). These are fabricated. Remove them, or show only the real room structure.
- The planned "navigable world" in Spaces, and the "Messages" and "Sources" pages, are placeholders shown to users. They should not be public-facing.
- Concept summaries (afterimage, beating, interference, phase) are accurate and well written. Keep them.

### Visual identity

- The palette is mostly right: black, off-white, and a sage-green accent (`#c7d6b8`). The brief asks for silver with cyan and violet accents, which matches the real artworks (blue and rose-violet). The green clashes with them.
- The hero is a browser-drawn seed-of-life canvas animation. It is calm and respects reduced motion, but it is sacred geometry (a mystical-cliché risk), and it is **not an actual Synestharium artwork** while real ones sit unused.
- The interface is restrained and has no glassmorphism or gradients, which is good. Cards, badges and pill buttons lean toward SaaS.
- The typeface is Open Sans, which is legible but generic.

### Navigation

- The public header has only Plans, Sign in and Join. There is no way to browse work without an account, and the films page `/observatory` has no index.
- The members' area has its own five-tab app (Home, Collective, Learn, Spaces, Library). That is reasonable for a workspace, but the public site and the members' area feel like two products.

### Archive and data model

- `lib/catalog.ts` is a sound single source of truth with access rules, and it is the right foundation.
- Gaps: no transcript text field (only a `speech` flag), no sources or citations, no themes, no publish date, no aspect ratio, no captions, and no external-video option (YouTube or Vimeo).
- The Library, concepts and transcripts are **members-only**. That hides the best intellectual content from visitors and from search engines.

### Accessibility (good base)

- Present: skip link, landmarks, `aria-labelledby` sections, `aria-current` in nav, visible `:focus-visible`, and `prefers-reduced-motion` handled in the canvas and scroll reveals.
- Gaps: no captions track on videos; `/observatory` pages have no `<track>`; heading order on the homepage jumps (the preview figure injects an `<h2>` "The Mind" inside a section).

### Performance

- Every public page is `force-dynamic`, and `proxy.ts` sets `Cache-Control: private, no-store` on `/`. The homepage is server-rendered on every hit **only to swap the header's Sign in/Workspace link**. That hurts TTFB and makes the page uncacheable.
- Google Fonts is loaded with a CSS `@import`, which is render-blocking. `next/font` would self-host it.
- Videos use `preload="none"` with posters, which is correct. Posters are WebP (50–160 KB), which is fine.

### SEO and metadata

- Missing: Open Graph and Twitter tags, a social image, canonical URLs, `robots.txt`, `sitemap.xml`, and structured data (`VideoObject`).
- Only two public content pages exist, and no transcripts or concepts are indexable.

### Mobile

- The layouts are responsive and the member bottom-bar works. At 390px the hero fills the screen with geometry before any explanation, and the first CTA is "Become a member".

## 4. Keep, rewrite, remove

| Keep as is | Rewrite or reposition | Remove from public view or deprioritise |
|---|---|---|
| Auth, billing, webhook, all migrations and member data | Homepage (all copy and structure) | Fabricated Collective preview messages |
| `proxy.ts` gating logic | Public header and footer → new primary nav | Planned "world" space card |
| The Collective rooms, moderation and guidelines | `lib/catalog.ts` → archive data model (additive) | Repeated join bands on the homepage |
| Interference Field (as an Experiment) | `/observatory/[slug]` → `/transmissions/[slug]` (with a redirect) | Seed-of-life hero canvas (keep the file; stop using it in the hero) |
| Concept summaries | Plans page copy (membership supports the project) | "Learn"/"syllabus" framing in public copy |
| Member workspace routes | Palette (sage → silver, cyan and violet), type | — |

## 5. Proposed information architecture

```
Public
/                     Home: hero, featured transmissions, areas of exploration, philosophy, Collective, membership (quiet)
/transmissions        All transmissions, filterable by theme
/transmissions/[slug] Player, synopsis, themes, transcript, sources, related
/archive              Everything (transmissions, studies, experiments, concepts), filter by theme and format
/archive/[theme]      Theme pages (only themes with ≥1 published work are rendered or linked)
/collective           Public description of the Collective plus room list (live rooms remain at /community)
/about                The project, its philosophy, and its method (science vs. philosophy vs. speculation)
/plans, /signin       Unchanged behaviour, quieter placement

Redirects: /observatory/[slug] → /transmissions/[slug]
Members:   the existing workspace is unchanged in this pass, apart from copy and the palette
```

**Primary nav:** Home · Transmissions · Archive · Collective · About. Sign in and Membership go in a smaller secondary position. **Experiments** gets a nav item only when there is more than one; for now Interference Field sits in the Archive.

**Themes:** Consciousness, The Mind, Emergence, Reality, Ancient Wisdom. A theme page is only generated and linked when at least one published work carries that theme, so there are no empty pages.

### Data model (additive changes to `lib/catalog.ts`)

```ts
type Work = {
  // existing fields kept…
  format: "transmission" | "study" | "experiment";
  themes: ThemeId[];                 // consciousness | mind | emergence | reality | ancient-wisdom
  published?: string;                // ISO date, only when known
  synopsis: string;                  // editorial description
  media: … | { type: "youtube" | "vimeo"; id: string };   // external hosting option
  aspect?: "16:9" | "9:16" | "1:1";  // short-form vertical transmissions
  transcript?: string;               // full narration text, when supplied
  captions?: string;                 // WebVTT path
  sources?: { title: string; author?: string; year?: number; url?: string; kind: "research" | "book" | "essay" }[];
  claims?: "evidence" | "theory" | "speculation"; // epistemic label shown on the page
  related?: string[];
};
```

Adding a transmission means adding one object (and later, if wanted, a Markdown file per transcript). Pages, theme filters, the sitemap and structured data all derive from it.

## 6. Implementation plan (incremental; each step builds and is checked)

1. **Foundations:** design tokens (silver, cyan, violet), `next/font` instead of `@import`, and a new public header and footer with the primary nav. Make public pages statically renderable: the header's auth state moves to a small client island, and `proxy.ts` no longer sets `no-store` on public pages. Auth gating behaviour stays identical.
2. **Data model:** extend `catalog.ts` additively, with themes, formats, sources and transcript fields. Existing works are tagged honestly (Afterimage and Selenite are instrumental *studies*, and Interference Field is an *experiment*).
3. **Homepage:** a hero built on the real artwork (a poster plus a muted, looping, reduced-motion-aware preview of an existing film), the brief's copy, Featured Transmissions, Areas of Exploration (only themes with works), The Philosophy, The Collective (real room list, no fake messages), and one quiet membership block.
4. **Transmissions and archive:** list and detail pages, theme filters, transcripts, sources, related works, and a `/observatory` redirect.
5. **About and Collective** public pages.
6. **Membership:** rewrite the Plans copy so it supports the project, with no new promises. Checkout, the portal and the webhook stay untouched.
7. **SEO:** metadata, OG image from a real poster, `sitemap.ts`, `robots.ts`, canonical URLs, and `VideoObject` JSON-LD.
8. **Verification:** build, Playwright screenshots at 390, 768 and 1440 px, keyboard pass, axe contrast check, and a reduced-motion check.

## 7. Decisions needed before step 3

1. **Where are the transmission files?** For example, exported MP4s to add to the repo or the Supabase bucket, or YouTube, Vimeo, Instagram or TikTok links. Also needed: their exact titles, aspect ratio (vertical short-form?), publish dates, and whether narration transcripts and sources exist.
2. **Free or members-only?** Should transmissions be public, which serves discovery and SEO, or should some stay behind membership?
3. **Learn and series framing in the members' workspace:** keep it as-is for now (recommended, so nothing breaks), or rename it in a later pass?

Until transmissions are supplied, Featured Transmissions will show the two real studies and the experiment, honestly labelled. The narrated titles in the brief will not appear.

---

## Progress

### Decisions (21 November 2026)

- Transmissions are Instagram reels from @synestharium, embedded on the site.
- Transmissions are free and public.
- The members' workspace stays as it is. It only picks up the new palette.

### Done: steps 1–4

| Step | What changed |
|---|---|
| 1. Foundations | Inter and IBM Plex Mono through `next/font` (the render-blocking `@import` is gone). New tokens: black, silver, cyan `#8fd3e8`, violet `#b4a6f4`. The member area's green tints are swapped for cool equivalents. New public header with Home · Transmissions · Archive · Collective · About, plus a quieter Membership / Sign in, and a full-screen mobile menu. The header learns sign-in state from `/api/session`, so `/`, `/transmissions` and `/archive/*` are now **static and cacheable** (they were rendered per request with `no-store`). The `proxy.ts` gating of member routes is unchanged. |
| 2. Data model | `lib/themes.ts` holds the five themes. `content/transmissions.ts` is where reels are added, with a documented template. `lib/archive.ts` normalises transmissions and studio works into one list, and provides reel link parsing (a malformed link fails the build), related works and active themes. Works in `lib/catalog.ts` gain a `themes` field. |
| 3. Homepage | The hero uses the real Afterimage artwork, with a muted looping excerpt that starts only when motion is allowed and Save-Data is off. Sections: Transmissions, Areas of exploration, The philosophy (evidence / interpretation / speculation), The Collective (real rooms and a real guideline, no invented messages), and one quiet "Support the work" block. The seed-of-life hero canvas has been removed. |
| 4. Transmissions and archive | `/transmissions` and `/transmissions/[slug]`: a click-to-load Instagram embed (nothing loads from Instagram until play), synopsis, themes, kinds of claim, transcript, sources and related works. `/archive` has theme filters as static pages at `/archive/themes/[theme]`; only themes with work get a page. `/archive/[slug]` covers studies and experiments. `/observatory/[slug]` now sends a 308 redirect to `/archive/[slug]`. |

Checks run: production build; axe (WCAG 2.1 AA and best practice) on every new page at 1440px and 390px, with no violations; a keyboard tab order check with a visible focus ring at each stop; no horizontal overflow at 390, 768 or 1440px; and the member dashboard and plans page checked with the local preview account.

### To add a transmission

Add an entry to `content/transmissions.ts`: slug, title, the reel's share link, synopsis and themes. Everything else is optional. The homepage, `/transmissions`, the archive, the theme pages and the "works" counts all update on the next deploy.

### Still open

- No reels are listed yet, because Instagram could not be reached from the build environment. Until reels are added, the site links to the @synestharium profile instead.
- The Instagram embed's height adjusts using Instagram's own `MEASURE` message, with a 720px fallback. This could not be tested against a live reel here, so check it once the first reel is added.
- Collective and About in the nav point to homepage sections until step 5 builds their pages.
- `app/_ui/collective/preview.tsx` still shows two invented messages on the members' `/community` page (for non-members). It was left alone because the members' area was kept as-is. Recommendation: remove the messages.
- Still to do: steps 5 (About, Collective pages), 6 (Plans copy), 7 (SEO: OG image, sitemap, robots, JSON-LD) and 8 (full verification pass).
