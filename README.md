# SAYELI — Born of Stars

A scroll‑driven, cinematic WebGL experience that tells the life of a cosmic
Night Dragon — and embeds an entire portfolio inside the story. Built to feel
less like a website and more like a phenomenon.

> Birth → Awakening → Journey → Legacy → Death & Rebirth.
> The dragon is born from a collapsing star, opens its eyes, flies through
> nebulae and a black hole, ages as the stars fade, dissolves into dust, and
> is reborn as a galaxy from which the **SAYELI** wordmark is born.

## ✦ The experience

The whole site is one continuous narrative, driven entirely by scroll. The
portfolio is woven into the world rather than listed:

| Story beat | Portfolio content | How it appears |
|---|---|---|
| **I — Birth** | Intro / brand statement | Stardust collapses into the dragon |
| **II — Awakening** | Skills | Constellations of light ignite in the sky |
| **III — Journey** | Projects & experience | Glowing **artifacts** with orbiting rings; a black hole; supernovae; waypoint timeline |
| **IV — Legacy** | Testimonials | "Messages from ancient civilizations" as the stars fade |
| **V — Rebirth** | Contact | A new galaxy forms and the SAYELI logo is born from its stars |

## ✦ Tech

- **React + TypeScript + Vite**
- **Three.js** via **@react-three/fiber** and **@react-three/drei** (`ScrollControls` drives the whole journey)
- **@react-three/postprocessing** — mipmap bloom, vignette, film grain
- **Custom GLSL shaders** — simplex/fbm nebula dome, twinkling starfield, the
  particle dragon (morphs between a scattered cloud → the dragon → a spiral
  galaxy), accretion disk, and the logo particle resolve
- **GSAP-style easing** + **Framer Motion** for the narrative overlay and UI
- **Zustand** for the small amount of shared UI state
- A generative **WebAudio** ambient drone (optional, toggleable)

Everything is procedural — there are **no 3D models, no textures, no images**.
The dragon, galaxy, and logo are all generated from math at runtime.

## ✦ Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build    # type-check + bundle to /dist
npm run preview  # preview the production build
```

Requires Node 18+.

## ✦ Make it yours

All content lives in one file — **[`src/data/portfolio.ts`](src/data/portfolio.ts)**.
Edit it and the 3D world + narrative update automatically:

- `BRAND` — name, tagline, role, intro line
- `CONSTELLATIONS` — your skills (Chapter II)
- `ARTIFACTS` — your projects (Chapter III)
- `JOURNEY` — your experience timeline (Chapter III)
- `TESTIMONIALS` — quotes (Chapter IV)
- `CONTACT` — links + email (Chapter V)

> The included content is tasteful placeholder copy — replace it with yours.

Other useful knobs:

- **Story pacing & chapter ranges** — [`src/lib/chapters.ts`](src/lib/chapters.ts)
- **Camera choreography** — the `KEYS` array in [`src/three/CameraRig.tsx`](src/three/CameraRig.tsx)
- **Palette** — CSS variables at the top of [`src/styles.css`](src/styles.css) and the color uniforms in [`src/three/Dragon.tsx`](src/three/Dragon.tsx)
- **Particle budgets / quality tiers** — the `tier` object in [`src/three/Experience.tsx`](src/three/Experience.tsx)
- **Bloom / grade** — [`src/three/Effects.tsx`](src/three/Effects.tsx)

## ✦ Performance

- Particle counts, device‑pixel‑ratio and bloom quality automatically scale
  down on mobile / small screens (`tier` in `Experience.tsx`).
- All particle systems use additive points + soft sprites — no expensive
  lighting or shadow passes.
- Bloom uses `mipmapBlur` (cheap) with `luminanceThreshold: 0` to avoid
  ringing around bright point sources.

## ✦ Project structure

```
src/
  data/portfolio.ts     ← EDIT THIS: all content
  lib/                  ← math, chapter map, dragon geometry, text→points, store, glow texture
  three/                ← R3F scene: Experience, CameraRig, Dragon, Starfield,
                          Nebula, CosmicObjects, Logo, Effects, shaders.ts (GLSL)
  ui/                   ← Intro veil, Chrome (HUD + chapter rail), Overlay (narrative), AmbientAudio
  App.tsx / main.tsx / styles.css
```

---

Made to be unforgettable. Scroll slowly.
