"use client";

import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { guidelines, isRoom, rooms, type Alias, type Online, type Profile, type Report, type Room, type RoomMarker } from "@/lib/collective";
import { ChatError, chatRequest, errorMessage } from "./client-api";
import Conversation, { Avatar } from "./conversation";
import Geometry from "./geometry";

type Session = { profile: null } | { profile: Profile; url: string; key: string; token: string; muted: Alias[] };
const needsSignIn = (error: unknown) => error instanceof ChatError && [401, 403].includes(error.status);

function Settings({ profile, muted, onSaved }: { profile: Profile | null; muted: Alias[]; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(profile?.username ?? "");
  const [show, setShow] = useState(profile?.show_online ?? true);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(command: object, confirmation: string) {
    setBusy(true);
    setStatus("");
    try {
      await chatRequest("", command);
      await onSaved();
      setStatus(confirmation);
    } catch (error) { setStatus(errorMessage(error)); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save({ action: "profile", username: name, showOnline: show }, "Profile saved.");
  }
  return <div className="collective-settings">
    <form onSubmit={submit}>
      <label htmlFor="collective-name">Username</label>
      <input id="collective-name" value={name} onChange={(event) => setName(event.target.value)} required
        minLength={3} maxLength={24} pattern="[a-zA-Z][a-zA-Z0-9_]{2,23}" autoComplete="off" autoCapitalize="none" />
      <small>3–24 letters, digits, or underscores. Start with a letter. Names appear in lowercase.</small>
      <label className="collective-check"><input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} /> Show me online</label>
      <button className="button primary" disabled={busy}>{profile ? "Save profile" : "Enter The Collective"}</button>
    </form>
    {muted.length > 0 && <section aria-label="Muted members">
      <h3>Muted members</h3>
      <ul>{muted.map((entry) => <li key={entry.id}>{entry.username}
        <button disabled={busy} onClick={() => void save({ action: "unmute", profileId: entry.id }, "Member unmuted.")}>Unmute</button>
      </li>)}</ul>
    </section>}
    <p className="collective-status" role="status">{status}</p>
  </div>;
}

function Moderation({ onRemoved }: { onRemoved: () => void }) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try { setReports((await chatRequest<{ reports: Report[] }>("?mode=reports")).reports); }
    catch (error) { setStatus(errorMessage(error)); }
  }

  async function act(command: object, confirmation: string, prompt?: string) {
    if (prompt && !window.confirm(prompt)) return;
    setBusy(true);
    setStatus("");
    try {
      await chatRequest("", command);
      onRemoved();
      await load();
      setStatus(confirmation);
    } catch (error) { setStatus(errorMessage(error)); }
    finally { setBusy(false); }
  }

  return <details className="collective-disclosure" onToggle={(event) => {
    if (event.currentTarget.open) void load();
  }}>
    <summary>Moderation</summary>
    <button className="collective-minor" onClick={() => void load()} disabled={busy}>Refresh reports</button>
    {!reports ? <p>Reports haven’t loaded yet.</p> : reports.length === 0 ? <p>No open reports.</p>
      : <ul className="collective-reports">{reports.map((report) => <li key={report.id}>
        <strong>{report.reason}</strong>
        {report.message?.author && <p>@{report.message.author.username}</p>}
        {report.message?.body && <blockquote>{report.message.body}</blockquote>}
        <div>
          {report.message && <button disabled={busy} onClick={() => void act(
            { action: "delete", id: report.message!.id }, "Message removed.", "Remove this message for everyone?"
          )}>Remove message</button>}
          {report.message?.author && <button disabled={busy} onClick={() => void act(
            { action: "suspend", profileId: report.message!.author!.id }, "Member suspended.", "Suspend this member’s chat access?"
          )}>Suspend member</button>}
          <button disabled={busy} onClick={() => void act({ action: "resolve", id: report.id }, "Report resolved.")}>Resolve report</button>
        </div>
      </li>)}</ul>}
    <p className="collective-status" role="status">{status}</p>
  </details>;
}

export default function Collective() {
  const [session, setSession] = useState<Session | undefined>();
  const [room, setRoom] = useState<Room>("commons");
  const [online, setOnline] = useState<Online[]>([]);
  const [unread, setUnread] = useState<Partial<Record<Room, boolean>>>({});
  const [activity, setActivity] = useState<RoomMarker | null>(null);
  const [removals, setRemovals] = useState<number[]>([]);
  const [reset, setReset] = useState(0);
  const [live, setLive] = useState(false);
  const [locked, setLocked] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [presenceError, setPresenceError] = useState(false);
  const activeRoom = useRef<Room>("commons");
  const revisions = useRef<Partial<Record<Room, number>>>({});
  const latest = useRef<Partial<Record<Room, number>>>({});
  const refreshSerial = useRef(0);
  const sync = () => setReset((value) => value + 1);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const serial = ++refreshSerial.current;
    try {
      const data = await chatRequest<Session>("?mode=session", undefined, signal);
      if (signal?.aborted || serial !== refreshSerial.current) return;
      setSession(data);
      setSessionError("");
    } catch (error) {
      if (signal?.aborted || serial !== refreshSerial.current) return;
      if (needsSignIn(error)) {
        setLocked(errorMessage(error));
        setSession(undefined);
        setOnline([]);
      } else setSessionError(errorMessage(error));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const timer = window.setInterval(() => void refresh(controller.signal), 25000);
    const reconnect = () => { void refresh(controller.signal); };
    window.addEventListener("online", reconnect);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("online", reconnect);
    };
  }, [refresh]);

  const credentials = session && "token" in session ? session : null;
  const url = credentials?.url;
  const key = credentials?.key;
  const token = credentials?.token;
  const profileId = credentials?.profile.id;
  const showOnline = credentials?.profile.show_online;
  useEffect(() => {
    if (!url || !key || !token || locked) return;
    let closed = false;
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const channel = supabase.channel("collective-room-activity")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "collective_events" }, ({ new: row }) => {
        if (closed || !isRoom(row.room)) return;
        const marker = row as RoomMarker;
        const previousRevision = revisions.current[marker.room] ?? 0;
        if (marker.revision <= previousRevision) return;
        latest.current[marker.room] = marker.latest_message;
        revisions.current[marker.room] = marker.revision;
        if (marker.room === activeRoom.current) {
          if (previousRevision && marker.revision > previousRevision + 1) sync();
          if (marker.operation === "remove" && marker.changed_message !== null) {
            const removed = marker.changed_message;
            setRemovals((items) => [...items.slice(-255), removed]);
          }
          setActivity(marker);
        } else if (marker.operation === "message") {
          setUnread((value) => ({ ...value, [marker.room]: true }));
        }
      });
    setLive(false);
    void supabase.realtime.setAuth(token).then(() => {
      if (closed) return;
      channel.subscribe((status) => {
        if (closed) return;
        setLive(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") sync();
      });
    }).catch(() => setLive(false));
    return () => {
      closed = true;
      void supabase.removeChannel(channel);
    };
  }, [url, key, token, locked]);

  useEffect(() => {
    if (!profileId || locked) return;
    const controller = new AbortController();
    let pending = false;
    async function pulse() {
      if (document.hidden || pending || controller.signal.aborted) return;
      pending = true;
      try {
        if (showOnline) await chatRequest("", { action: "heartbeat", room }, controller.signal);
        const result = await chatRequest<{ online: Online[]; markers: RoomMarker[] }>("?mode=presence", undefined, controller.signal);
        if (controller.signal.aborted) return;
        setOnline(result.online);
        setPresenceError(false);
        for (const marker of result.markers) {
          if (!isRoom(marker.room) || marker.revision < (revisions.current[marker.room] ?? 0)) continue;
          const previous = latest.current[marker.room];
          const revision = revisions.current[marker.room];
          latest.current[marker.room] = marker.latest_message;
          revisions.current[marker.room] = marker.revision;
          if (marker.room === activeRoom.current && revision !== undefined && revision < marker.revision) sync();
          if (marker.room !== activeRoom.current && previous !== undefined && previous < marker.latest_message) {
            setUnread((current) => ({ ...current, [marker.room]: true }));
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (needsSignIn(error)) void refresh(controller.signal);
        setPresenceError(true);
      } finally { pending = false; }
    }
    void pulse();
    const timer = window.setInterval(() => void pulse(), 23000);
    document.addEventListener("visibilitychange", pulse);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", pulse);
    };
  }, [profileId, showOnline, locked, room, refresh]);

  function chooseRoom(next: Room) {
    if (next === room) return;
    activeRoom.current = next;
    setActivity(null);
    setRemovals([]);
    setRoom(next);
    setUnread((value) => ({ ...value, [next]: false }));
  }

  const profile = credentials?.profile;
  const roomInfo = rooms.find(({ id }) => id === room)!;
  if (locked) return <section className="wrap detail collective-locked">
    <h1>The Collective</h1><p role="status">{locked}</p><a className="button secondary" href="/membership">Go to membership</a>
  </section>;
  if (!session || !profile) return <section className="wrap detail collective-locked">
    <a className="back" href="/">← Synestharium</a>
    <div className="collective-gate-heading"><h1>The Collective</h1><Geometry /></div>
    {session ? <div className="account-panel"><h2>Choose a username</h2>
      <p>Your username will appear next to your messages. You can change it later in Settings.</p>
      <Settings profile={null} muted={[]} onSaved={() => refresh()} />
    </div> : <><p role="status">{sessionError || "Opening The Collective…"}</p>
      {sessionError && <button className="button secondary" onClick={() => void refresh()}>Try again</button>}</>}
  </section>;

  return <section className="collective-shell" aria-label="The Collective">
    <aside className="collective-nav" aria-label="Rooms and account">
      <a className="brand" href="/"><span className="mark" aria-hidden="true">⟐</span> SYNESTHARIUM</a>
      <h1>The Collective</h1>
      <nav aria-label="Chat rooms">{rooms.map(({ id, name }, index) =>
        <button key={id} onClick={() => chooseRoom(id)} aria-current={room === id ? "true" : undefined}>
          <span className="collective-room-number">0{index + 1}</span>
          <span>{name}</span>
          <span className="collective-room-count" title="Online in room">{online.filter((member) => member.room === id).length}<span className="visually-hidden"> online</span></span>
          {unread[id] && <span className="collective-unread"><span className="visually-hidden">Unread messages</span></span>}
        </button>
      )}</nav>
      <div className="collective-account">
        <div className="collective-identity"><Avatar name={profile.username} /><strong>{profile.username}</strong></div>
        <details className="collective-disclosure">
          <summary>Settings</summary>
          <Settings profile={profile} muted={credentials.muted} onSaved={async () => { await refresh(); sync(); }} />
          <a className="back collective-mobile-billing" href="/membership">Manage membership</a>
        </details>
        <a className="back" href="/membership">Manage membership</a>
        <a className="back" href="/">← Return to Synestharium</a>
        {sessionError && <p className="collective-status" role="status">{sessionError}</p>}
      </div>
    </aside>
    <div className="collective-chat">
      <header className="collective-room-header">
        <div>
          <p className="collective-connection"><span className={live ? "collective-live" : ""} />
            {live ? "Live" : "Reconnecting"} <span aria-hidden="true">·</span> {online.filter((member) => member.room === room).length} online
          </p>
          <h2>{roomInfo.name}</h2><p>{roomInfo.description}</p>
        </div>
        <Geometry />
      </header>
      <Conversation key={room} room={room} profile={profile} activity={activity} removals={removals} reset={reset}
        muted={credentials.muted.map(({ id }) => id)} onMuted={() => void refresh()} live={live} />
    </div>
    <aside className="collective-context" aria-label="Room information and guidelines">
      <details className="collective-disclosure">
        <summary>Online members</summary>
        {presenceError ? <p>Presence couldn’t refresh.</p> : online.length === 0 ? <p>No one is showing as online.</p>
          : <ul className="collective-online">{online.map((entry) => <li key={entry.id}>
            <Avatar name={entry.username} /><span>{entry.username}</span>
            {entry.room === room && <span className="collective-live" title="In this room" />}
          </li>)}</ul>}
      </details>
      <details className="collective-disclosure">
        <summary>Community guidelines</summary>
        <ul className="collective-guidelines">{guidelines.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
      {profile.moderator && <Moderation onRemoved={sync} />}
    </aside>
  </section>;
}
