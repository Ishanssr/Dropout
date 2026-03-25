'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { GlassFilter } from '../components/LiquidGlass';

const phrases = [
  "Before your group chat knows.",
  "Every launch. Every drop. One place.",
  "Your front-row seat to what's next.",
];

const mosaicImages = [
  [
    { src: "https://images.unsplash.com/photo-1509272431745-7a3b1faeb56a?auto=format&fit=crop&w=800&q=80", label: "Dune: Part Two", tall: true },
    { src: "https://media.assettype.com/gulfnews%2F2026-02-08%2F111gyv2q%2FHAQ1zIyaoAA95SO.jpg?w=640&auto=format%2Ccompress&fit=max", label: "Tech Drops" },
    { src: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80", label: "Travis Scott x AJ1", wide: true },
    { src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80", label: "ChatGPT" },
  ],
  [
    { src: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80", label: "Spider-Man" },
    { src: "https://image.api.playstation.com/vulcan/ap/rnd/202405/2117/bd406f42e9352fdb398efcf21a4ffe575b2306ac40089d21.png", label: "Black Myth: Wukong", tall: true },
    { src: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80", label: "Supreme", wide: true },
    { src: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80", label: "New Balance 550" },
  ],
  [
    { src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80", label: "Taylor Swift", wide: true },
    { src: "https://helios-i.mashable.com/imagery/articles/06P1cP8gUZApevvbMM2X2VW/hero-image.fill.size_1200x1200.v1774258028.png", label: "Startup Launches", tall: true },
    { src: "https://cms-cdn.thesolesupplier.co.uk/quad/images/846822.png", label: "Sneakers" },
  ],
  [
    { src: "https://static01.nyt.com/images/2021/08/06/arts/06playlist/06playlist-mediumSquareAt3X.jpg", label: "New Albums", tall: true },
    { src: "https://www.rockstargames.com/VI/_next/image?url=%2FVI%2F_next%2Fstatic%2Fmedia%2FJason_and_Lucia_02_With_Logos_square.b022b2d6.jpg&w=3560&q=75", label: "Upcoming Games" },
    { src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80", label: "Streetwear Drops", wide: true },
  ],
];

export default function LandingPage() {
  const typedRef = useRef(null);
  const auraRef = useRef(null);

  useEffect(() => {
    // Typewriter
    let phraseIndex = 0, charIndex = 0, deleting = false, timeoutId;
    function tick() {
      const el = typedRef.current;
      if (!el) return;
      const phrase = phrases[phraseIndex];
      el.textContent = deleting
        ? phrase.slice(0, charIndex--)
        : phrase.slice(0, charIndex++);
      let delay = deleting ? 40 : 80;
      if (!deleting && charIndex === phrase.length + 1) { deleting = true; delay = 2000; }
      else if (deleting && charIndex === -1) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; charIndex = 0; delay = 400; }
      timeoutId = setTimeout(tick, delay);
    }
    tick();

    // Cursor aura (desktop only)
    const aura = auraRef.current;
    if (aura && !('ontouchstart' in window)) {
      const move = (e) => { aura.style.left = e.clientX + 'px'; aura.style.top = e.clientY + 'px'; aura.style.opacity = '1'; };
      const leave = () => { aura.style.opacity = '0'; };
      document.addEventListener('mousemove', move, { passive: true });
      document.addEventListener('mouseleave', leave);
      return () => { clearTimeout(timeoutId); document.removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); };
    }
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="landing-root">
      {/* Cursor Aura */}
      <div ref={auraRef} className="landing-cursor-aura" />

      {/* Ambient layers */}
      <div className="landing-ambient landing-ambient-glow" />
      <div className="landing-ambient landing-ambient-grain" />
      <div className="landing-ambient landing-ambient-vignette" />

      {/* Frame corners */}
      <div className="landing-frame" />

      {/* Brand */}
      <Link href="/" className="landing-brand">
        <span className="landing-brand-dot" />
        <span className="landing-brand-name">
          Drop<span className="landing-brand-accent">amyn</span>
        </span>
        <span className="landing-brand-tagline">only for the nerdy ones</span>
      </Link>

      {/* Mosaic Background */}
      <div className="landing-mosaic">
        {mosaicImages.map((col, ci) => (
          <div key={ci} className="landing-column" data-speed={['slow','mid','fast','mid'][ci]}>
            {col.map((img, ii) => (
              <article key={ii} className={`landing-card${img.tall ? ' tall' : ''}${img.wide ? ' wide' : ''}`}>
                <img src={img.src} alt={img.label} loading="lazy" />
                <span className="landing-card-label">{img.label}</span>
              </article>
            ))}
          </div>
        ))}
      </div>

      {/* Hero */}
      <main className="landing-shell">
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <div className="landing-eyebrow">New launches · Drops · Promotions</div>

            <h1 className="landing-h1">
              If it&apos;s new, it&apos;s here.<br />
              The home of<br />
              <span className="landing-headline-accent">what the world&apos;s cooking up.</span>
            </h1>

            <div className="landing-type-line">
              <span ref={typedRef}></span>
              <span className="landing-cursor">|</span>
            </div>

            <div className="landing-microcopy">
              Sneakers to startups. Movies to games. Streetwear to songs.
            </div>

            {/* CTAs */}
            <div className="landing-ctas">
              <Link href="/feed" className="lg-cta lg-cta-primary">
                Explore Drops →
              </Link>
              <Link href="/login" className="lg-cta lg-cta-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
      <GlassFilter />
    </div>
  );
}
