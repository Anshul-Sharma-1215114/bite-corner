"use client";

import { useEffect, useRef } from "react";

// A synthesized two-tone beep — no external audio asset to license or
// host, and it's generated fresh each time so there's nothing to preload.
function playBeep(ctx: AudioContext) {
  const now = ctx.currentTime;
  [0, 0.18].forEach((offset, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = i === 0 ? 880 : 1100;
    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.35, now + offset + 0.02);
    gain.gain.linearRampToValueAtTime(0, now + offset + 0.16);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.16);
  });
}

// Repeats a synthesized alarm beep on an interval for as long as `active`
// stays true — used for "new order" (admin) and "delivery assigned"
// (agent) alerts that should keep ringing until someone acts on them.
export function useOrderAlarm(active: boolean, intervalMs = 1500) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!active) return;

    // AudioContext needs a user gesture before it can produce sound in
    // most browsers; by the time an order/assignment alarm should fire,
    // the admin/agent has already interacted with the dashboard (logged
    // in, clicked around), so this resume is effectively a formality.
    function ensureContext(): AudioContext {
      if (!ctxRef.current) {
        const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new AudioContextCtor();
      }
      return ctxRef.current;
    }

    const ctx = ensureContext();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    playBeep(ctx);
    const id = setInterval(() => {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      playBeep(ctx);
    }, intervalMs);

    return () => clearInterval(id);
  }, [active, intervalMs]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
    };
  }, []);
}
