import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../lib/store";
import { CHAPTERS } from "../lib/chapters";

export default function Chrome() {
  const entered = useStore((s) => s.entered);
  const muted = useStore((s) => s.muted);
  const toggleMute = useStore((s) => s.toggleMute);
  const chapter = useStore((s) => s.chapter);
  const offset = useStore((s) => s.offset);
  const requestSeek = useStore((s) => s.requestSeek);

  if (!entered) return null;

  const current = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)];

  return (
    <div className="chrome">
      {/* Slim scroll-progress bar (primary orientation cue on mobile) */}
      <div className="scrollbar" aria-hidden>
        <i style={{ transform: `scaleX(${offset})` }} />
      </div>

      <motion.div
        className="brandmark"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.92, y: 0 }}
        transition={{ duration: 1.4, delay: 0.4 }}
      >
        SAY<span>E</span>LI
      </motion.div>

      {/* Current-chapter label — shown on mobile where the rail is hidden */}
      <div className="chapter-indicator">
        <span className="num">{current.numeral}</span>
        <span className="ttl">{current.title}</span>
      </div>

      <motion.div
        className="hud"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.5 }}
      >
        <button onClick={toggleMute}>{muted ? "Sound Off" : "Sound On"}</button>
        <button onClick={() => requestSeek(0)}>Replay</button>
      </motion.div>

      {/* Chapter rail */}
      <motion.nav
        className="progress"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, delay: 0.7 }}
      >
        {CHAPTERS.map((c) => (
          <button
            key={c.id}
            className={chapter === c.index ? "active" : ""}
            onClick={() => requestSeek(Math.min(c.start + 0.01, 0.999))}
            aria-label={`Chapter ${c.numeral}: ${c.title}`}
          >
            <span className="label">
              {c.numeral} · {c.title}
            </span>
            <span className="dot" />
          </button>
        ))}
      </motion.nav>

      {/* Scroll hint, only at the very start */}
      <AnimatePresence>
        {offset < 0.02 && (
          <motion.div
            className="scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <span className="txt">Scroll</span>
            <span className="rail" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
