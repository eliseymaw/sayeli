/* eslint-disable */
/**
 * GLSL for the SAYELI universe. All materials are THREE.ShaderMaterial
 * (GLSL ES 1.00), so three injects the standard uniforms/attributes
 * (position, projectionMatrix, modelViewMatrix, uv, ...).
 */

/** Ashima simplex noise (3D) + fbm — shared by every atmospheric shader. */
export const NOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float f = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    f += a * snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return f;
}
`;

/* ───────────────────────────── DRAGON ───────────────────────────── */

export const DRAGON_VERT = /* glsl */ `
${NOISE}
uniform float uTime;
uniform float uForm;      // 0 = scattered cloud, 1 = formed dragon
uniform float uGalaxy;    // 0 = dragon, 1 = spiral galaxy
uniform float uDissolve;  // chaotic dispersal between life and rebirth
uniform float uFlap;      // wing-flap amount
uniform float uEye;       // eye ignition
uniform float uBright;
uniform float uScale;
uniform float uPixelRatio;
uniform vec3  uColorA;    // tail / cool
uniform vec3  uColorB;    // body / warm
uniform vec3  uColorEye;  // gold

attribute vec3  aScatter;
attribute vec3  aGalaxy;
attribute float aSpineT;
attribute float aFlap;
attribute float aSeed;
attribute float aSize;
attribute float aEye;

varying vec3  vColor;
varying float vBright;
varying float vAlpha;

void main(){
  float life = uForm * (1.0 - uGalaxy);

  // Blend through the three life-stages.
  vec3 p = mix(aScatter, position, uForm);
  p = mix(p, aGalaxy, uGalaxy);

  // Living body: an undulating wave travelling head→tail.
  float travel = sin(aSpineT * 9.0 - uTime * 1.7);
  p.y += travel * 0.55 * life * (0.35 + aSpineT);
  p.z += cos(aSpineT * 7.0 - uTime * 1.45) * 0.45 * life * (0.3 + aSpineT);

  // Wing flap (both wings beat together).
  float beat = sin(uTime * 2.1 - aFlap * 0.16);
  p.y += beat * aFlap * 0.085 * uFlap * life;
  p.x += abs(beat) * aFlap * 0.02 * uFlap * life;

  // Shimmer + chaotic dissolve.
  float n = snoise(p * 0.12 + uTime * 0.15 + aSeed * 4.0);
  p += n * (0.25 * life + uDissolve * (4.0 + aSeed * 8.0)) * normalize(p + 0.001);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  // Twinkle + perspective sizing.
  float tw = 0.7 + 0.3 * sin(uTime * 3.0 + aSeed * 40.0);
  float eyeBoost = 1.0 + aEye * uEye * 1.3;
  gl_PointSize = aSize * uScale * eyeBoost * uPixelRatio * tw * (300.0 / max(-mv.z, 1.0));
  gl_PointSize = clamp(gl_PointSize, 0.0, 24.0 * uPixelRatio);

  // Colour: cool tail → warm body → golden eyes.
  vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.6, aSpineT));
  // a warm, divine glow gathers at the head
  col = mix(col, vec3(0.95, 0.62, 0.32), (1.0 - smoothstep(0.0, 0.1, aSpineT)) * 0.4 * (1.0 - aEye));
  col = mix(col, uColorEye, aEye);
  vColor = col;
  vBright = uBright * (1.0 + aEye * uEye * 1.6) * (0.6 + 0.4 * tw);
  vAlpha = (0.5 + 0.5 * uForm) * (1.0 - uDissolve * 0.4);
}
`;

export const DRAGON_FRAG = /* glsl */ `
precision highp float;
varying vec3  vColor;
varying float vBright;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  float core = pow(a, 2.4);
  vec3 col = vColor * vBright * (0.32 + core * 1.4);
  gl_FragColor = vec4(col, a * a * vAlpha);
}
`;

/* ───────────────────────────── STARFIELD ───────────────────────────── */

export const STAR_VERT = /* glsl */ `
uniform float uTime;
uniform float uFade;
uniform float uPixelRatio;
attribute float aSize;
attribute float aSeed;
attribute vec3  aColor;
varying vec3  vColor;
varying float vTw;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.45 + 0.55 * sin(uTime * (0.8 + aSeed * 2.5) + aSeed * 60.0);
  vTw = tw;
  gl_PointSize = aSize * uPixelRatio * (0.6 + 0.6 * tw) * (260.0 / max(-mv.z, 1.0));
  gl_PointSize = clamp(gl_PointSize, 0.0, 8.0 * uPixelRatio);
  vColor = aColor * uFade;
}
`;

export const STAR_FRAG = /* glsl */ `
precision highp float;
varying vec3  vColor;
varying float vTw;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  float core = pow(a, 3.0);
  vec3 col = vColor * (0.5 + core * 2.2);
  gl_FragColor = vec4(col, a * (0.5 + 0.5 * vTw));
}
`;

/* ───────────────────────────── NEBULA SKY (dome) ───────────────────────────── */

export const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SKY_FRAG = /* glsl */ `
precision highp float;
${NOISE}
uniform float uTime;
uniform float uMood;   // 0 vivid -> 1 faded/melancholic
uniform float uCore;   // birth core glow
uniform float uRebirth;// final bloom of new colour
varying vec3 vDir;

void main(){
  vec3 dir = normalize(vDir);

  // Base vertical gradient: deep void -> midnight -> nebula.
  vec3 cVoid    = vec3(0.012, 0.010, 0.035);
  vec3 cMid     = vec3(0.05, 0.045, 0.13);
  vec3 cNebula  = vec3(0.28, 0.10, 0.42);
  float h = smoothstep(-0.5, 0.6, dir.y);
  vec3 col = mix(cVoid, cMid, h);

  // Layered nebula clouds.
  vec3 q = dir * 2.4 + vec3(0.0, 0.0, uTime * 0.012);
  float clouds = fbm(q);
  float clouds2 = fbm(q * 2.1 + 12.0 - uTime * 0.02);
  float density = smoothstep(0.05, 0.85, clouds * 0.6 + clouds2 * 0.4 + 0.25);

  vec3 neb = mix(cNebula, vec3(0.10, 0.18, 0.5), clouds2 * 0.5 + 0.5);
  neb = mix(neb, vec3(0.5, 0.2, 0.55), smoothstep(0.4, 1.0, clouds));
  col += neb * density * 0.9;

  // Dusty highlight filaments.
  float fil = pow(max(clouds2, 0.0), 3.0);
  col += vec3(0.45, 0.38, 0.6) * fil * 0.5;

  // Birth: a blinding collapsing-star core toward +X.
  vec3 coreDir = normalize(vec3(0.55, 0.12, 0.45));
  float cd = max(dot(dir, coreDir), 0.0);
  float core = pow(cd, 40.0) * 6.0 + pow(cd, 6.0) * 0.6;
  col += vec3(1.0, 0.92, 0.7) * core * uCore;

  // Rebirth: a fresh golden-violet bloom.
  col = mix(col, col * vec3(1.2, 1.0, 1.25) + vec3(0.12, 0.06, 0.18), uRebirth);

  // Legacy: drain saturation + light to feel melancholic.
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(luma) * 0.6, uMood * 0.7);
  col *= (1.0 - uMood * 0.35);

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ───────────────────────────── NEBULA BILLBOARD ───────────────────────────── */

export const CLOUD_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const CLOUD_FRAG = /* glsl */ `
precision highp float;
${NOISE}
uniform float uTime;
uniform float uOpacity;
uniform vec3  uColor;
uniform float uSeed;
varying vec2 vUv;
void main(){
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float falloff = smoothstep(1.0, 0.05, r);
  float n = fbm(vec3(p * 3.2, uSeed + uTime * 0.05));
  float n2 = fbm(vec3(p * 7.0 + 3.0, uSeed * 2.0 - uTime * 0.03));
  float density = falloff * smoothstep(-0.2, 0.9, n * 0.7 + n2 * 0.3 + 0.2);
  vec3 col = uColor * (0.6 + 0.7 * n2);
  gl_FragColor = vec4(col, density * uOpacity);
}
`;

/* ───────────────────────────── ACCRETION DISK ───────────────────────────── */

export const DISK_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const DISK_FRAG = /* glsl */ `
precision highp float;
${NOISE}
uniform float uTime;
uniform float uOpacity;
varying vec2 vUv;
void main(){
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float ang = atan(p.y, p.x);
  // annulus mask: dark event horizon in the middle, bright ring outside.
  float ring = smoothstep(0.28, 0.42, r) * (1.0 - smoothstep(0.7, 1.0, r));
  float swirl = fbm(vec3(cos(ang) * 2.0, sin(ang) * 2.0, r * 4.0 - uTime * 0.9));
  float heat = ring * (0.5 + 0.6 * swirl);
  vec3 hot = mix(vec3(1.0, 0.55, 0.18), vec3(1.0, 0.86, 0.6), smoothstep(0.4, 0.95, r));
  hot = mix(hot, vec3(0.7, 0.4, 1.0), smoothstep(0.7, 1.0, r) * 0.6);
  // photon glow just outside the horizon
  float photon = pow(max(0.0, 1.0 - abs(r - 0.32) * 7.0), 2.0);
  vec3 col = hot * heat + vec3(1.0, 0.8, 0.6) * photon * 0.8;
  float alpha = (heat + photon * 0.6) * uOpacity;
  gl_FragColor = vec4(col, alpha);
}
`;

/* ───────────────────────────── LOGO PARTICLES ───────────────────────────── */

export const LOGO_VERT = /* glsl */ `
uniform float uTime;
uniform float uForm;
uniform float uPixelRatio;
attribute vec3  aScatter;
attribute float aSeed;
attribute float aSize;
varying float vTw;
void main(){
  float e = smoothstep(0.0, 1.0, uForm);
  vec3 p = mix(aScatter, position, e);
  // settle jitter as it forms
  p += (1.0 - e) * sin(uTime * 2.0 + aSeed * 30.0) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.6 + 0.4 * sin(uTime * 4.0 + aSeed * 50.0);
  vTw = tw;
  gl_PointSize = aSize * uPixelRatio * (200.0 / max(-mv.z, 1.0)) * (0.6 + 0.6 * e);
  gl_PointSize = clamp(gl_PointSize, 0.0, 18.0 * uPixelRatio);
}
`;

export const LOGO_FRAG = /* glsl */ `
precision highp float;
uniform float uForm;
uniform vec3  uColor;
varying float vTw;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  float core = pow(a, 2.5);
  vec3 col = uColor * (0.5 + core * 2.4) * (0.7 + 0.3 * vTw);
  gl_FragColor = vec4(col, a * a * uForm);
}
`;
