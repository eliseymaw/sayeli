/**
 * Renders text to an offscreen canvas and samples its lit pixels into a cloud
 * of 3D points. Used for the finale, where stardust resolves into the SAYELI
 * wordmark. Returns positions centered on the origin, sized to `worldWidth`.
 */
export function sampleText(
  text: string,
  count: number,
  opts: { worldWidth?: number; fontFamily?: string; weight?: number; spacing?: number } = {},
): Float32Array {
  const worldWidth = opts.worldWidth ?? 44;
  const fontFamily = opts.fontFamily ?? "Cormorant Garamond, Georgia, serif";
  const weight = opts.weight ?? 500;
  const spacing = opts.spacing ?? 0.32;

  const W = 1400;
  const H = 360;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const out = new Float32Array(count * 3);

  if (!ctx) {
    // Defensive fallback: a flat line of points.
    for (let i = 0; i < count; i++) {
      out[i * 3] = (Math.random() - 0.5) * worldWidth;
      out[i * 3 + 1] = (Math.random() - 0.5) * 4;
      out[i * 3 + 2] = 0;
    }
    return out;
  }

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Fit the font size so the letterspaced word spans the canvas width.
  let fontSize = 260;
  const spaced = text.split("").join(" "); // hair spaces; we also manual-track below
  const measureFont = (px: number) => {
    ctx.font = `${weight} ${px}px ${fontFamily}`;
    // approximate letterspacing by adding spacing*px per gap
    return ctx.measureText(text).width + spacing * px * (text.length - 1);
  };
  while (measureFont(fontSize) > W * 0.9 && fontSize > 20) fontSize -= 6;
  ctx.font = `${weight} ${fontSize}px ${fontFamily}`;

  // Draw each glyph manually so we control the tracking precisely.
  const letterW = (ch: string) => ctx.measureText(ch).width;
  const gap = spacing * fontSize;
  let total = 0;
  for (const ch of text) total += letterW(ch);
  total += gap * (text.length - 1);
  let cx = W / 2 - total / 2;
  for (const ch of text) {
    const w = letterW(ch);
    ctx.fillText(ch, cx + w / 2, H / 2);
    cx += w + gap;
  }
  void spaced;

  const img = ctx.getImageData(0, 0, W, H).data;
  const candidates: number[] = [];
  const step = 2;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const alpha = img[(y * W + x) * 4 + 3];
      if (alpha > 130) {
        candidates.push(x, y);
      }
    }
  }

  const nCand = candidates.length / 2;
  const worldHeight = (worldWidth * H) / W;

  for (let i = 0; i < count; i++) {
    let cxp: number;
    let cyp: number;
    if (nCand > 0) {
      const idx = Math.floor(Math.random() * nCand) * 2;
      cxp = candidates[idx] + (Math.random() - 0.5) * step;
      cyp = candidates[idx + 1] + (Math.random() - 0.5) * step;
    } else {
      cxp = Math.random() * W;
      cyp = Math.random() * H;
    }
    out[i * 3] = (cxp / W - 0.5) * worldWidth;
    out[i * 3 + 1] = -(cyp / H - 0.5) * worldHeight;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
  }

  return out;
}
