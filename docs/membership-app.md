# Synestharium member app

How the public site, enrollment and the signed-in workspace fit together, what is live, and what each planned feature still needs.

## Route map

| Area | Route | Status | Notes |
|---|---|---|---|
| Landing | `/` | Live | Scroll-led chapters (Learn, Library, Collective, Spaces), each ending in a call to action that leads to `/plans`. Links to the public films. |
| Public films | `/observatory/[slug]` | Live | Free films only. Member works redirect into the workspace. |
| Plan selection | `/plans` | Live | One page for every membership call to action. Entitlements come from `lib/plans.ts`, which derives them from the catalogue. |
| Sign in, register, recover | `/signin`, `/signin?mode=register` | Live | Supabase email magic link. `next` is preserved through the emailed link with a short-lived cookie. |
| Home | `/dashboard` | Live | Membership status, series progress with Start/Continue, Collective and Spaces cards, latest releases. |
| Collective | `/community`, `/community/[room]` | Live (needs Supabase) | Room directory, then a room view with history, composer, presence and moderation. The existing Collective implementation. |
| Messages | `/community/messages` | Planned | See below. |
| Learn | `/learn`, `/learn/series/[slug]`, `/learn/studies` | Live | Series (ordered syllabus) and Studies (standalone films). |
| Work detail | `/works/[slug]` | Live | Shared by Home, Learn and Library. The access gate sits where playback starts. |
| Spaces | `/spaces` | Live, empty | No space is open. The Interference study was a placeholder and has been removed. |
| Spaces: world | `/spaces/world` | Planned | See below. |
| Library | `/library`, `/library/releases`, `/library/concepts[/slug]`, `/library/transcripts`, `/library/sources` | Live; Sources planned | All current releases are instrumental, so Transcripts lists each work's sound note. |
| Account | `/account`, `/account/plan` | Live | Current plan, Stripe billing portal, and in-app upgrade with `?return=`. |
| Old URLs | `/membership`, `/chat` | Redirects | Forwarded to `/account` or `/plans`, and to `/community`. |

## Access model

There is one authoritative entitlement: `billing_customers.access_until`. The Stripe webhook keeps it in sync, and so does the post-checkout return (`/account/plan?checkout=success` reconciles with Stripe straight away).

- **Pages** call `getViewer()` / `canAccess()` (`lib/viewer.ts`), which read that row once per request.
- **Room entry** (`/community/[room]`) re-checks with `hasAccess()`. **Room history and writes** are checked in SQL by `collective_history` and `collective_write`. **Realtime** is checked by the `collective_can_stream()` RLS policy.
- **Member media** resolves only after access is confirmed:
  - Experiences render only for entitled viewers.
  - Private films get a one-hour signed URL from the private `member-media` bucket.
  - Locked visitors never receive a playable URL.
- **Progress writes** (`/api/progress`) apply the same rule for member works.

Account states:

| State | What it can do |
|---|---|
| Signed out | Public site, plans, and public films. |
| Free account | Everything open, plus progress tracking and browsing syllabi and the Library. |
| Synestharium+ | Everything. |

### Catalogue

`lib/catalog.ts` holds every work, series, concept and space, each with an `access` level. To publish a member film:

1. Upload it to the `member-media` bucket.
2. Add a work with `access: "member"` and `media: { type: "private", path: "<object path>" }`.
3. Add it to a series if it belongs in one.

Home, Learn, Library and the plan page all pick it up.

## Setup and deployment

1. Apply `supabase/migrations/202611170001_progress.sql`, which adds progress tracking. Until it runs, progress shows as unavailable and nothing breaks.
2. The Supabase magic-link email template must link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}`. This is unchanged from before.
3. Stripe: keep `STRIPE_PRICE_ID`. The plan page shows that price's amount and interval, and falls back to "shown at checkout". Webhook events are unchanged.
4. Optional local preview without Supabase: `SYNESTHARIUM_DEV_ACCOUNT=free` or `=member` with `pnpm dev`. It is ignored outside `next dev` (`NODE_ENV=development`). It previews layouts and gates only. Chat, progress and checkout still need real credentials.

## Adding a second paid tier

Today there is one paid tier, Synestharium+ (`STRIPE_PRICE_ID`). A second tier (for example, a higher "patron" level) would need:

1. **Stripe**: a second Price, its ID in a new env var, and the Billing Portal configured to switch between the two products.
2. **Billing sync**:
   - `subscriptionsFor` / `reconcileCustomer` (`lib/billing.ts`) filter on a single price. Map each price to a tier instead.
   - Add a `tier` column (or one `access_until` per tier) to `billing_customers` in a new migration.
3. **Checkout**: `startCheckout` takes a `tier` field from the plan form, chooses its price, and includes the tier in the idempotency key.
4. **Access rules**:
   - Change `Access` in `lib/catalog.ts` to a ranked set (`free < member < patron`), and make `canAccess` compare ranks.
   - Update `lib/plans.ts` so each tier lists what it unlocks.
5. **Database checks**: if any room or media is tier-specific, `collective_can_stream`, `collective_write`, `collective_history` and `collective_online` need the tier condition as well as `access_until`.

## Planned features and their dependencies

| Feature | Status | Needs |
|---|---|---|
| Direct messages | Planned state shown | Conversation and participant tables with per-participant access rules, a Realtime channel per conversation, and blocking and reporting that extend room moderation. |
| Navigable 3D world | Planned state shown | A separate build: a 3D engine (e.g. three.js), world assets, avatar and presence service, performance budget for mobile. Scope from the assets Synestharium actually has. |
| Library sources | Planned state shown | A reviewed reference list per concept. |
| Transcripts | Ready, nothing to show | Works with spoken content. Set `speech: "transcript"` and add the text. |
| Ranks, achievements, streaks | Not built | Not enough tracked activity to make them meaningful yet: 3 works and room posts. Revisit once the catalogue grows. |
