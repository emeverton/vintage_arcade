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
    ? { transform: `translate3d(${offset.x * 8}px, ${offset.y * 6}px, 0) scale(1.04)` }
    : undefined;

  const glowStyle = motionOk
    ? {
        transform: `translate3d(${offset.x * 14}px, ${offset.y * 10}px, 0)`,
        opacity: 0.28 + Math.abs(offset.x) * 0.08
      }
    : undefined;

  const copyStyle = motionOk
    ? { transform: `translate3d(${offset.x * -3}px, ${offset.y * -2}px, 0)` }
    : undefined;

  return (
    <div
      ref={stageRef}
      className="hero-screen relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#050712] shadow-screen"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="hero-art-layer absolute inset-0" style={artStyle} aria-hidden="true">
        <picture>
          <source media="(min-width: 1024px)" srcSet="/images/vintage-arcade-hero-16x9.webp" type="image/webp" />
          <source media="(min-width: 768px)" srcSet="/images/vintage-arcade-hero-4x5.webp" type="image/webp" />
          <img
            src="/images/vintage-arcade-hero-9x16.webp"
            alt="Gabinete Vintage Arcade iluminado em corredor neon com sanduíche na tela"
            width={576}
            height={1024}
            className="hero-art-image h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>

      <div className="hero-vignette absolute inset-0" aria-hidden="true" />
      <div className="hero-scanlines absolute inset-0" aria-hidden="true" />
      <div className="hero-glare absolute inset-0" aria-hidden="true" />
      <div className="hero-noise absolute inset-0" aria-hidden="true" />
      <div className="hero-chromatic absolute inset-0" aria-hidden="true" />
      <div className="hero-cursor-glow absolute inset-0" style={glowStyle} aria-hidden="true" />

      <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-end px-5 pb-12 pt-8 text-left sm:min-h-[560px] md:min-h-[620px] md:justify-center md:px-10 md:pb-16 md:pt-12 lg:min-h-[640px]">
        <div className="hero-copy max-w-2xl" style={copyStyle}>
          <p className="mb-4 inline-flex rounded-full border border-vintageYellow/45 bg-black/35 px-4 py-2 text-[9px] font-black uppercase tracking-[0.34em] text-vintageYellow backdrop-blur-sm md:text-[10px]">
            Food + Games + Nostalgia
          </p>

          <h2 className="max-w-xl text-[2.55rem] font-black uppercase leading-[0.88] tracking-[-0.04em] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] md:text-6xl lg:text-7xl">
            Comida.
            <br />
            Games.
            <br />
            Nostalgia.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-6 text-white/82 drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] md:text-base md:leading-7">
            Uma experiência arcade no coração de Bebedouro, com sandubas lendários, porções, drinks e diversão para todas as idades.
          </p>

          <div className="mt-7 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <a
              href={`${WHATSAPP}?text=Oi%2C%20quero%20reservar%20uma%20mesa%20na%20Vintage%20Arcade.`}
              target="_blank"
              rel="noreferrer"
              className="retro-btn retro-btn-primary flex-1"
            >
              Reservar mesa
            </a>
            <a
              href={`${WHATSAPP}?text=Oi%2C%20quero%20ver%20o%20card%C3%A1pio%20da%20Vintage%20Arcade.`}
              target="_blank"
              rel="noreferrer"
              className="retro-btn retro-btn-secondary flex-1"
            >
              Ver cardápio
            </a>
          </div>

          <div className="mt-7 grid w-full max-w-xl grid-cols-3 gap-2 md:gap-3">
            {[
              ['4,8★', 'Google'],
              ['540+', 'Avaliações'],
              ['2018', 'Desde']
            ].map(([value, label]) => (
              <div key={label} className="screen-stat">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="screen-statusbar">
        <span>1UP</span>
        <span className="animate-pulseSoft">READY PLAYER?</span>
        <span>HI-SCORE</span>
      </div>
    </div>
  );
}
