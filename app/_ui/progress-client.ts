/** Fire-and-forget progress save. Failures are silent: playback must never depend on it. */
export function saveProgress(slug: string, position: number, completed: boolean) {
  void fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, position: Math.max(0, Math.min(86_400, position)), completed }),
    keepalive: true,
  }).catch(() => undefined);
}
