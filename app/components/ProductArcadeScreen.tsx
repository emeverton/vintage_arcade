'use client';

import Image from 'next/image';
import type { CatalogItem, CategoryId } from '../lib/site';
import { itemLinks } from '../lib/site';

type Props = {
  item: CatalogItem;
  category: CategoryId;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function ProductArcadeScreen({ item, category, index, total, onPrev, onNext }: Props) {
  const links = itemLinks(item, category);
  const title = category === 'burgers' ? 'SELECT YOUR BURGER' : `SELECT · ${item.categoryLabel}`;

  return (
    <div className="va-screen" role="region" aria-label="Catálogo interativo">
      <div className="va-screen-scan" aria-hidden="true" />

      <div className="va-screen-bar">
        <span>1UP</span>
        <strong>{title}</strong>
        <span>HI-SCORE</span>
      </div>

      <div className="va-screen-body">
        <div className="va-screen-art" aria-hidden="true">
          <Image src="/images/vintage-arcade-logo.webp" alt="" width={180} height={180} className="va-screen-logo" />
        </div>

        <div className="va-screen-copy">
          <p className="va-screen-meta">
            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')} · {item.categoryLabel}
          </p>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
        </div>
      </div>

      <div className="va-screen-footer">
        <button type="button" className="va-nav-btn" onClick={onPrev} aria-label="Anterior">
          ◀ PREV
        </button>
        <div className="va-screen-ctas">
          <a href={links.secondary} target="_blank" rel="noreferrer" className="va-chip">
            {links.secondaryLabel}
          </a>
          <a href={links.primary} target="_blank" rel="noreferrer" className="va-chip va-chip-primary">
            {links.primaryLabel}
          </a>
        </div>
        <button type="button" className="va-nav-btn" onClick={onNext} aria-label="Próximo">
          NEXT ▶
        </button>
      </div>
    </div>
  );
}
