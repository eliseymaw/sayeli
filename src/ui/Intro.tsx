import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import { BRAND } from "../data/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Intro() {
  const enter = useStore((s) => s.enter);
  const toggleMute = useStore((s) => s.toggleMute);

  const begin = (withSound: boolean) => {
    if (withSound) toggleMute(); // store defaults to muted
    enter();
  };

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.12, filter: "blur(16px)" }}
      transition={{ duration: 1.4, ease: EASE }}
    >
      <motion.div
        className="mark"
        initial={{ opacity: 0, letterSpacing: "0.6em", y: 14 }}
        animate={{ opacity: 1, letterSpacing: "0.3em", y: 0 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        {BRAND.name}
      </motion.div>

      <motion.div
        className="tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.6, ease: EASE }}
      >
        {BRAND.tagline} — {BRAND.role}
      </motion.div>

      <div className="bar">
        <motion.i
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.1, ease: EASE }}
        style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}
      >
        <button className="enter" onClick={() => begin(true)}>
          Enter with Sound
        </button>
        <button className="enter" onClick={() => begin(false)} style={{ opacity: 0.7 }}>
          Enter Silently
        </button>
      </motion.div>

      <motion.div
        className="tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.2, delay: 1.6 }}
        style={{ fontSize: "9px", letterSpacing: "0.3em" }}
      >
        Scroll to witness the life of the Night Dragon · headphones recommended
      </motion.div>
    </motion.div>
  );
}
