import "server-only";
import { seriesWorks, type Series } from "./catalog";
import { dataReady, database } from "./service";
import type { Viewer } from "./viewer";

export type Progress = { tracked: boolean; done: Set<string>; started: Map<string, number> };

const untracked = (): Progress => ({ tracked: false, done: new Set(), started: new Map() });

export async function progressFor(viewer: Viewer | null): Promise<Progress> {
  if (!viewer || viewer.dev || !dataReady()) return untracked();
  const { data, error } = await database().from("member_progress")
    .select("work,position_seconds,completed_at").eq("user_id", viewer.id);
  if (error) {
    console.error("Unable to read progress");
    return untracked();
  }
  const progress: Progress = { tracked: true, done: new Set(), started: new Map() };
  for (const row of data) {
    if (row.completed_at) progress.done.add(row.work);
    else progress.started.set(row.work, row.position_seconds);
  }
  return progress;
}

/** Where a member should go next in a series, plus how far through they are. */
export function seriesState(entry: Series, progress: Progress) {
  const parts = seriesWorks(entry);
  const complete = parts.filter(({ item }) => progress.done.has(item.slug)).length;
  const next = parts.find(({ item }) => !progress.done.has(item.slug)) ?? parts[0];
  const begun = complete > 0 || parts.some(({ item }) => progress.started.has(item.slug));
  return { parts, complete, total: parts.length, next, begun, finished: complete === parts.length };
}
