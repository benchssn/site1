"use client";

import { useEffect, useRef } from "react";

/**
 * Hero field: the seven-circle seed pattern, repeated in slow concentric shells.
 * Each shell breathes on its own sine LFO so the figure opens and closes without ever repeating exactly.
 */
export default function SeedField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let last = 0;

    function resize() {
      const box = element!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      element!.width = Math.round(width * ratio);
      element!.height = Math.round(height * ratio);
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now());
    }

    function draw(time: number) {
      const t = time / 1000;
      ctx!.clearRect(0, 0, width, height);
      const cx = width * (width > 760 ? .68 : .5);
      const cy = height * (width > 760 ? .5 : .38);
      const unit = Math.min(width, height) * (width > 760 ? .16 : .19);
      const circle = (x: number, y: number, r: number) => {
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.stroke();
      };
      for (let shell = 0; shell < 5; shell++) {
        // Each shell has its own slow sine LFO, so the figure breathes in overlapping waves.
        const breath = Math.sin(t * .21 + shell * .9) * .5 + .5;
        const spin = t * .016 * (shell % 2 ? -1 : 1) + shell * .26;
        ctx!.strokeStyle = `rgba(196, 201, 207, ${(.46 - shell * .075).toFixed(3)})`;
        ctx!.lineWidth = shell === 0 ? 1.1 : .8;
        if (shell === 0) {
          // Seed of life: one centre circle and six around it, each passing through the centre.
          const r = unit * (.94 + breath * .06);
          circle(cx, cy, r);
          for (let i = 0; i < 6; i++) circle(cx + Math.cos(spin + i * Math.PI / 3) * r, cy + Math.sin(spin + i * Math.PI / 3) * r, r);
          continue;
        }
        const count = 6 * (shell + 1);
        const ring = unit * (1.35 + shell * .62) * (.97 + breath * .05);
        const r = unit * (.42 + breath * .05);
        for (let i = 0; i < count; i++) {
          const angle = spin + i * Math.PI * 2 / count;
          circle(cx + Math.cos(angle) * ring, cy + Math.sin(angle) * ring, r);
        }
      }
    }

    function tick(time: number) {
      if (time - last > 40) { draw(time); last = time; }
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(frame);
      draw(performance.now());
      if (visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }

    const sizes = new ResizeObserver(resize);
    sizes.observe(element);
    const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    view.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      view.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <canvas ref={canvas} className="seed-field" aria-hidden="true" />;
}
