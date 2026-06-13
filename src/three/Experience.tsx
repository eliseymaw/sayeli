import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, Preload } from "@react-three/drei";
import { PAGES } from "../lib/chapters";
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
  // Scale particle budgets to the device so the experience stays smooth.
  const tier = useMemo(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1280;
    const mobile = w < 820 || /Mobi|Android/i.test(navigator.userAgent);
    return {
      mobile,
      dragon: mobile ? 6500 : 15000,
      stars: mobile ? 5000 : 13000,
      logo: mobile ? 3000 : 5500,
      dpr: mobile ? ([1, 1.5] as [number, number]) : ([1, 2] as [number, number]),
    };
  }, []);

  return (
    <Canvas
      dpr={tier.dpr}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 60, near: 0.1, far: 700, position: [0, 0, 40] }}
    >
      <color attach="background" args={["#03020a"]} />

      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.3}>
          <CameraRig />
          <Nebula />
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
