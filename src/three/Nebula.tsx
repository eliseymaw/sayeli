import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { SKY_VERT, SKY_FRAG, CLOUD_VERT, CLOUD_FRAG } from "./shaders";
import { smoothstep } from "../lib/math";

/** Distant nebula billboards the dragon drifts past during the journey. */
interface CloudDef {
  pos: [number, number, number];
  scale: number;
  color: string;
  seed: number;
  range: [number, number]; // scroll window of visibility
  max: number;
}

const CLOUDS: CloudDef[] = [
  { pos: [-60, 30, -120], scale: 180, color: "#5a2c8c", seed: 1.2, range: [0.0, 1.0], max: 0.35 },
  { pos: [90, -40, -150], scale: 220, color: "#243a8c", seed: 3.4, range: [0.0, 1.0], max: 0.3 },
  { pos: [40, 20, -40], scale: 90, color: "#8a3ad0", seed: 7.1, range: [0.3, 0.7], max: 0.55 },
  { pos: [-55, -25, -30], scale: 100, color: "#2f6bd6", seed: 9.8, range: [0.34, 0.66], max: 0.5 },
  { pos: [10, 45, -60], scale: 120, color: "#b0408f", seed: 5.5, range: [0.42, 0.72], max: 0.6 }, // cosmic storm
  { pos: [-30, -50, -90], scale: 140, color: "#3a2266", seed: 2.9, range: [0.6, 1.0], max: 0.4 },
];

function Cloud({ def }: { def: CloudDef }) {
  const mesh = useRef<THREE.Mesh>(null);
  const scroll = useScroll();
  const { camera } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: Math.random() * 100 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(def.color) },
      uSeed: { value: def.seed },
    }),
    [def],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    uniforms.uTime.value += dt;
    const o = scroll.offset;
    const vis =
      smoothstep(def.range[0], def.range[0] + 0.08, o) *
      (1 - smoothstep(def.range[1] - 0.08, def.range[1], o));
    // Fade clouds during the melancholic legacy.
    const legacy = 1 - 0.5 * smoothstep(0.66, 0.84, o);
    uniforms.uOpacity.value = def.max * vis * legacy;
    if (mesh.current) {
      mesh.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <mesh ref={mesh} position={def.pos}>
      <planeGeometry args={[def.scale, def.scale]} />
      <shaderMaterial
        vertexShader={CLOUD_VERT}
        fragmentShader={CLOUD_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function SkyDome() {
  const scroll = useScroll();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMood: { value: 0 },
      uCore: { value: 1 },
      uRebirth: { value: 0 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const o = scroll.offset;
    uniforms.uTime.value += dt;
    uniforms.uCore.value = 1 - smoothstep(0.0, 0.13, o);
    uniforms.uMood.value =
      smoothstep(0.6, 0.84, o) * (1 - smoothstep(0.9, 1.0, o));
    uniforms.uRebirth.value = smoothstep(0.9, 1.0, o);
  });

  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[300, 48, 48]} />
      <shaderMaterial
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Nebula() {
  return (
    <>
      <SkyDome />
      {CLOUDS.map((def, i) => (
        <Cloud key={i} def={def} />
      ))}
    </>
  );
}
