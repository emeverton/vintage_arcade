'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import ProductArcadeScreen from './ProductArcadeScreen';
import {
  CATALOG,
  CATEGORY_BUTTONS,
  INSTAGRAM,
  WHATSAPP,
  type CabinetCategory
} from '../lib/catalog';

const NAV = [
  { label: 'CARDÁPIO', href: '#cardapio' },
  { label: 'EXPERIÊNCIA', href: '#experiencia' },
  { label: 'EVENTOS', href: '#eventos' },
  { label: 'VISITE', href: '#visite' }
];

export default function VintageArcadeCabinet() {
  const [category, setCategory] = useState<CabinetCategory>('burgers');
  const [index, setIndex] = useState(0);
  const [stickDir, setStickDir] = useState<'idle' | 'left' | 'right'>('idle');
  const touchX = useRef<number | null>(null);

  const items = CATALOG[category];
  const item = items[Math.min(index, items.length - 1)];

  const goPrev = useCallback(() => {
    setStickDir('left');
    setIndex((current) => (current - 1 + items.length) % items.length);
    window.setTimeout(() => setStickDir('idle'), 160);
  }, [items.length]);

  const goNext = useCallback(() => {
    setStickDir('right');
    setIndex((current) => (current + 1) % items.length);
    window.setTimeout(() => setStickDir('idle'), 160);
  }, [items.length]);

  const selectCategory = useCallback((next: CabinetCategory) => {
    setCategory(next);
    setIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
      if (event.key === 'a' || event.key === 'A') selectCategory('burgers');
      if (event.key === 'b' || event.key === 'B') selectCategory('porcoes');
      if (event.key === 'x' || event.key === 'X') selectCategory('drinks');
      if (event.key === 'y' || event.key === 'Y') selectCategory('eventos');
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, selectCategory]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchX.current;
    const delta = endX - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  const onDeckKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const current = CATEGORY_BUTTONS.findIndex((button) => button.id === category);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        selectCategory(CATEGORY_BUTTONS[(current + 1) % CATEGORY_BUTTONS.length].id);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectCategory(CATEGORY_BUTTONS[(current - 1 + CATEGORY_BUTTONS.length) % CATEGORY_BUTTONS.length].id);
      }
    },
    [category, selectCategory]
  );

  const socialProof = useMemo(
    () => [
      ['4,8★', 'Google'],
      ['540+', 'Avaliações'],
      ['2018', 'Desde']
    ],
    []
  );

  return (
    <section id="top" className="vintage-cabinet-scene" aria-label="Gabinete interativo Vintage Arcade">
      <div className="vintage-cabinet">
        <div className="cabinet-side cabinet-side-left" aria-hidden="true">
          <span className="side-star" />
          <span className="side-pixel" />
          <span className="side-stick" />
          <span className="side-neon" />
        </div>
        <div className="cabinet-side cabinet-side-right" aria-hidden="true">
          <span className="side-neon" />
          <span className="side-star" />
          <span className="side-pixel" />
          <span className="side-stick" />
        </div>

        <header className="cabinet-marquee">
          <div className="cabinet-marquee-acrylic" aria-hidden="true" />
          <div className="cabinet-marquee-shine" aria-hidden="true" />
          <div className="cabinet-marquee-inner">
            <a href="#top" className="cabinet-brand" aria-label="Vintage Arcade">
              <Image
                src="/images/vintage-arcade-logo.webp"
                alt="Vintage Arcade"
                width={140}
                height={140}
                className="cabinet-brand-logo"
                priority
              />
              <div>
                <p>VINTAGE ARCADE</p>
                <strong>PRESS START</strong>
              </div>
            </a>
            <nav className="cabinet-marquee-nav" aria-label="Navegação do gabinete">
              {NAV.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <div className="cabinet-bezel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <ProductArcadeScreen
            item={item}
            index={Math.min(index, items.length - 1)}
            total={items.length}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>

        <div className="cabinet-control-deck">
          <div className="cabinet-joystick-block">
            <button type="button" className="cabinet-stick-hit" onClick={goPrev} aria-label="Anterior via joystick">
              ◀
            </button>
            <div className={`cabinet-joystick stick-${stickDir}`} aria-hidden="true">
              <span className="cabinet-joystick-shaft" />
              <span className="cabinet-joystick-ball" />
            </div>
            <button type="button" className="cabinet-stick-hit" onClick={goNext} aria-label="Próximo via joystick">
              ▶
            </button>
          </div>

          <div
            className="cabinet-action-pad"
            role="tablist"
            aria-label="Categorias do catálogo"
            onKeyDown={onDeckKeyDown}
          >
            {CATEGORY_BUTTONS.map((button) => {
              const active = button.id === category;
              return (
                <button
                  key={button.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  id={`cabinet-cat-${button.id}`}
                  tabIndex={active ? 0 : -1}
                  className={`cabinet-pad-btn tone-${button.tone} ${active ? 'is-active' : ''}`}
                  onClick={() => selectCategory(button.id)}
                >
                  <span className="cabinet-pad-cap" aria-hidden="true" />
                  <small>{button.key}</small>
                  <em>{button.label}</em>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="cabinet-lower">
          <div className="cabinet-coin-row">
            <span className="cabinet-coin-slot" aria-hidden="true" />
            <p className="cabinet-insert">INSERT COIN</p>
            <span className="cabinet-coin-slot" aria-hidden="true" />
          </div>
          <p className="cabinet-address">
            Rua Dr. Tobias Lima, 1320
            <br />
            Centro — Bebedouro/SP
          </p>
          <div className="cabinet-lower-actions">
            <a
              href={`${WHATSAPP}?text=Oi%2C%20quero%20reservar%20uma%20mesa%20na%20Vintage%20Arcade.`}
              target="_blank"
              rel="noreferrer"
              className="retro-btn retro-btn-primary"
            >
              Reservar mesa
            </a>
            <div className="cabinet-social">
              <a href={`${WHATSAPP}?text=Oi%2C%20vim%20pelo%20site%20da%20Vintage%20Arcade.`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <a href={INSTAGRAM} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </div>
          <div className="cabinet-proof">
            {socialProof.map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
}
