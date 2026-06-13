/** Small, dependency-free math helpers used across the scene. */

export const clamp = (v: number, min = 0, max = 1) =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth Hermite interpolation, the workhorse for scroll-driven reveals. */
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const smootherstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** Remap a value from one range to another, clamped. */
export const remap = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => outMin + (clamp((v - inMin) / (inMax - inMin)) * (outMax - outMin));

/** A 0→1→0 pulse that peaks in the middle of [a, b]. */
export const pulse = (a: number, b: number, x: number) => {
  const mid = (a + b) / 2;
  return x < mid ? smoothstep(a, mid, x) : 1 - smoothstep(mid, b, x);
};

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
