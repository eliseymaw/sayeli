import { useEffect, useRef } from "react";
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../lib/store";
import { chapterAt } from "../lib/chapters";

/**
 * Bridges the WebGL scroll state into the React store that drives the HTML
 * UI (chapter rail, scroll hint), and fulfils imperative "seek to chapter"
 * requests from the navigation. Updates are coarse to avoid re-render storms.
 */
export default function ProgressSync() {
  const scroll = useScroll();
  const setProgress = useStore((s) => s.setProgress);
  const seekTo = useStore((s) => s.seekTo);
  const clearSeek = useStore((s) => s.clearSeek);
  const last = useRef({ o: -1, ch: -1 });

  useEffect(() => {
    if (seekTo == null) return;
    const el = scroll.el;
    if (el) {
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: seekTo * max, behavior: "smooth" });
    }
    clearSeek();
  }, [seekTo, scroll, clearSeek]);

  useFrame(() => {
    const rounded = Math.round(scroll.offset * 100) / 100;
    const ch = chapterAt(scroll.offset).index;
    if (rounded !== last.current.o || ch !== last.current.ch) {
      last.current = { o: rounded, ch };
      setProgress(rounded, ch);
    }
  });

  return null;
}
