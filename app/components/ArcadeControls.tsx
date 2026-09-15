'use client';

import type { KeyboardEvent } from 'react';
import { CATEGORIES, type CategoryId } from '../lib/site';

type Props = {
  category: CategoryId;
  stick: 'idle' | 'left' | 'right';
  onPrev: () => void;
  onNext: () => void;
  onCategory: (id: CategoryId) => void;
};

export default function ArcadeControls({ category, stick, onPrev, onNext, onCategory }: Props) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const i = CATEGORIES.findIndex((c) => c.id === category);
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      onCategory(CATEGORIES[(i + 1) % CATEGORIES.length].id);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      onCategory(CATEGORIES[(i - 1 + CATEGORIES.length) % CATEGORIES.length].id);
    }
  };

  return (
    <div className="va-controls">
      <div className="va-stick-wrap">
        <button type="button" className="va-stick-side" onClick={onPrev} aria-label="Produto anterior">
          ◀
        </button>
        <div className={`va-stick stick-${stick}`} aria-hidden="true">
          <span className="va-stick-shaft" />
          <span className="va-stick-ball" />
        </div>
        <button type="button" className="va-stick-side" onClick={onNext} aria-label="Próximo produto">
          ▶
        </button>
      </div>

      <div className="va-pad" role="tablist" aria-label="Categorias" onKeyDown={onKeyDown}>
        {CATEGORIES.map((btn) => {
          const active = btn.id === category;
          return (
            <button
              key={btn.id}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              className={`va-pad-btn tone-${btn.tone} ${active ? 'is-active' : ''}`}
              onClick={() => onCategory(btn.id)}
            >
              <span className="va-pad-cap" aria-hidden="true" />
              <small>{btn.key}</small>
              <em>{btn.label}</em>
            </button>
          );
        })}
      </div>
    </div>
  );
}
