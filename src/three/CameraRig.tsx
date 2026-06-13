import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { smootherstep } from "../lib/math";

interface Key {
  at: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/** Cinematic camera path keyed to the five chapters. */
const KEYS: Key[] = [
  { at: 0.0, pos: [3, 1.5, 15], target: [6, 0.5, 0], fov: 64 }, // Birth — intimate, in the dust
  { at: 0.16, pos: [13, 2.6, 18], target: [14.5, 1.4, 0], fov: 48 }, // Awakening — the eyes
  { at: 0.34, pos: [0, 7, 54], target: [-2, 0, 0], fov: 56 }, // Journey — full scale revealed
  { at: 0.5, pos: [-22, -5, 30], target: [-12, 0, -6], fov: 60 }, // Journey — low pass, black hole & artifacts
  { at: 0.66, pos: [18, 21, 66], target: [-6, -2, 0], fov: 44 }, // Legacy — high, wide, melancholic
  { at: 0.84, pos: [0, 7, 80], target: [0, 0, 0], fov: 52 }, // Rebirth — pulling away as it dissolves
  { at: 1.0, pos: [0, 0.5, 44], target: [0, 1, 5], fov: 56 }, // Finale — face-on galaxy & wordmark
];

const tmpPos = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const curPos = new THREE.Vector3(KEYS[0].pos[0], KEYS[0].pos[1], KEYS[0].pos[2]);
const curTarget = new THREE.Vector3(KEYS[0].target[0], KEYS[0].target[1], KEYS[0].target[2]);

export default function CameraRig() {
  const scroll = useScroll();
  const t = useRef(0);

  useFrame((state, delta) => {
    t.current += delta;
    const o = scroll.offset;

    // Find the active keyframe segment.
    let k = 0;
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (o >= KEYS[i].at && o <= KEYS[i + 1].at) {
        k = i;
        break;
      }
      if (o > KEYS[KEYS.length - 1].at) k = KEYS.length - 2;
    }
    const a = KEYS[k];
    const b = KEYS[k + 1];
    const seg = (o - a.at) / (b.at - a.at || 1);
    const e = smootherstep(0, 1, seg);

    tmpPos.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], e),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], e),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], e),
    );
    tmpTarget.set(
      THREE.MathUtils.lerp(a.target[0], b.target[0], e),
      THREE.MathUtils.lerp(a.target[1], b.target[1], e),
      THREE.MathUtils.lerp(a.target[2], b.target[2], e),
    );
    const fov = THREE.MathUtils.lerp(a.fov, b.fov, e);

    // Living breath + gentle mouse parallax.
    const breath = t.current;
    tmpPos.x += Math.sin(breath * 0.23) * 0.6 + state.pointer.x * 1.6;
    tmpPos.y += Math.cos(breath * 0.19) * 0.5 + state.pointer.y * 1.2;

    // Smooth follow so scrubbing never snaps.
    const lerpAmt = 1 - Math.exp(-6 * Math.min(delta, 0.05));
    curPos.lerp(tmpPos, lerpAmt);
    curTarget.lerp(tmpTarget, lerpAmt);

    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.copy(curPos);
    cam.lookAt(curTarget);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
