import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { buildDragon } from "../lib/dragon";
import { DRAGON_VERT, DRAGON_FRAG } from "./shaders";
import { makeGlowTexture } from "../lib/texture";
import { clamp, smoothstep } from "../lib/math";

export default function Dragon({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const eyeLRef = useRef<THREE.Sprite>(null);
  const eyeRRef = useRef<THREE.Sprite>(null);
  const scroll = useScroll();
  const { gl } = useThree();

  const data = useMemo(() => buildDragon(count), [count]);
  const eyeGlow = useMemo(
    () =>
      makeGlowTexture([
        [0, "rgba(255,236,184,0.92)"],
        [0.26, "rgba(255,206,122,0.62)"],
        [0.55, "rgba(255,172,82,0.22)"],
        [1, "rgba(255,160,80,0)"],
      ]),
    [],
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.position, 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(data.scatter, 3));
    g.setAttribute("aGalaxy", new THREE.BufferAttribute(data.galaxy, 3));
    g.setAttribute("aSpineT", new THREE.BufferAttribute(data.spineT, 1));
    g.setAttribute("aFlap", new THREE.BufferAttribute(data.flap, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(data.seed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(data.size, 1));
    g.setAttribute("aEye", new THREE.BufferAttribute(data.eye, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 120);
    return g;
  }, [data]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uForm: { value: 0 },
      uGalaxy: { value: 0 },
      uDissolve: { value: 0 },
      uFlap: { value: 0 },
      uEye: { value: 0 },
      uBright: { value: 1.0 },
      uScale: { value: 1.0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uColorA: { value: new THREE.Color("#3a2f8f") },
      uColorB: { value: new THREE.Color("#9a59ff") },
      uColorEye: { value: new THREE.Color("#ffd87a") },
    }),
    [gl],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const o = scroll.offset;
    const u = uniforms;
    u.uTime.value += dt;

    // Birth: collapse from stardust into the formed dragon.
    u.uForm.value = smoothstep(0.02, 0.15, o);

    // Death → rebirth: chaotic dispersal, then resolve into a galaxy.
    u.uDissolve.value =
      smoothstep(0.84, 0.89, o) * (1 - smoothstep(0.9, 0.95, o));
    u.uGalaxy.value = smoothstep(0.88, 0.975, o);

    // Wings beat from awakening through the journey, then tire with age.
    u.uFlap.value =
      smoothstep(0.16, 0.32, o) * (1 - smoothstep(0.7, 0.85, o));

    // Eyes ignite at the awakening, fade as the dragon passes.
    u.uEye.value =
      smoothstep(0.17, 0.27, o) * (1 - smoothstep(0.86, 0.92, o));

    // Brightness dims through the melancholic legacy, blooms at rebirth.
    const legacy = smoothstep(0.66, 0.84, o);
    const rebirth = smoothstep(0.9, 1.0, o);
    u.uBright.value = 1.0 - 0.55 * legacy + 0.5 * rebirth;
    u.uScale.value = 1.0 + 0.12 * smoothstep(0.34, 0.66, o);

    if (group.current) {
      const breathe = u.uForm.value * (1 - u.uGalaxy.value);
      group.current.position.y = Math.sin(u.uTime.value * 0.4) * 0.8 * breathe;
      group.current.rotation.z =
        Math.sin(u.uTime.value * 0.25) * 0.025 * breathe;
      // Settle to flat as it becomes a face-on galaxy.
      group.current.rotation.x = -0.35 * clamp(u.uGalaxy.value);
    }

    // Luminous eyes — smooth glow sprites that ignite at the awakening.
    const eyeOn = u.uEye.value;
    const pulse = 0.85 + 0.15 * Math.sin(u.uTime.value * 2.6);
    const sc = (1.1 + 0.7 * eyeOn) * pulse;
    for (const ref of [eyeLRef, eyeRRef]) {
      const s = ref.current;
      if (!s) continue;
      s.scale.setScalar(sc);
      (s.material as THREE.SpriteMaterial).opacity = eyeOn;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={matRef}
          vertexShader={DRAGON_VERT}
          fragmentShader={DRAGON_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <sprite ref={eyeLRef} position={data.eyeL}>
        <spriteMaterial
          map={eyeGlow}
          color={"#ffd27a"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite ref={eyeRRef} position={data.eyeR}>
        <spriteMaterial
          map={eyeGlow}
          color={"#ffd27a"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}
