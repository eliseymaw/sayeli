import { AnimatePresence } from "framer-motion";
import Experience from "./three/Experience";
import Chrome from "./ui/Chrome";
import Intro from "./ui/Intro";
import AmbientAudio from "./ui/AmbientAudio";
import { useStore } from "./lib/store";

export default function App() {
  const entered = useStore((s) => s.entered);

  return (
    <>
      <Experience />

      {/* Cinematic grade overlays */}
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />

      <Chrome />
      <AmbientAudio />

      <AnimatePresence>{!entered && <Intro key="intro" />}</AnimatePresence>
    </>
  );
}
