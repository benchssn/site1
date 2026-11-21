"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SeedMark } from "./icons";

/**
 * An Instagram reel behind a click-to-load facade. Nothing is requested from Instagram
 * (no script, no cookies) until the visitor chooses to play, which keeps pages fast and private.
 */
export function Reel({ embedSrc, pageHref, title, poster, autoload = false }: {
  embedSrc: string; pageHref: string; title: string; poster?: string; autoload?: boolean;
}) {
  const [loaded, setLoaded] = useState(autoload);
  const [height, setHeight] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  // Instagram's embed reports its content height; use it so captions and controls aren't cropped.
  useEffect(() => {
    if (!loaded) return;
    function measure(event: MessageEvent) {
      if (event.origin !== "https://www.instagram.com" || event.source !== frame.current?.contentWindow) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        const next = Number(data?.details?.height);
        if (data?.type === "MEASURE" && next > 200 && next < 2000) setHeight(next);
      } catch { /* Not a measurement message. */ }
    }
    window.addEventListener("message", measure);
    return () => window.removeEventListener("message", measure);
  }, [loaded]);

  return <div className="reel">
    {loaded ? (
      <iframe ref={frame} className="reel-frame" src={embedSrc} title={title + " (Instagram reel)"}
        style={height ? { height } : undefined} allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen loading="lazy" />
    ) : (
      <button type="button" className="reel-facade" onClick={() => setLoaded(true)}>
        {poster ? <Image src={poster} alt="" fill sizes="(max-width: 700px) 100vw, 400px" />
          : <span className="reel-blank" aria-hidden="true"><SeedMark size={40} /></span>}
        <span className="reel-play">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5Z" fill="currentColor" /></svg>
          Play <span className="visually-hidden">{title}</span>
        </span>
      </button>
    )}
    <p className="reel-note">
      {loaded ? "Playing from Instagram." : "Loads from Instagram when you press play."}{" "}
      <a href={pageHref} rel="noopener">Open on Instagram</a>
    </p>
  </div>;
}
