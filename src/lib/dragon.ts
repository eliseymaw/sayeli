import * as THREE from "three";

/**
 * Procedurally generates the Night Dragon as a cloud of particles.
 *
 * Every particle is given several target positions so the same body of
 * stardust can morph through the whole life cycle:
 *   • scatter  — a diffuse cosmic cloud (birth collapse / death dispersal)
 *   • position — the formed dragon (a sinuous body, swept wings, a horned head)
 *   • galaxy   — a face-on spiral disk (the rebirth)
 *
 * The shader blends between these targets based on scroll, while applying
 * living motion (body undulation, wing flap, curl drift).
 */

export interface DragonGeometry {
  count: number;
  position: Float32Array;
  scatter: Float32Array;
  galaxy: Float32Array;
  spineT: Float32Array; // 0..1 along the body — drives colour + undulation phase
  flap: Float32Array; // wing-flap lever arm (0 for non-wing particles)
  seed: Float32Array; // per-particle randomness
  size: Float32Array; // base point size
  eye: Float32Array; // 1 for the eye particles, else 0
  eyeL: [number, number, number];
  eyeR: [number, number, number];
}

const HEAD_X = 17;
const TAIL_X = -26;
const WING_ROOT_T = 0.17;
const WING_LEN = 18;
const GAL_R = 48;
const ARMS = 3;

const UP = new THREE.Vector3(0, 1, 0);

function spineAt(t: number, out: THREE.Vector3) {
  const x = THREE.MathUtils.lerp(HEAD_X, TAIL_X, t);
  const y = Math.sin(t * Math.PI * 1.7) * 3.0 * (1 - t * 0.25) + Math.sin(t * 6.0) * 0.22;
  const z = Math.sin(t * Math.PI * 1.15 + 0.8) * 3.8;
  out.set(x, y, z);
}

// Approximate parallel-transport-ish frame; good enough for a glowing cloud.
function frameAt(
  t: number,
  pos: THREE.Vector3,
  T: THREE.Vector3,
  N: THREE.Vector3,
  B: THREE.Vector3,
  tmp: THREE.Vector3,
) {
  spineAt(t, pos);
  spineAt(Math.min(1, t + 0.004), tmp);
  T.copy(tmp).sub(pos).normalize();
  if (!isFinite(T.x) || T.lengthSq() < 1e-6) T.set(-1, 0, 0);
  N.copy(UP).cross(T);
  if (N.lengthSq() < 1e-6) N.set(0, 0, 1);
  N.normalize();
  B.copy(T).cross(N).normalize();
}

function bodyRadius(t: number) {
  const shoulder = Math.exp(-Math.pow((t - 0.2) / 0.18, 2));
  const core = Math.sin(Math.PI * Math.pow(t, 0.85));
  let r = 0.45 + 2.3 * shoulder + 1.0 * core * (1 - t);
  r *= 1 - t * 0.55;
  return Math.max(0.12, r);
}

export function buildDragon(count: number): DragonGeometry {
  const position = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const galaxy = new Float32Array(count * 3);
  const spineT = new Float32Array(count);
  const flap = new Float32Array(count);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const eye = new Float32Array(count);

  const pos = new THREE.Vector3();
  const T = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  const nWingEach = Math.floor(count * 0.15);
  const nHead = Math.floor(count * 0.05);
  const nEye = Math.min(140, Math.floor(count * 0.012));
  const nTail = Math.floor(count * 0.08);
  const nBody = count - nWingEach * 2 - nHead - nEye - nTail;

  let i = 0;
  const put = (x: number, y: number, z: number, t: number, fl: number, sz: number, ey: number) => {
    position[i * 3] = x;
    position[i * 3 + 1] = y;
    position[i * 3 + 2] = z;
    spineT[i] = t;
    flap[i] = fl;
    size[i] = sz;
    eye[i] = ey;
    seed[i] = Math.random();
    i++;
  };

  // ── Body ──────────────────────────────────────────────────────────────
  for (let k = 0; k < nBody; k++) {
    const t = Math.pow(Math.random(), 1.15);
    frameAt(t, pos, T, N, B, tmp);
    const r = bodyRadius(t) * (0.5 + 0.55 * Math.random());
    const a = Math.random() * Math.PI * 2;
    const nx = Math.cos(a);
    const ny = Math.sin(a) * 0.82; // slight belly squash
    put(
      pos.x + (nx * N.x + ny * B.x) * r,
      pos.y + (nx * N.y + ny * B.y) * r,
      pos.z + (nx * N.z + ny * B.z) * r,
      t,
      0,
      0.55 + 0.8 * Math.random(),
      0,
    );
  }

  // ── Wings ─────────────────────────────────────────────────────────────
  const root = new THREE.Vector3();
  spineAt(WING_ROOT_T, root);
  root.y += 0.4;
  for (const s of [1, -1]) {
    const outDir = new THREE.Vector3(-0.14, 0.5, s * 0.86).normalize();
    const backDir = new THREE.Vector3(-0.92, -0.2, s * 0.08).normalize();
    for (let k = 0; k < nWingEach; k++) {
      const u = Math.pow(Math.random(), 0.85); // along span (root→tip)
      const v = Math.random(); // along chord (leading→trailing)
      const span = u * WING_LEN;
      const scallop = 0.55 + 0.45 * Math.abs(Math.sin(u * Math.PI * 4));
      const chord = v * (9.0 * (1 - u * 0.55)) * scallop;
      const camber = Math.sin(v * Math.PI) * 1.3 * Math.sin(u * Math.PI);
      put(
        root.x + outDir.x * span + backDir.x * chord,
        root.y + outDir.y * span + backDir.y * chord + camber,
        root.z + outDir.z * span + backDir.z * chord,
        0.24,
        span, // flap lever arm
        0.45 + 0.6 * Math.random(),
        0,
      );
    }
  }

  // ── Head ──────────────────────────────────────────────────────────────
  const headPos = new THREE.Vector3();
  spineAt(0.03, headPos);
  for (let k = 0; k < nHead; k++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const rr = Math.pow(Math.random(), 0.6);
    put(
      headPos.x + Math.cos(a) * Math.sin(b) * rr * 2.0,
      headPos.y + Math.sin(a) * Math.sin(b) * rr * 1.4 + 0.2,
      headPos.z + Math.cos(b) * rr * 1.6,
      0.0,
      0,
      0.7 + 0.9 * Math.random(),
      0,
    );
  }

  // ── Eyes ──────────────────────────────────────────────────────────────
  frameAt(0.05, pos, T, N, B, tmp);
  const eyeL = pos.clone().add(B.clone().multiplyScalar(1.15)).add(UP.clone().multiplyScalar(0.55)).add(T.clone().multiplyScalar(-0.8));
  const eyeR = pos.clone().add(B.clone().multiplyScalar(-1.15)).add(UP.clone().multiplyScalar(0.55)).add(T.clone().multiplyScalar(-0.8));
  for (let k = 0; k < nEye; k++) {
    const c = k % 2 === 0 ? eyeL : eyeR;
    put(
      c.x + (Math.random() - 0.5) * 0.55,
      c.y + (Math.random() - 0.5) * 0.55,
      c.z + (Math.random() - 0.5) * 0.55,
      0.0,
      0,
      1.1 + 0.8 * Math.random(),
      1,
    );
  }

  // ── Tail (thin whip + final fan) ──────────────────────────────────────
  for (let k = 0; k < nTail; k++) {
    const t = 0.8 + 0.2 * Math.random();
    frameAt(t, pos, T, N, B, tmp);
    if (t > 0.93 && Math.random() < 0.5) {
      // spade fan at the very tip
      const fu = (Math.random() * 2 - 1) * 2.6;
      const fv = (Math.random() * 2 - 1) * 1.6;
      put(
        pos.x + T.x * fu + N.x * fv,
        pos.y + T.y * fu + N.y * fv + Math.abs(fu) * -0.1,
        pos.z + T.z * fu + N.z * fv,
        t,
        0,
        0.4 + 0.5 * Math.random(),
        0,
      );
    } else {
      const r = bodyRadius(t) * 0.45;
      const a = Math.random() * Math.PI * 2;
      put(
        pos.x + (Math.cos(a) * N.x + Math.sin(a) * B.x) * r,
        pos.y + (Math.cos(a) * N.y + Math.sin(a) * B.y) * r,
        pos.z + (Math.cos(a) * N.z + Math.sin(a) * B.z) * r,
        t,
        0,
        0.4 + 0.5 * Math.random(),
        0,
      );
    }
  }

  // Fill any rounding remainder so no particle is left at origin.
  while (i < count) {
    put(headPos.x, headPos.y, headPos.z, 0, 0, 0.5, 0);
  }

  // ── Alternate targets (shared loop over all particles) ────────────────
  for (let k = 0; k < count; k++) {
    // Diffuse spherical cloud for birth/death.
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    const rad = 24 + Math.random() * 60;
    scatter[k * 3] = Math.cos(a) * Math.sin(b) * rad;
    scatter[k * 3 + 1] = Math.sin(a) * Math.sin(b) * rad * 0.7;
    scatter[k * 3 + 2] = Math.cos(b) * rad;

    // Face-on spiral galaxy in the XY plane for rebirth.
    const gr = Math.pow(Math.random(), 0.5) * GAL_R;
    const arm = Math.floor(Math.random() * ARMS);
    const ang = (arm / ARMS) * Math.PI * 2 + gr * 0.14 + (Math.random() - 0.5) * (0.7 * (1 - gr / GAL_R) + 0.1);
    const bulge = gr < 7 ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 1.5;
    galaxy[k * 3] = Math.cos(ang) * gr;
    galaxy[k * 3 + 1] = Math.sin(ang) * gr;
    galaxy[k * 3 + 2] = bulge;
  }

  return {
    count,
    position,
    scatter,
    galaxy,
    spineT,
    flap,
    seed,
    size,
    eye,
    eyeL: [eyeL.x, eyeL.y, eyeL.z],
    eyeR: [eyeR.x, eyeR.y, eyeR.z],
  };
}
