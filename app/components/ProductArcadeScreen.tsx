'use client';

import Image from 'next/image';
import type { CatalogItem } from '../lib/catalog';
import { catalogHref } from '../lib/catalog';

type Props = {
  item: CatalogItem;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function ProductArcadeScreen({ item, index, total, onPrev, onNext }: Props) {
  const links = catalogHref(item);
  const primaryCta = item.category === 'eventos' ? 'CONSULTAR' : 'PEDIR';
  const secondaryCta = item.category === 'eventos' ? 'VER EVENTOS' : 'VER CARDÁPIO';

  return (
    <div className="cabinet-screen" role="region" aria-label="Catálogo interativo Vintage Arcade">
      <div className="cabinet-screen-crt" aria-hidden="true" />
      <div className="cabinet-screen-scanlines" aria-hidden="true" />

      <div className="cabinet-screen-topbar">
        <span>1UP</span>
        <strong>{item.category === 'burgers' ? 'SELECT YOUR BURGER' : `SELECT · ${item.categoryLabel}`}</strong>
        <span>HI-SCORE</span>
      </div>

      <div className="cabinet-screen-stage">
        <div className="cabinet-product-visual" aria-hidden="true">
          <div className="cabinet-product-glow" />
          <Image
            src="/images/vintage-arcade-logo.webp"
            alt=""
            width={220}
            height={220}
            className="cabinet-product-logo"
            priority
          />
          <div className="cabinet-product-badge">{item.categoryLabel}</div>
        </div>

        <div className="cabinet-product-copy">
          <p className="cabinet-product-kicker">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} · {item.categoryLabel}
          </p>
          <h2 className="cabinet-product-name">{item.name}</h2>
          <p className="cabinet-product-desc">{item.description}</p>
          {item.placeholder ? (
            <p className="cabinet-product-note">Visual de marca temporário — foto do produto em breve.</p>
          ) : null}
        </div>
      </div>

      <div className="cabinet-screen-controls">
        <button type="button" className="cabinet-screen-nav" onClick={onPrev} aria-label="Produto anterior">
          PREV
        </button>
        <div className="cabinet-screen-ctas">
          <a href={links.menu} target="_blank" rel="noreferrer" className="cabinet-chip-btn">
            {secondaryCta}
          </a>
          <a href={links.order} target="_blank" rel="noreferrer" className="cabinet-chip-btn cabinet-chip-btn-primary">
            {primaryCta}
          </a>
        </div>
        <button type="button" className="cabinet-screen-nav" onClick={onNext} aria-label="Próximo produto">
          NEXT
        </button>
      </div>
    </div>
  );
}
