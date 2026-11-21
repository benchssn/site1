"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted, looping excerpt of a real film laid over its own poster.
 * It only starts when motion is welcome and data isn't constrained, and pauses off-screen.
 */
export function AmbientFilm({ src }: { src: string }) {
  const [enabled, setEnabled] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () => setEnabled(!motion.matches && !connection?.saveData);
    // Wait until the page has settled so the film never competes with first paint.
    const start = window.setTimeout(update, 1200);
    motion.addEventListener("change", update);
    return () => { window.clearTimeout(start); motion.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    const element = video.current;
    if (!enabled || !element) return;
    const view = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) element.play().catch(() => {});
      else element.pause();
    });
    view.observe(element);
    return () => view.disconnect();
  }, [enabled]);

  if (!enabled) return null;
  return <video ref={video} className="ambient-film" src={src} muted loop playsInline autoPlay preload="auto"
    aria-hidden="true" tabIndex={-1} onPlaying={(event) => event.currentTarget.setAttribute("data-playing", "")} />;
}
