"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { fieldHeight, fieldWidth, traceInterference, waveInk } from "@/app/_ui/interference";
import { saveProgress } from "@/app/_ui/progress-client";

const baseFrequency = 196; // G3: low enough to sit under the visuals.

/**
 * Full-frame version of the Interference study. The phase slider (or a slow sine drift) moves the
 * second source. An optional sine tone sounds at the level two equal tones would reach with that
 * offset, |cos(phase / 2)|: full in phase, silent at 180°.
 */
export default function InterferenceSpace({ slug }: { slug: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(0);
  const phaseRef = useRef(0);
  const audio = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  const sliderId = useId();
  const [phase, setPhase] = useState(0);
  const [drift, setDrift] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Count a visit as complete after a minute of attention in the space.
  useEffect(() => {
    const timer = window.setTimeout(() => saveProgress(slug, 60, true), 60_000);
    return () => window.clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    phaseRef.current = phase;
    const node = audio.current;
    if (node) node.gain.gain.setTargetAtTime(.07 * Math.abs(Math.cos(phase * Math.PI / 360)), node.ctx.currentTime, .25);
  }, [phase]);

  useEffect(() => {
    const surface = canvas.current;
    const box = stage.current;
    const ctx = surface?.getContext("2d");
    if (!surface || !box || !ctx) return;
    let frame = 0;
    let last = 0;
    let width = 0;
    let height = 0;
    let started = performance.now();

    function paint() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      const scale = Math.min(width / fieldWidth, height / fieldHeight) * .96;
      ctx!.setTransform(scale, 0, 0, scale, (width - fieldWidth * scale) / 2, (height - fieldHeight * scale) / 2);
      ctx!.strokeStyle = waveInk;
      ctx!.lineWidth = 1.1 / Math.max(scale, .6);
      traceInterference(time.current, phaseRef.current, (opacity) => {
        ctx!.globalAlpha = opacity;
        ctx!.beginPath();
      }, (x, y, first) => first ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y), () => ctx!.stroke());
      ctx!.globalAlpha = 1;
    }

    function resize() {
      const bounds = box!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.round(bounds.width * ratio);
      height = Math.round(bounds.height * ratio);
      surface!.width = width;
      surface!.height = height;
      paint();
    }

    function tick(now: number) {
      if (now - last >= 31) {
        time.current += Math.min(now - (last || now), 60) * .00135;
        if (drift) {
          // A 48-second sine sweep through the full phase range.
          const next = Math.round((Math.sin((now - started) / 48_000 * Math.PI * 2 - Math.PI / 2) * .5 + .5) * 360);
          if (next !== phaseRef.current) setPhase(next);
        }
        last = now;
        paint();
      }
      frame = requestAnimationFrame(tick);
    }

    const sizes = new ResizeObserver(resize);
    sizes.observe(box);
    resize();
    function sync() {
      cancelAnimationFrame(frame);
      last = 0;
      // Resume the sweep from the current phase: invert v = (1 - cos(pi * e / 24s)) / 2.
      started = performance.now() - 24_000 * Math.acos(1 - 2 * (phaseRef.current / 360)) / Math.PI;
      if (!paused && !still && !document.hidden) frame = requestAnimationFrame(tick);
      else paint();
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused, still, drift]);

  useEffect(() => () => { void audio.current?.ctx.close(); }, []);

  async function toggleSound() {
    if (sound && audio.current) {
      const { ctx, gain } = audio.current;
      gain.gain.setTargetAtTime(0, ctx.currentTime, .2);
      await new Promise((resolve) => setTimeout(resolve, 600));
      await ctx.suspend();
      setSound(false);
      return;
    }
    if (!audio.current) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      // Root and fifth, with a gentle 0.1 Hz tremolo LFO on the fifth.
      const root = ctx.createOscillator();
      root.frequency.value = baseFrequency;
      root.connect(gain);
      const fifthGain = ctx.createGain();
      fifthGain.gain.value = .35;
      const fifth = ctx.createOscillator();
      fifth.frequency.value = baseFrequency * 1.5;
      fifth.connect(fifthGain).connect(gain);
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = .1;
      depth.gain.value = .15;
      lfo.connect(depth).connect(fifthGain.gain);
      [root, fifth, lfo].forEach((osc) => osc.start());
      audio.current = { ctx, gain };
    }
    const { ctx, gain } = audio.current;
    await ctx.resume();
    gain.gain.setTargetAtTime(.07 * Math.abs(Math.cos(phaseRef.current * Math.PI / 360)), ctx.currentTime, .3);
    setSound(true);
  }

  const amplitude = Math.abs(Math.cos(phase * Math.PI / 360));
  return <div className="space-stage" ref={stage}>
    <canvas ref={canvas} role="img"
      aria-label={"Two overlapping wave fields at " + phase + " degrees phase difference."} />
    <div className="space-hud space-hud-top">
      <Link href="/spaces" className="button secondary small">← Back to Spaces</Link>
      <p className="mono">Interference Field</p>
    </div>
    <div className="space-hud space-hud-bottom">
      <div className="space-phase">
        <label htmlFor={sliderId}>Phase difference <output htmlFor={sliderId} className="mono">{phase}°</output></label>
        <input id={sliderId} type="range" min="0" max="360" step="5" value={phase} disabled={drift}
          aria-valuetext={phase + " degrees"} onChange={(event) => setPhase(Number(event.target.value))} />
        <p className="mono small-text" title="Two equal tones offset by this phase sum to |cos(phase / 2)| of their peak.">Tone level {Math.round(amplitude * 100)}% · silent at 180°</p>
      </div>
      <div className="space-controls">
        <button type="button" className="button secondary small" aria-pressed={sound} onClick={() => void toggleSound()}>{sound ? "Sound off" : "Sound on"}</button>
        {!still && <button type="button" className="button secondary small" aria-pressed={drift} onClick={() => setDrift((value) => !value)}>{drift ? "Stop drift" : "Drift phase"}</button>}
        {!still && <button type="button" className="button secondary small" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? "Resume waves" : "Pause waves"}</button>}
      </div>
    </div>
  </div>;
}
