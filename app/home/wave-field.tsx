"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fieldHeight, fieldWidth, traceInterference, waveInk } from "./interference";

export default function WaveField({ variant }: { variant: "laboratory" }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const time = useRef(0);
  const phaseId = useId();
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const experiment = variant === "laboratory";

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updatePreference() { setReducedMotion(media.matches); }
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const surface = canvas.current;
    const stageElement = stage.current;
    const context = surface?.getContext("2d");
    if (!surface || !stageElement || !context || !window.ResizeObserver || !window.IntersectionObserver) return;
    const still = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let visible = false;
    let last = 0;
    let previousStep = 0;
    let width = 0;
    let height = 0;

    function paint() {
      if (!context || !surface || !width || !height) return;
      context.setTransform(width / fieldWidth, 0, 0, height / fieldHeight, 0, 0);
      context.clearRect(0, 0, fieldWidth, fieldHeight);
      context.strokeStyle = waveInk;
      context.lineWidth = 1.02;
      traceInterference(time.current, phase, (opacity) => {
        context.globalAlpha = opacity;
        context.beginPath();
      }, (x, y, first) => {
        if (first) context.moveTo(x, y);
        else context.lineTo(x, y);
      }, () => context.stroke());
      stageElement?.setAttribute("data-rendered", "true");
    }

    function resize() {
      if (!surface || !stageElement) return;
      const bounds = stageElement.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.round(bounds.width * ratio);
      height = Math.round(bounds.height * ratio);
      surface.width = width;
      surface.height = height;
      paint();
    }

    function tick(now: number) {
      if (!visible || document.hidden || paused || still) return;
      if (now - previousStep >= 31) {
        if (last) time.current += Math.min(now - last, 60) * .00135;
        last = now;
        previousStep = now;
        paint();
      }
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden && !paused && !still) frame = requestAnimationFrame(tick);
    }

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(stageElement);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    viewObserver.observe(stageElement);
    document.addEventListener("visibilitychange", sync);
    resize();
    return () => {
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      cancelAnimationFrame(frame);
    };
  }, [paused, phase, reducedMotion, variant]);

  return <figure className={"wave-figure wave-" + variant}>
    <div className="wave-stage" ref={stage} role="img"
      aria-label={experiment
        ? "A perspective plot of the combined height of two waves. Adjust phase to move the peaks and troughs."
        : "Two wave sources produce overlapping ripples, with fine lines tracing the resulting surface."}>
      <canvas ref={canvas} aria-hidden="true" />
    </div>
    <figcaption>
      {experiment ? <><span className="wave-fallback">Wave field at 0° phase difference</span><div className="wave-phase">
        <label htmlFor={phaseId}>Phase difference <output htmlFor={phaseId}>{phase}°</output></label>
        <input id={phaseId} type="range" min="0" max="360" step="15" value={phase}
          aria-valuetext={phase + " degrees"} onChange={(event) => setPhase(Number(event.target.value))} />
              </div></> : null}
      {!reducedMotion && <button type="button" className="wave-motion" onClick={() => setPaused((value) => !value)}>
        {paused ? "Play" : "Pause"}
      </button>}
    </figcaption>
  </figure>;
}
