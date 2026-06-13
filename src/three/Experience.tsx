import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, Preload, PerformanceMonitor } from "@react-three/drei";
import { PAGES } from "../lib/chapters";
import { clamp } from "../lib/math";
import CameraRig from "./CameraRig";
import Nebula from "./Nebula";
import Starfield from "./Starfield";
import Dragon from "./Dragon";
import CosmicObjects from "./CosmicObjects";
import Logo from "./Logo";
import Effects from "./Effects";
import ProgressSync from "./ProgressSync";
import Overlay from "../ui/Overlay";

export default function Experience() {
  // Scale particle budgets, shader cost and resolution to the device so the
  // experience stays smooth — especially on phones.
  const tier = useMemo(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1280;
    const dd = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    const mobile =
      w < 820 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (mobile) {
      return {
        mobile: true,
        dragon: 5000,
        stars: 3500,
        logo: 2500,
        clouds: 3,
        octaves: 3,
        // Never supersample; cap below native dpr for fill-rate headroom.
        dprMin: Math.min(0.75, dd),
        dprStart: Math.min(1.0, dd),
        dprMax: Math.min(1.3, dd),
      };
    }
    return {
      mobile: false,
      dragon: 15000,
      stars: 13000,
      logo: 5500,
      clouds: 6,
      octaves: 5,
      dprMin: Math.min(1.0, dd),
      dprStart: Math.min(1.5, dd),
      dprMax: Math.min(2.0, dd),
    };
  }, []);

  // Adaptive resolution: nudge dpr down when the framerate dips, back up when
  // there's headroom, and lock low after repeated flip-flops.
  const [dpr, setDpr] = useState(tier.dprStart);

  return (
    <Canvas
      dpr={dpr}
      gl={{
        antialias: !tier.mobile,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 60, near: 0.1, far: 700, position: [0, 0, 40] }}
    >
      <color attach="background" args={["#03020a"]} />

      <PerformanceMonitor
        onIncline={() =>
          setDpr((d) => clamp(+(d + 0.2).toFixed(2), tier.dprMin, tier.dprMax))
        }
        onDecline={() =>
          setDpr((d) => clamp(+(d - 0.2).toFixed(2), tier.dprMin, tier.dprMax))
        }
        flipflops={3}
        onFallback={() => setDpr(tier.dprMin)}
      />

      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.3}>
          <CameraRig />
          <Nebula low={tier.mobile} octaves={tier.octaves} clouds={tier.clouds} />
          <Starfield count={tier.stars} />
          <Dragon count={tier.dragon} />
          <CosmicObjects />
          <Logo count={tier.logo} />
          <ProgressSync />

          <Scroll html style={{ width: "100%" }}>
            <Overlay />
          </Scroll>
        </ScrollControls>

        <Effects low={tier.mobile} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
