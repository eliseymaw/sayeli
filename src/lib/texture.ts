import * as THREE from "three";

/**
 * A soft radial glow sprite drawn to a canvas. Smooth gaussian-like falloff
 * blooms cleanly (unlike tiny ultra-bright point sprites, which ring under
 * mipmap bloom). Used for the dragon's eyes and other point-lights.
 */
export function makeGlowTexture(stops?: [number, string][]): THREE.Texture {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  const cs: [number, string][] =
    stops ?? [
      [0, "rgba(255,255,255,1)"],
      [0.18, "rgba(255,226,150,0.95)"],
      [0.45, "rgba(255,180,90,0.4)"],
      [1, "rgba(255,160,80,0)"],
    ];
  cs.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
