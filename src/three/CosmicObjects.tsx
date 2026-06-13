import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { CONSTELLATIONS, ARTIFACTS } from "../data/portfolio";
import { DISK_VERT, DISK_FRAG } from "./shaders";
import { smoothstep } from "../lib/math";

/* ───── shared soft radial glow sprite texture ───── */
function makeGlow(): THREE.Texture {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,248,230,0.85)");
  g.addColorStop(0.5, "rgba(220,200,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* simple deterministic RNG so constellations are stable across reloads */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ───────────────────────── Constellations (skills) ───────────────────────── */

const CENTERS: [number, number, number][] = [
  [-58, 34, -46],
  [62, 42, -58],
  [4, 56, -72],
];

function ConstellationGroup({
  index,
  glow,
}: {
  index: number;
  glow: THREE.Texture;
}) {
  const scroll = useScroll();
  const pointsMat = useRef<THREE.PointsMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);

  const { pointsGeo, lineGeo } = useMemo(() => {
    const data = CONSTELLATIONS[index];
    const n = data.stars.length;
    const center = new THREE.Vector3(...CENTERS[index]);
    const rng = lcg(1000 + index * 97);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      pts.push(
        new THREE.Vector3(
          center.x + (rng() - 0.5) * 26,
          center.y + (rng() - 0.5) * 20,
          center.z + (rng() - 0.5) * 16,
        ),
      );
    }
    const posArr = new Float32Array(n * 3);
    pts.forEach((p, i) => {
      posArr[i * 3] = p.x;
      posArr[i * 3 + 1] = p.y;
      posArr[i * 3 + 2] = p.z;
    });
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(posArr, 3));

    const segs: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      segs.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    }
    // a couple of cross links for a richer figure
    if (n > 3) {
      segs.push(pts[0].x, pts[0].y, pts[0].z, pts[n - 1].x, pts[n - 1].y, pts[n - 1].z);
      segs.push(pts[1].x, pts[1].y, pts[1].z, pts[n - 2].x, pts[n - 2].y, pts[n - 2].z);
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segs), 3));
    return { pointsGeo: pg, lineGeo: lg };
  }, [index]);

  useFrame((_, delta) => {
    const o = scroll.offset;
    const t = performance.now() * 0.001;
    const vis =
      smoothstep(0.17, 0.3 + index * 0.04, o) * (1 - smoothstep(0.74, 0.9, o));
    const twinkle = 0.7 + 0.3 * Math.sin(t * 1.5 + index);
    if (pointsMat.current) pointsMat.current.opacity = vis * twinkle;
    if (lineMat.current) lineMat.current.opacity = vis * 0.4;
    void delta;
  });

  return (
    <group>
      <points geometry={pointsGeo} frustumCulled={false}>
        <pointsMaterial
          ref={pointsMat}
          map={glow}
          size={5.5}
          sizeAttenuation
          color={"#fff0c4"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={lineGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={lineMat}
          color={"#e7c873"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/* ───────────────────────── Artifacts (projects) ───────────────────────── */

const ARTIFACT_POS: [number, number, number][] = [
  [-22, -6, -8],
  [-44, 10, -18],
  [-66, -10, -26],
  [-90, 6, -34],
];

function Artifact({
  i,
  glow,
}: {
  i: number;
  glow: THREE.Texture;
}) {
  const scroll = useScroll();
  const sprite = useRef<THREE.Sprite>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const pos = ARTIFACT_POS[i % ARTIFACT_POS.length];
  // each artifact is revealed as the journey progresses
  const reveal = 0.36 + (i / ARTIFACTS.length) * 0.26;

  useFrame(() => {
    const o = scroll.offset;
    const t = performance.now() * 0.001;
    const vis =
      smoothstep(reveal - 0.05, reveal + 0.03, o) *
      (1 - smoothstep(0.66, 0.82, o));
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.4 + i);
    if (sprite.current) {
      const sc = (5 + i * 0.4) * pulse * (0.4 + 0.6 * vis);
      sprite.current.scale.set(sc, sc, sc);
      (sprite.current.material as THREE.SpriteMaterial).opacity = vis;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.3 + i;
      ring.current.rotation.x = 1.1 + Math.sin(t * 0.2) * 0.2;
      (ring.current.material as THREE.MeshBasicMaterial).opacity = vis * 0.7;
    }
    if (ring2.current) {
      ring2.current.rotation.z = -t * 0.22 - i;
      ring2.current.rotation.y = t * 0.15;
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = vis * 0.45;
    }
  });

  return (
    <group position={pos}>
      <sprite ref={sprite}>
        <spriteMaterial
          map={glow}
          color={i % 2 === 0 ? "#ffe4a0" : "#c6a8ff"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <mesh ref={ring}>
        <torusGeometry args={[3.4 + i * 0.3, 0.045, 8, 96]} />
        <meshBasicMaterial
          color={"#e7c873"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[4.6 + i * 0.3, 0.03, 8, 96]} />
        <meshBasicMaterial
          color={"#9a7bff"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ───────────────────────── Black hole ───────────────────────── */

function BlackHole({ glow }: { glow: THREE.Texture }) {
  const scroll = useScroll();
  const group = useRef<THREE.Group>(null);
  const disk = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const diskUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }),
    [],
  );

  useFrame((_, delta) => {
    const o = scroll.offset;
    diskUniforms.uTime.value += Math.min(delta, 0.05);
    const vis =
      smoothstep(0.4, 0.47, o) * (1 - smoothstep(0.58, 0.66, o));
    diskUniforms.uOpacity.value = vis;
    if (disk.current) disk.current.rotation.z += delta * 0.15;
    if (halo.current) {
      const sc = 26 * (0.6 + 0.4 * vis);
      halo.current.scale.set(sc, sc, sc);
      (halo.current.material as THREE.SpriteMaterial).opacity = vis * 0.5;
    }
    if (group.current) group.current.visible = vis > 0.001;
  });

  return (
    <group ref={group} position={[-16, 12, -28]} rotation={[0.5, -0.4, 0.2]}>
      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[3.1, 32, 32]} />
        <meshBasicMaterial color={"#000000"} />
      </mesh>
      {/* accretion disk */}
      <mesh ref={disk} rotation={[Math.PI / 2.1, 0, 0]}>
        <planeGeometry args={[26, 26]} />
        <shaderMaterial
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          uniforms={diskUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* lensing glow */}
      <sprite ref={halo}>
        <spriteMaterial
          map={glow}
          color={"#ffb066"}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ───────────────────────── Dying stars (supernovae) ───────────────────────── */

const NOVA: { pos: [number, number, number]; at: number; color: string }[] = [
  { pos: [30, -14, -20], at: 0.5, color: "#ff7a3c" },
  { pos: [-12, 22, -36], at: 0.6, color: "#7ab8ff" },
];

function DyingStars({ glow }: { glow: THREE.Texture }) {
  const scroll = useScroll();
  const refs = useRef<(THREE.Sprite | null)[]>([]);

  useFrame(() => {
    const o = scroll.offset;
    NOVA.forEach((n, i) => {
      const s = refs.current[i];
      if (!s) return;
      const grow = smoothstep(n.at - 0.06, n.at + 0.02, o);
      const fade = 1 - smoothstep(n.at + 0.02, n.at + 0.12, o);
      const vis = grow * fade;
      const sc = (4 + grow * 26) * (0.4 + vis);
      s.scale.set(sc, sc, sc);
      (s.material as THREE.SpriteMaterial).opacity = vis;
    });
  });

  return (
    <>
      {NOVA.map((n, i) => (
        <sprite
          key={i}
          position={n.pos}
          ref={(el) => (refs.current[i] = el)}
        >
          <spriteMaterial
            map={glow}
            color={n.color}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </>
  );
}

/* ───────────────────────── Composite ───────────────────────── */

export default function CosmicObjects() {
  const glow = useMemo(() => makeGlow(), []);
  return (
    <>
      {CONSTELLATIONS.map((_, i) => (
        <ConstellationGroup key={i} index={i} glow={glow} />
      ))}
      {ARTIFACTS.map((_, i) => (
        <Artifact key={i} i={i} glow={glow} />
      ))}
      <BlackHole glow={glow} />
      <DyingStars glow={glow} />
    </>
  );
}
