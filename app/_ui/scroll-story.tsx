"use client";

import { useEffect } from "react";

/** Fades `[data-reveal]` sections in once as they scroll into view. Skipped entirely under reduced motion. */
export default function ScrollStory() {
  useEffect(() => {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !window.IntersectionObserver) return;
    // Anything already on screen is shown immediately, so nothing flashes in above the fold.
    items.forEach((item) => { if (item.getBoundingClientRect().top < window.innerHeight) item.setAttribute("data-shown", ""); });
    root.setAttribute("data-story", "");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: "0px 0px -10% 0px" });
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      root.removeAttribute("data-story");
    };
  }, []);
  return null;
}
