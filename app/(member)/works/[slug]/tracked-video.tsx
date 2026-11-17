"use client";

import { useEffect, useRef } from "react";
import { saveProgress } from "@/app/_ui/progress-client";

/** A plain video player that saves position and completion for the signed-in member. */
export default function TrackedVideo({ slug, src, poster, title, resumeAt, track }: {
  slug: string; src: string; poster: string; title: string; resumeAt: number; track: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(0);

  useEffect(() => {
    const element = video.current;
    if (!element || !track) return;
    const save = (done: boolean) => {
      lastSaved.current = Date.now();
      saveProgress(slug, Math.floor(element.currentTime), done);
    };
    const onTime = () => { if (Date.now() - lastSaved.current > 15_000) save(false); };
    const onPause = () => { if (!element.ended) save(false); };
    const onEnded = () => save(true);
    const onLoaded = () => {
      if (resumeAt > 0 && resumeAt < element.duration - 2) element.currentTime = resumeAt;
    };
    element.addEventListener("timeupdate", onTime);
    element.addEventListener("pause", onPause);
    element.addEventListener("ended", onEnded);
    element.addEventListener("loadedmetadata", onLoaded);
    return () => {
      element.removeEventListener("timeupdate", onTime);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("ended", onEnded);
      element.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [slug, resumeAt, track]);

  return <video ref={video} controls playsInline preload="metadata" poster={poster} aria-label={title} src={src} />;
}
