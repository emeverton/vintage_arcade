'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';

const WHATSAPP = 'https://wa.me/551733402000';

type Offset = { x: number; y: number };

export default function ArcadeHeroScreen() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionOk(fine.matches && !reduce.matches);
    sync();
    fine.addEventListener('change', sync);
    reduce.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
    };
  }, []);

  const onMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!motionOk || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setOffset({ x: nx, y: ny });
    },
    [motionOk]
  );

  const onLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const artStyle = motionOk
    ? { transform: `translate3d(${offset.x * 6}px, ${offset.y * 4}px, 0) scale(1.03)` }
    : undefined;

  return (
    <section
      id="top"
      ref={stageRef}
      className="premium-hero"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label="Apresentação Vintage Arcade"
    >
      <div className="premium-hero-grid">
        <div className="premium-hero-copy">
          <p className="premium-eyebrow">Food + Games + Nostalgia</p>
          <h2 className="premium-headline">Comida, games e nostalgia.</h2>
          <p className="premium-support">
            Sandubas lendários, drinks, games e um ambiente feito para transformar uma refeição em experiência.
          </p>

          <div className="premium-cta-row">
            <a
              href={`${WHATSAPP}?text=Oi%2C%20quero%20reservar%20uma%20mesa%20na%20Vintage%20Arcade.`}
              target="_blank"
              rel="noreferrer"
              className="retro-btn retro-btn-primary"
            >
              Reservar mesa
            </a>
            <a
              href={`${WHATSAPP}?text=Oi%2C%20quero%20ver%20o%20card%C3%A1pio%20da%20Vintage%20Arcade.`}
              target="_blank"
              rel="noreferrer"
              className="retro-btn retro-btn-secondary"
            >
              Ver cardápio
            </a>
          </div>

          <div className="premium-stats" aria-label="Prova social">
            <div className="premium-stat">
              <strong>4,8★</strong>
              <span>no Google</span>
            </div>
            <div className="premium-stat">
              <strong>540+</strong>
              <span>avaliações</span>
            </div>
            <div className="premium-stat">
              <strong>2018</strong>
              <span>Desde</span>
            </div>
          </div>
        </div>

        <div className="premium-hero-art" aria-hidden="false">
          <div className="premium-art-frame">
            <div className="premium-art-glow" aria-hidden="true" />
            <div className="premium-art-media" style={artStyle}>
              <picture>
                <source media="(min-width: 1024px)" srcSet="/images/vintage-arcade-hero-16x9.webp" type="image/webp" />
                <source media="(min-width: 768px)" srcSet="/images/vintage-arcade-hero-4x5.webp" type="image/webp" />
                <img
                  src="/images/vintage-arcade-hero-9x16.webp"
                  alt="Gabinete Vintage Arcade em corredor neon com sanduíche na tela"
                  width={1024}
                  height={576}
                  className="premium-art-image"
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            </div>
            <div className="premium-art-overlay" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
