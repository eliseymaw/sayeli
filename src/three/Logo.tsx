import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { sampleText } from "../lib/textPoints";
import { LOGO_VERT, LOGO_FRAG } from "./shaders";
import { BRAND } from "../data/portfolio";
import { smoothstep } from "../lib/math";

export default function Logo({ count = 5000 }: { count?: number }) {
  const scroll = useScroll();
  const { gl, size } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Fit the 38-unit-wide wordmark to the viewport so it's never clipped on
  // narrow / portrait screens. Based on the finale camera framing (the only
  // moment the logo is visible): ~37 units away, ~56° vertical fov.
  const fitScale = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    const visH = 2 * 37 * Math.tan((56 * Math.PI) / 180 / 2);
    const visW = visH * aspect;
    const target = visW * 0.82; // leave margin (fov is a touch tighter mid-reveal)
    return Math.max(0.3, Math.min(1, target / 38));
  }, [size.width, size.height]);

  const geometry = useMemo(() => {
    const target = sampleText(BRAND.name, count, { worldWidth: 38, weight: 500, spacing: 0.34 });
    const scatter = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // emerge out of the newborn galaxy disk
      const a = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 46;
      scatter[i * 3] = Math.cos(a) * r;
      scatter[i * 3 + 1] = Math.sin(a) * r * 0.8;
      scatter[i * 3 + 2] = (Math.random() - 0.5) * 8;
      seed[i] = Math.random();
      size[i] = 1.0 + Math.random() * 2.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(target, 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uForm: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uColor: { value: new THREE.Color("#fff3d4") },
    }),
    [gl],
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05);
    uniforms.uForm.value = smoothstep(0.93, 1.0, scroll.offset);
  });

  return (
    <points
      geometry={geometry}
      position={[0, 1.5, 7]}
      scale={fitScale}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={LOGO_VERT}
        fragmentShader={LOGO_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
