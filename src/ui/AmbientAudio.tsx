import { useEffect, useRef } from "react";
import { useStore } from "../lib/store";

/**
 * A generative ambient drone — a few detuned oscillators through a slowly
 * sweeping low-pass filter. Created lazily on the first unmute (a user
 * gesture), and fully defensive: if WebAudio is unavailable the experience
 * simply stays silent.
 */
export default function AmbientAudio() {
  const entered = useStore((s) => s.entered);
  const muted = useStore((s) => s.muted);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const builtRef = useRef(false);

  useEffect(() => {
    if (!entered) return;

    const fade = (to: number, time: number) => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(to, ctx.currentTime, time);
    };

    if (muted) {
      fade(0.0001, 0.6);
      return;
    }

    try {
      if (!builtRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        ctxRef.current = ctx;

        const master = ctx.createGain();
        master.gain.value = 0.0001;
        master.connect(ctx.destination);
        masterRef.current = master;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 520;
        filter.Q.value = 3;
        filter.connect(master);

        // A minor-ish stack: A1, E2, A2, C3, E3
        const freqs = [55, 82.41, 110, 130.81, 164.81];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = i % 2 ? "sine" : "triangle";
          osc.frequency.value = f;
          osc.detune.value = (Math.random() - 0.5) * 9;
          const g = ctx.createGain();
          g.gain.value = 0.16 / (i + 1);
          osc.connect(g);
          g.connect(filter);
          osc.start();
        });

        // slow filter sweep for movement
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.045;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 260;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        builtRef.current = true;
      }

      const ctx = ctxRef.current;
      if (ctx && ctx.state === "suspended") void ctx.resume();
      fade(0.32, 1.6);
    } catch {
      /* WebAudio unavailable — stay silent */
    }
  }, [entered, muted]);

  useEffect(() => {
    return () => {
      try {
        void ctxRef.current?.close();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return null;
}
