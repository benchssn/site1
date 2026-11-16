import { auth, authReady, dataReady, database, hasAccess, siteOrigin } from "@/lib/service";
import { isRoom, reportReasons } from "@/lib/collective";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
const json = (body: object, status = 200) => Response.json(body, { status, headers });
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const username = /^[a-z][a-z0-9_]{2,23}$/;
const messageFields = "id,body,created_at,author:collective_profiles!author_id(id,username)";

async function authorize() {
  if (!authReady()) return json({ error: "Sign in to enter The Collective." }, 401);
  if (!dataReady()) return json({ error: "The Collective is temporarily unavailable." }, 503);
  const client = await auth();
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError?.name === "AuthRetryableFetchError" || (authError?.status ?? 0) >= 500) throw authError;
  if (!user) return json({ error: "Sign in to enter The Collective." }, 401);
  if (!await hasAccess(user.id)) return json({ error: "An active Synestharium+ membership is required." }, 403);

  const db = database();
  const { data: profile, error } = await db.from("collective_profiles")
    .select("id,username,show_online,moderator,suspended_at").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (profile?.suspended_at) return json({ error: "Your access to The Collective is suspended." }, 403);
  return { client, db, profile, user };
}

export async function GET(request: Request) {
  try {
    const access = await authorize();
    if (access instanceof Response) return access;
    const { client, db, profile } = access;
    const params = new URL(request.url).searchParams;
    const mode = params.get("mode") || "session";

    if (mode === "session") {
      if (!profile) return json({ profile: null });
      // getUser has already verified the identity. The browser receives its own short-lived JWT for Realtime.
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token || data.session?.user.id !== access.user.id) return json({ error: "Sign in again." }, 401);
      const muted = await db.from("collective_mutes")
        .select("member:collective_profiles!muted_id(id,username)").eq("member_id", profile.id);
      if (muted.error) throw muted.error;
      return json({
        profile, token, muted: muted.data.map((row) => row.member),
        url: process.env.SUPABASE_URL, key: process.env.SUPABASE_PUBLISHABLE_KEY,
      });
    }
    if (!profile) return json({ error: "Choose a username to join." }, 422);

    if (mode === "history") {
      const room = params.get("room");
      const before = params.get("before");
      if (!isRoom(room) || (before !== null && !validId(before))) return json({ error: "Invalid history request." }, 400);
      const { data, error } = await db.rpc("collective_history", {
        viewer: profile.id, room_id: room, before_id: before,
      });
      if (error) throw error;
      return json({ messages: data.slice(0, 40).reverse(), more: data.length > 40 });
    }

    if (mode === "presence") {
      const [online, markers] = await Promise.all([
        db.rpc("collective_online", { viewer: profile.id }),
        db.from("collective_events").select("room,latest_message,revision"),
      ]);
      if (online.error || markers.error) throw online.error ?? markers.error;
      return json({ online: online.data, markers: markers.data });
    }

    if (mode === "reports") {
      if (!profile.moderator) return json({ error: "Moderator access is required." }, 403);
      const { data, error } = await db.from("collective_reports")
        .select("id,reason,message:collective_messages!message_id(" + messageFields + ")")
        .is("resolved_at", null).order("id", { ascending: true }).limit(40);
      if (error) throw error;
      return json({ reports: data });
    }
    return json({ error: "Unknown request." }, 400);
  } catch {
    return json({ error: "The Collective couldn’t load. Try again shortly." }, 503);
  }
}

function validId(value: unknown) {
  return (typeof value === "number" || typeof value === "string")
    && /^[1-9][0-9]{0,15}$/.test(String(value)) && Number.isSafeInteger(Number(value));
}

function validate(raw: unknown): { action: string; args: object } | null {
  if (!raw || typeof raw !== "object" || !("action" in raw)) return null;
  const input = raw as Record<string, unknown>;
  const action = input.action;
  switch (action) {
    case "profile": {
      const name = typeof input.username === "string" ? input.username.trim().toLowerCase() : "";
      return username.test(name) && typeof input.showOnline === "boolean"
        ? { action, args: { username: name, showOnline: input.showOnline } } : null;
    }
    case "heartbeat":
      return isRoom(input.room) ? { action, args: { room: input.room } } : null;
    case "send": {
      const body = typeof input.body === "string" ? input.body.replaceAll("\0", "").trim() : "";
      return body && [...body].length <= 1000 && isRoom(input.room)
        && typeof input.requestId === "string" && uuid.test(input.requestId)
        ? { action, args: { body, room: input.room, requestId: input.requestId } } : null;
    }
    case "delete":
    case "resolve":
      return validId(input.id) ? { action, args: { id: input.id } } : null;
    case "report":
      return validId(input.id) && reportReasons.some((reason) => reason === input.reason)
        ? { action, args: { id: input.id, reason: input.reason } } : null;
    case "mute":
    case "unmute":
    case "suspend":
      return typeof input.profileId === "string" && uuid.test(input.profileId)
        ? { action, args: { profileId: input.profileId } } : null;
    default:
      return null;
  }
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteOrigin()) return json({ error: "Unexpected origin." }, 403);
  try {
    const access = await authorize();
    if (access instanceof Response) return access;
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Missing request." }, 400);
    const decoder = new TextDecoder();
    let bytes = 0;
    let raw = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 16_384) {
        await reader.cancel();
        return json({ error: "Request is too large." }, 413);
      }
      raw += decoder.decode(value, { stream: true });
    }

    let command;
    try { command = validate(JSON.parse(raw + decoder.decode())); }
    catch { return json({ error: "Invalid request." }, 400); }
    if (!command) return json({ error: "Check the entered values and try again." }, 400);

    const { data, error } = await access.db.rpc("collective_write", {
      actor: access.user.id, action: command.action, args: command.args,
    });
    if (error) throw error;
    switch (data) {
      case "ok": return json({ ok: true }, command.action === "send" ? 201 : 200);
      case "forbidden": return json({ error: "You don’t have permission to complete this action." }, 403);
      case "profile_required": return json({ error: "Choose a username to join." }, 422);
      case "missing": return json({ error: "That item is no longer available." }, 404);
      case "taken": return json({ error: "That username is taken." }, 409);
      case "slow_down": return json({ error: "You’re sending requests too quickly. Try again later." }, 429);
      default: return json({ error: "Invalid request." }, 400);
    }
  } catch {
    return json({ error: "The Collective couldn’t save that action. Try again." }, 503);
  }
}
