# Synestharium

Short audiovisual studies in light, colour and sound, with a members' workspace: Home, Collective, Learn, Spaces and Library.

Next.js 16 · Supabase (auth, data, Realtime, storage) · Stripe (Checkout, Billing Portal, webhooks).

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in the Supabase and Stripe keys. To preview signed-in layouts locally without Supabase, set `SYNESTHARIUM_DEV_ACCOUNT=free` or `=member`. This works only under `next dev`.

See [docs/membership-app.md](docs/membership-app.md) for the route map, the access model, deployment steps, and what a second paid tier or the planned features would need.
