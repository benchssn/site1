"use client";

import { useEffect, useRef } from "react";

export default function Geometry() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dpr = Math.min(window.devicePixelRatio, 2);
    const size = 62;
    element.width = size * dpr;
    element.height = size * dpr;
    ctx.scale(dpr, dpr);
    let frame = 0;
    let last = -100;
    function draw(time: number) {
      if (time - last < 32) return;
      last = time;
      ctx!.clearRect(0, 0, size, size);
      for (let ring = 0; ring < 3; ring++) {
        ctx!.beginPath();
        ctx!.strokeStyle = ["#c7d6b8bb", "#a9bc9665", "#87977755"][ring];
        for (let point = 0; point <= 72; point++) {
          const angle = point * Math.PI / 36;
          const tempo = time / 3800 + ring * .58;
          const radius = 15 + ring * 4 + Math.sin(angle * 3 + tempo) * 3;
          const x = 31 + Math.cos(angle) * radius;
          const y = 31 + Math.sin(angle) * radius;
          if (point === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
      }
    }
    function animate(time: number) {
      draw(time);
      frame = requestAnimationFrame(animate);
    }
    function sync() {
      cancelAnimationFrame(frame);
      last = -100;
      draw(0);
      if (!media.matches && !document.hidden) frame = requestAnimationFrame(animate);
    }
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return <canvas className="collective-geometry" ref={canvas} width={62} height={62} aria-hidden="true" />;
}
