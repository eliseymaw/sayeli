import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  BRAND,
  CONSTELLATIONS,
  ARTIFACTS,
  JOURNEY,
  TESTIMONIALS,
  CONTACT,
} from "../data/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.35 }}
      transition={{ duration: 1.2, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function Overlay() {
  return (
    <div className="overlay">
      {/* p0 — Hero / Birth threshold */}
      <section className="panel center">
        <motion.div
          initial={{ opacity: 0, scale: 1.04, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2.4, delay: 0.3, ease: EASE }}
        >
          <h1 className="hero-title">{BRAND.name}</h1>
          <div className="hero-sub">{BRAND.tagline}</div>
        </motion.div>
      </section>

      {/* p1 — Chapter I: Birth */}
      <section className="panel">
        <Reveal>
          <p className="eyebrow">Chapter I — Birth</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="chapter-title">
            From a collapsing
            <br />
            <em>star</em>, a heartbeat.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="lede">
            In the silence before everything, stardust gathers. A silhouette
            stirs inside the nebula — ancient, patient, waiting to remember
            its own shape.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <p className="body-text">{BRAND.intro}</p>
        </Reveal>
      </section>

      {/* p2 — Chapter II: Awakening */}
      <section className="panel right">
        <Reveal>
          <p className="eyebrow">Chapter II — Awakening</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="chapter-title">
            It opens
            <br />
            its <em>eyes</em>.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="lede">
            Constellations ignite. Space bends around an intelligence older
            than light. You feel the scale of it before you see it.
          </p>
        </Reveal>
      </section>

      {/* p3 — Skills as constellations */}
      <section className="panel">
        <Reveal>
          <p className="eyebrow">The Constellations of Craft</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h3 className="chapter-title" style={{ fontSize: "clamp(2rem,5vw,4rem)" }}>
            What the stars are made of
          </h3>
        </Reveal>
        <div className="constellation-grid">
          {CONSTELLATIONS.map((c, i) => (
            <Reveal key={c.name} delay={0.12 + i * 0.1}>
              <div className="skill-cluster">
                <h4>{c.name}</h4>
                <ul>
                  {c.stars.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* p4 — Chapter III: Journey + first artifacts */}
      <section className="panel">
        <Reveal>
          <p className="eyebrow">Chapter III — Journey</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="chapter-title">
            Through nebulae
            <br />
            and <em>dying light</em>.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="lede">
            The dragon flies. Drifting past it, like relics caught in its
            wake, are the worlds it has built — each one an artifact of a life
            spent making.
          </p>
        </Reveal>
      </section>

      {/* p5 — Artifacts (projects) */}
      <section className="panel">
        {ARTIFACTS.map((a, i) => (
          <Reveal key={a.title} delay={i * 0.06}>
            <div className="artifact" style={{ marginBottom: "8vh" }}>
              <div className="index">{a.index}</div>
              <h3>{a.title}</h3>
              <p className="body-text" style={{ marginTop: 0 }}>
                {a.body}
              </p>
              <div className="meta">
                {a.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* p6 — Experience as waypoints */}
      <section className="panel right">
        <Reveal>
          <p className="eyebrow">Waypoints in the Dark</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h3 className="chapter-title" style={{ fontSize: "clamp(2rem,5vw,4rem)" }}>
            The path so far
          </h3>
        </Reveal>
        <div className="timeline">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.role} delay={0.1 + i * 0.08}>
              <div className="entry">
                <span className="year">{j.year}</span>
                <span>
                  <span className="role">{j.role}</span>
                  <span className="org">{j.org}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* p7 — Chapter IV: Legacy + testimonials */}
      <section className="panel">
        <Reveal>
          <p className="eyebrow">Chapter IV — Legacy</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="chapter-title">
            Stars fade.
            <br />
            <em>Echoes</em> remain.
          </h2>
        </Reveal>
        <div style={{ marginTop: "5vh", display: "flex", flexDirection: "column", gap: "6vh" }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={0.1 + i * 0.1}>
              <div className="testimonial">
                <blockquote>{t.quote}</blockquote>
                <div className="cite">{t.cite}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* p8 — Chapter V: Rebirth + contact gateway */}
      <section className="panel center">
        <Reveal>
          <p className="eyebrow">Chapter V — Death &amp; Rebirth</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lede" style={{ maxWidth: "32ch", margin: "0 auto 4vh" }}>
            Nothing is lost. The dragon dissolves into dust, and the dust
            becomes a galaxy — and from that new light, a name is born.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="gateway">
            <p className="eyebrow" style={{ marginBottom: 0 }}>
              {CONTACT.prompt}
            </p>
            <div className="hero-sub" style={{ marginTop: "0.4rem" }}>
              {BRAND.role}
            </div>
            <div className="links">
              {CONTACT.links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
