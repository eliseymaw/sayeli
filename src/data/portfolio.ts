/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SAYELI — content source of truth
 *  Edit everything here. The 3D world and the narrative overlay both read
 *  from this file, so changing a project name, a skill, or a link updates
 *  the experience without touching any scene code.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const BRAND = {
  name: "SAYELI",
  tagline: "Born of Stars",
  role: "Creative Technologist · Digital Artist",
  intro:
    "I build worlds at the edge of code and wonder — interfaces that feel less like software and more like phenomena.",
};

/** Chapter 2 — skills appear as constellations connected by light. */
export const CONSTELLATIONS: { name: string; stars: string[] }[] = [
  {
    name: "Craft",
    stars: ["WebGL / GLSL", "Three.js", "Creative Coding", "Shader Art", "Generative Systems"],
  },
  {
    name: "Engineering",
    stars: ["TypeScript", "React / Next.js", "Node & Edge", "Performance", "Design Systems"],
  },
  {
    name: "Motion",
    stars: ["GSAP", "Framer Motion", "Cinematic UX", "Sound Design", "Art Direction"],
  },
];

/** Chapter 3 — projects appear as cosmic artifacts the dragon passes. */
export const ARTIFACTS: {
  index: string;
  title: string;
  body: string;
  tags: string[];
  href?: string;
}[] = [
  {
    index: "Artifact I",
    title: "Aurora Engine",
    body: "A real-time volumetric rendering engine that paints living auroras across a procedural night sky. 60fps WebGL, zero textures — only light and math.",
    tags: ["WebGL", "GLSL", "Real-time"],
    href: "#",
  },
  {
    index: "Artifact II",
    title: "The Hollow Atlas",
    body: "An award-winning interactive map of imagined worlds. Scroll-driven cartography where every coastline is generated and every city has a story.",
    tags: ["React", "Three.js", "Narrative"],
    href: "#",
  },
  {
    index: "Artifact III",
    title: "Resonance",
    body: "A sound-reactive instrument that turns music into sculpted particle galaxies. Performed live to an audience of ten thousand.",
    tags: ["Audio", "Particles", "Live"],
    href: "#",
  },
  {
    index: "Artifact IV",
    title: "Monolith OS",
    body: "A design system and component library powering products used by millions — rigorous, accessible, and quietly beautiful.",
    tags: ["TypeScript", "Design Systems", "Scale"],
    href: "#",
  },
];

/** Chapter 3 — experience appears as waypoints along the journey. */
export const JOURNEY: { year: string; role: string; org: string }[] = [
  { year: "2024 —", role: "Independent Creative Studio", org: "Founder & Principal" },
  { year: "2021", role: "Lead Creative Technologist", org: "Stellar Interactive" },
  { year: "2019", role: "Senior Frontend Engineer", org: "Nebula Labs" },
  { year: "2017", role: "Interaction Designer", org: "Atlas Digital" },
];

/** Chapter 4 — testimonials appear as messages from ancient civilizations. */
export const TESTIMONIALS: { quote: string; cite: string }[] = [
  {
    quote: "“They do not build websites. They summon places that should not be possible.”",
    cite: "— The Awwwards Jury",
  },
  {
    quote: "“Working with SAYELI felt like watching a star get engineered by hand.”",
    cite: "— Creative Director, Stellar Interactive",
  },
];

/** Chapter 5 — the final celestial gateway. */
export const CONTACT = {
  prompt: "Begin something legendary.",
  email: "hello@sayeli.studio",
  links: [
    { label: "Email", href: "mailto:hello@sayeli.studio" },
    { label: "Behance", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "X / Twitter", href: "#" },
    { label: "Instagram", href: "#" },
  ],
};
