"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { reportReasons, type Message, type Profile, type Room, type RoomMarker } from "@/lib/collective";
import { chatRequest, errorMessage } from "./client-api";

type History = { messages: Message[]; more: boolean };

export function Avatar({ name }: { name: string }) {
  const symbols = ["◇", "○", "△", "⊹", "⬡", "◫"];
  const score = Array.from(name).reduce((sum, char) => sum + char.codePointAt(0)!, 0);
  return <span className="collective-avatar" aria-hidden="true">{symbols[score % symbols.length]}</span>;
}

function MessageRow({ message, profile, onChange }: {
  message: Message; profile: Profile; onChange: (action: string, args: object) => Promise<void>;
}) {
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(reportReasons[0]);
  const author = message.author;
  const own = author?.id === profile.id;
  const name = author?.username ?? "former member";
  const date = new Date(message.created_at);

  return <article className="collective-message">
    <Avatar name={name} />
    <div className="collective-message-content">
      <div className="collective-message-byline">
        <strong>{name}</strong>{own && <span className="collective-you">you</span>}
        <time dateTime={message.created_at} title={date.toLocaleString()}>{date.toLocaleString(undefined, {
          day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
        })}</time>
      </div>
      <p>{message.body}</p>
      {reporting && <form className="collective-report-form" onSubmit={async (event) => {
        event.preventDefault();
        await onChange("report", { id: message.id, reason });
        setReporting(false);
      }}>
        <label>Report reason <select value={reason} onChange={(event) => setReason(event.target.value)}>
          {reportReasons.map((option) => <option key={option}>{option}</option>)}
        </select></label>
        <button type="submit">Send report</button><button type="button" onClick={() => setReporting(false)}>Cancel</button>
      </form>}
    </div>
    <details className="collective-message-menu">
      <summary aria-label={"Actions for message from " + name}>⋯</summary>
      <div>
        {(own || profile.moderator) && <button onClick={() => {
          if (window.confirm(own ? "Delete this message?" : "Remove this message for everyone?")) {
            void onChange("delete", { id: message.id });
          }
        }}>{own ? "Delete message" : "Remove message"}</button>}
        {!own && <button onClick={() => setReporting(true)}>Report message</button>}
        {!own && author && <button onClick={() => void onChange("mute", { profileId: author.id })}>Mute {author.username}</button>}
        {!own && author && profile.moderator && <button onClick={() => {
          if (window.confirm("Suspend this member’s chat access?")) void onChange("suspend", { profileId: author.id });
        }}>Suspend member</button>}
      </div>
    </details>
  </article>;
}

export default function Conversation({ room, profile, activity, removals, reset, muted, onMuted, live }: {
  room: Room; profile: Profile; activity: RoomMarker | null; removals: number[]; reset: number; muted: string[];
  onMuted: () => void; live: boolean;
}) {
  const [history, setHistory] = useState<History | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [newBelow, setNewBelow] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const prepend = useRef<{ top: number; height: number } | null>(null);
  const latestRequest = useRef(0);
  const replacePending = useRef(false);
  const lastVisible = useRef<number | undefined>(undefined);
  const oldestRequest = useRef(0);
  const removed = useRef(new Set<number>());
  const requestId = useRef<{ body: string; id: string } | null>(null);

  const load = useCallback(async (replace: boolean, signal?: AbortSignal) => {
    const request = ++latestRequest.current;
    if (replace) {
      ++oldestRequest.current;
      replacePending.current = true;
    }
    try {
      const data = await chatRequest<History>("?mode=history&room=" + room, undefined, signal);
      if (signal?.aborted || request !== latestRequest.current) return;
      const rebuild = replacePending.current;
      replacePending.current = false;
      setHistory((current) => {
        const recent = data.messages.filter((message) => !removed.current.has(message.id));
        if (rebuild || !current || data.messages.length === 0) return { ...data, messages: recent };
        const first = data.messages[0].id;
        const previousTail = current.messages.at(-1)?.id;
        if (data.more && previousTail !== undefined && previousTail < first) return { ...data, messages: recent };
        const older = current.messages.filter((message) => message.id < first && !removed.current.has(message.id));
        return { messages: [...older, ...recent], more: older.length ? current.more : data.more };
      });
      setError("");
    } catch (err) {
      if (!signal?.aborted && request === latestRequest.current) setError(errorMessage(err));
    }
  }, [room]);

  useEffect(() => {
    const controller = new AbortController();
    void load(true, controller.signal);
    return () => controller.abort();
  }, [load, reset]);

  useEffect(() => {
    if (removals.length === 0) return;
    removals.forEach((id) => removed.current.add(id));
    setHistory((current) => current && ({ ...current, messages: current.messages.filter((message) => !removed.current.has(message.id)) }));
  }, [removals]);

  useEffect(() => {
    if (activity) void load(false);
  }, [activity, load]);

  useEffect(() => {
    if (live) return;
    const timer = window.setInterval(() => void load(false), 12000);
    return () => window.clearInterval(timer);
  }, [live, load]);

  useLayoutEffect(() => {
    if (!log.current) return;
    const latest = history?.messages.at(-1)?.id;
    if (!atBottom.current && latest && lastVisible.current && latest > lastVisible.current) setNewBelow(true);
    lastVisible.current = latest;
    if (prepend.current) {
      const { top, height } = prepend.current;
      log.current.scrollTop = top + log.current.scrollHeight - height;
      prepend.current = null;
    } else if (atBottom.current) log.current.scrollTop = log.current.scrollHeight;
  }, [history]);

  async function older() {
    const first = history?.messages[0]?.id;
    if (!first || loadingOlder) return;
    const request = ++oldestRequest.current;
    setLoadingOlder(true);
    try {
      const data = await chatRequest<History>("?mode=history&room=" + room + "&before=" + first);
      if (request !== oldestRequest.current) return;
      if (log.current) prepend.current = { top: log.current.scrollTop, height: log.current.scrollHeight };
      atBottom.current = false;
      setHistory((current) => {
        const unique = new Map([...data.messages, ...(current?.messages ?? [])].map((message) => [message.id, message]));
        return {
          more: data.more,
          messages: [...unique.values()].filter((message) => !removed.current.has(message.id)).sort((a, b) => a.id - b.id),
        };
      });
      setError("");
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoadingOlder(false); }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    if (Array.from(body).length > 1000) { setError("Keep messages to 1,000 characters."); return; }
    if (requestId.current?.body !== body) requestId.current = { body, id: crypto.randomUUID() };
    setSending(true);
    setError("");
    try {
      await chatRequest("", { action: "send", room, body, requestId: requestId.current.id });
      setDraft((value) => value.trim() === body ? "" : value);
      requestId.current = null;
      atBottom.current = true;
      setNewBelow(false);
      await load(false);
    } catch (err) { setError(errorMessage(err)); }
    finally { setSending(false); }
  }

  async function change(action: string, args: object) {
    setError("");
    setNotice("");
    try {
      await chatRequest("", { action, ...args });
      if (action === "mute") {
        onMuted();
        await load(true);
        setNotice("Member muted. You can undo this in Settings.");
      } else if (action === "report") {
        setNotice("Report sent to the moderators.");
      } else if (action === "suspend") {
        setNotice("Member suspended.");
      } else {
        const id = (args as { id: number }).id;
        removed.current.add(id);
        setHistory((current) => current && ({ ...current, messages: current.messages.filter((message) => message.id !== id) }));
      }
    } catch (err) { setError(errorMessage(err)); }
  }

  const visible = history?.messages.filter((row) => !row.author || !muted.includes(row.author.id));
  return <>
    <div className="collective-history" ref={log} tabIndex={0} aria-label="Message history" onScroll={(event) => {
      const box = event.currentTarget;
      atBottom.current = box.scrollHeight - box.scrollTop - box.clientHeight < 65;
      if (atBottom.current) setNewBelow(false);
    }}>
      {newBelow && <button className="collective-new" onClick={() => {
        atBottom.current = true;
        setNewBelow(false);
        if (log.current) log.current.scrollTop = log.current.scrollHeight;
      }}>New messages ↓</button>}
      {!history && error && <button className="collective-older" onClick={() => void load(true)}>Retry loading</button>}
      {history?.more && <button className="collective-older" onClick={older} disabled={loadingOlder}>
        {loadingOlder ? "Loading…" : "Load older messages"}
      </button>}
      <div role="log" aria-label="Room messages">
        {!visible ? <p className="collective-empty">{error ? "History is unavailable." : "Loading conversation…"}</p>
          : visible.length === 0 ? <p className="collective-empty">No messages yet. Start the conversation.</p>
          : visible.map((message) => <MessageRow key={message.id} message={message} profile={profile} onChange={change} />)}
      </div>
    </div>
    <form className="collective-composer" onSubmit={send}>
      <label className="visually-hidden" htmlFor="collective-draft">Your message</label>
      <textarea id="collective-draft" value={draft} onChange={(event) => setDraft(event.target.value)}
        placeholder="Write a message…" rows={2} maxLength={2000} required />
      <button className="button primary" disabled={sending || !draft.trim()}>{sending ? "Sending…" : "Send"} <span aria-hidden="true">↑</span></button>
      {(error || notice) && <p role="status" className="collective-status">{error || notice}</p>}
    </form>
  </>;
}
