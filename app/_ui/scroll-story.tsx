"use client";

import { useEffect } from "react";

/** Reveals `[data-reveal]` chapters as they scroll in and drives the thin reading-progress line. */
export default function ScrollStory() {
  useEffect(() => {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !window.IntersectionObserver) {
      items.forEach((item) => item.setAttribute("data-shown", ""));
      return;
    }
    root.setAttribute("data-story", "");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    items.forEach((item) => observer.observe(item));

    let pending = 0;
    function progress() {
      pending = 0;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--story", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    }
    const onScroll = () => { if (!pending) pending = requestAnimationFrame(progress); };
    progress();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(pending);
      root.removeAttribute("data-story");
    };
  }, []);
  return <div className="story-progress" aria-hidden="true" />;
}
