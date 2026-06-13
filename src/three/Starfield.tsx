import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { STAR_VERT, STAR_FRAG } from "./shaders";
import { smoothstep } from "../lib/math";

const STAR_PALETTE = [
  new THREE.Color("#fbf4ff"),
  new THREE.Color("#cfe0ff"),
  new THREE.Color("#a9b6ff"),
  new THREE.Color("#ffe9b8"),
  new THREE.Color("#f7d8ff"),
];

export default function Starfield({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    const color = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // spherical shell with a few bright giants
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      const r = 120 + Math.random() * 170;
      pos[i * 3] = Math.cos(a) * Math.sin(b) * r;
      pos[i * 3 + 1] = Math.cos(b) * r;
      pos[i * 3 + 2] = Math.sin(a) * Math.sin(b) * r;
      const giant = Math.random() > 0.97;
      size[i] = giant ? 4 + Math.random() * 4 : 0.6 + Math.random() * 1.8;
      seed[i] = Math.random();
      c.copy(STAR_PALETTE[(Math.random() * STAR_PALETTE.length) | 0]);
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 320);
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFade: { value: 1 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    }),
    [gl],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const o = scroll.offset;
    uniforms.uTime.value += dt;
    // Stars fade out across the melancholic legacy, then a new firmament
    // ignites at the rebirth.
    const fade = 1 - 0.8 * smoothstep(0.66, 0.86, o);
    const reborn = 0.9 * smoothstep(0.92, 1.0, o);
    uniforms.uFade.value = Math.max(fade, reborn);
    if (group.current) {
      group.current.rotation.y += dt * 0.0065;
      group.current.rotation.x = Math.sin(uniforms.uTime.value * 0.02) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={STAR_VERT}
          fragmentShader={STAR_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
