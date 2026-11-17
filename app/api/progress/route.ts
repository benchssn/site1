import { findWork } from "@/lib/catalog";
import { auth, authReady, dataReady, database, hasAccess, siteOrigin } from "@/lib/service";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const json = (body: object, status = 200) => Response.json(body, { status, headers });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteOrigin()) return json({ error: "Unexpected origin." }, 403);
  if (!authReady() || !dataReady()) return json({ error: "Progress tracking is unavailable." }, 503);
  try {
    const raw = await request.text();
    if (raw.length > 512) return json({ error: "Request is too large." }, 413);
    let input: { slug?: unknown; position?: unknown; completed?: unknown };
    try { input = JSON.parse(raw); } catch { return json({ error: "Invalid request." }, 400); }
    const work = typeof input.slug === "string" ? findWork(input.slug) : undefined;
    const position = input.position;
    if (!work || typeof position !== "number" || !Number.isInteger(position) || position < 0 || position > 86_400
      || typeof input.completed !== "boolean") {
      return json({ error: "Invalid request." }, 400);
    }

    const client = await auth();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return json({ error: "Sign in to save progress." }, 401);
    // Same entitlement rule as playback: member works only record progress for members.
    if (work.access === "member" && !await hasAccess(user.id)) return json({ error: "Membership required." }, 403);

    const { error } = await database().rpc("record_progress", {
      member: user.id, work_slug: work.slug, position, done: input.completed,
    });
    if (error) throw error;
    return json({ ok: true });
  } catch {
    return json({ error: "Progress couldn’t be saved." }, 503);
  }
}
