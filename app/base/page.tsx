"use client";

/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";

// ─── Tokens ───────────────────────────────────────────────────────────────────

const t = {
  gold:        "#e6c973",
  goldDark:    "#c9a94e",
  goldLight:   "#f5e3b0",
  forest:      "#64754f",
  forestDark:  "#4a5939",
  forestLight: "#8a9e72",
  cream:       "#faf7f0",
  creamDark:   "#f0ead8",
  ink:         "#2c2416",
  inkMuted:    "#6b5f4a",
  inkLight:    "#9c8e78",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: "◈",
    title: "Quality you can feel",
    description: "Clean code, intuitive UX, and software built to last. We don't cut corners — ever.",
    accent: t.goldDark,
  },
  {
    icon: "◎",
    title: "Pricing that respects you",
    description: "Enterprise-grade software for real budgets. No hidden costs, no unpleasant surprises.",
    accent: t.forest,
  },
  {
    icon: "◇",
    title: "Built to be used",
    description: "Usability isn't an afterthought. We design experiences that people genuinely enjoy.",
    accent: t.goldDark,
  },
  {
    icon: "◉",
    title: "Style with purpose",
    description: "Polished, consistent, on-brand. Your software should make a great first impression.",
    accent: t.forestLight,
  },
  {
    icon: "⬡",
    title: "Partnership, not a transaction",
    description: "We work with you from kickoff to launch and beyond — always reachable, always transparent.",
    accent: t.gold,
  },
  {
    icon: "⬟",
    title: "Any size, any stage",
    description: "Solo founder or scaling company — we have an approach that fits where you are right now.",
    accent: t.forest,
  },
];

// ─── Global styles ────────────────────────────────────────────────────────────

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #faf7f0; -webkit-font-smoothing: antialiased; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 2rem", height: "68px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(250,247,240,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(8px)" : "none",
      borderBottom: scrolled ? `1px solid rgba(230,201,115,0.3)` : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <a href="#" style={{
        fontFamily: "'Lora', Georgia, serif", fontSize: "1.5rem", fontWeight: 600,
        color: t.ink, textDecoration: "none", letterSpacing: "-0.02em",
        display: "flex", alignItems: "center", gap: "0.3rem",
      }}>
        <span style={{ color: t.forest }}>Mex</span>
        <span style={{ background: t.gold, color: t.ink, padding: "0 6px 2px", borderRadius: "4px", fontSize: "1.4rem" }}>Codex</span>
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {[{ label: "Services", href: "#features" }, { label: "Contact", href: "#cta" }].map(({ label, href }) => (
          <a key={label} href={href} style={{
            fontFamily: "'Nunito', sans-serif", fontWeight: 500, fontSize: "0.95rem",
            color: t.inkMuted, textDecoration: "none", transition: "color 0.2s ease",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = t.forest)}
            onMouseLeave={e => (e.currentTarget.style.color = t.inkMuted)}
          >{label}</a>
        ))}
        <a href="#cta" style={{
          background: t.forest, color: t.cream,
          padding: "0.5rem 1.25rem", borderRadius: "6px",
          fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: "0.9rem",
          textDecoration: "none", transition: "background 0.2s ease",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = t.forestDark)}
          onMouseLeave={e => (e.currentTarget.style.background = t.forest)}
        >Let's talk</a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelectorAll<HTMLElement>("[data-delay]").forEach(el => {
      el.style.opacity = "0";
      el.style.animation = `fadeUp 0.7s ease forwards ${el.dataset.delay}ms`;
    });
  }, []);

  return (
    <section ref={ref} style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "6rem 2rem 4rem", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "10%", right: "-5%", width: "520px", height: "520px", borderRadius: "50%", background: "radial-gradient(circle,rgba(230,201,115,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "-8%", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle,rgba(100,117,79,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(100,117,79,0.12) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none", opacity: 0.6 }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div data-delay="0" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: t.creamDark, border: `1px solid ${t.gold}`, borderRadius: "100px", padding: "0.3rem 1rem", marginBottom: "2rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.forest, display: "inline-block" }} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: t.forest, letterSpacing: "0.08em", textTransform: "uppercase" }}>Software for everyone</span>
        </div>

        <h1 data-delay="120" style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "clamp(2.8rem,6vw,5rem)", fontWeight: 600, color: t.ink, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
          Great software,{" "}
          <span style={{ color: t.forest }}>no matter</span>
          <br />your budget.
          <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", background: t.gold, marginLeft: "6px", verticalAlign: "middle" }} />
        </h1>

        <p data-delay="240" style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(1rem,2vw,1.2rem)", color: t.inkMuted, lineHeight: 1.7, maxWidth: "560px", marginBottom: "2.5rem" }}>
          MexCodex builds quality software for companies of every size — balancing craftsmanship, affordability, and design that people actually enjoy using.
        </p>

        <div data-delay="360" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <a href="#cta" style={{ background: t.forest, color: t.cream, padding: "0.85rem 2rem", borderRadius: "8px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: "1rem", textDecoration: "none", transition: "background 0.2s ease, transform 0.15s ease", display: "inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.forestDark; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.forest; e.currentTarget.style.transform = "translateY(0)"; }}
          >Start a project</a>
          <a href="#features" style={{ background: "transparent", color: t.ink, padding: "0.85rem 2rem", borderRadius: "8px", border: `1.5px solid ${t.goldDark}`, fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: "1rem", textDecoration: "none", transition: "background 0.2s ease, transform 0.15s ease", display: "inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.goldLight; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
          >See what we do</a>
        </div>

        <div data-delay="480" style={{ marginTop: "4rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "40px", height: "1px", background: t.goldDark }} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", color: t.inkLight, fontWeight: 500 }}>Built for startups, SMBs, and growing teams</span>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll<HTMLElement>("[data-card]").forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, i * 80);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={ref} style={{ padding: "6rem 2rem", background: t.creamDark, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${t.gold} 0%, ${t.forest} 100%)` }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "4rem" }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: t.forest, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>What we stand for</p>
          <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 600, color: t.ink, lineHeight: 1.15, letterSpacing: "-0.02em", maxWidth: "500px" }}>
            The four pillars behind everything we build.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.5rem" }}>
          {features.map((f, i) => (
            <div key={i} data-card style={{
              background: t.cream, borderRadius: "12px", padding: "2rem",
              border: "1px solid rgba(230,201,115,0.25)",
              opacity: 0, transform: "translateY(20px)",
              transition: "opacity 0.5s ease, transform 0.5s ease, box-shadow 0.2s ease, border-color 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(100,117,79,0.1)"; e.currentTarget.style.borderColor = "rgba(230,201,115,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(230,201,115,0.25)"; }}
            >
              <div style={{ fontSize: "1.6rem", color: f.accent, marginBottom: "1.25rem", lineHeight: 1 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: t.ink, marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.95rem", color: t.inkMuted, lineHeight: 1.7 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  const [copied, setCopied] = useState(false);
  const email = "hello@mexcodex.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="cta" style={{ padding: "7rem 2rem", background: t.cream, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "400px", height: "400px", background: "radial-gradient(circle at bottom right,rgba(230,201,115,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "300px", height: "300px", background: "radial-gradient(circle at top left,rgba(100,117,79,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ width: "50px", height: "1px", background: t.goldDark }} />
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.gold, border: `2px solid ${t.goldDark}` }} />
          <div style={{ width: "50px", height: "1px", background: t.goldDark }} />
        </div>

        <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 600, color: t.ink, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Ready to build something{" "}
          <em style={{ color: t.forest, fontStyle: "italic" }}>worth using?</em>
        </h2>

        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "1.05rem", color: t.inkMuted, lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Tell us what you're working on. We'll listen, and together we'll figure out the best way to bring it to life — at a price that makes sense for you.
        </p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <a href={`mailto:${email}`} style={{ background: t.forest, color: t.cream, padding: "1rem 2.5rem", borderRadius: "8px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: "1.05rem", textDecoration: "none", transition: "background 0.2s ease, transform 0.15s ease", display: "inline-block" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.forestDark; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.forest; e.currentTarget.style.transform = "translateY(0)"; }}
          >Send us a message</a>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem", color: t.inkLight }}>or reach us at</span>
            <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem", color: t.forest, fontWeight: 600, padding: "2px 6px", borderRadius: "4px", transition: "background 0.15s ease", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(100,117,79,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              {email} <span style={{ fontSize: "0.75rem" }}>{copied ? "✓" : "⎘"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid rgba(230,201,115,0.3)`, padding: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", background: t.creamDark }}>
      <span style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 600, fontSize: "1.1rem", color: t.ink, letterSpacing: "-0.01em" }}>
        <span style={{ color: t.forest }}>Mex</span>
        <span style={{ background: t.gold, color: t.ink, padding: "0 4px", borderRadius: "3px" }}>Codex</span>
      </span>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.85rem", color: t.inkLight }}>
        © {new Date().getFullYear()} MexCodex. All rights reserved.
      </p>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: t.cream, fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
