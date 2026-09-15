'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import ArcadeMarquee from './ArcadeMarquee';
import ArcadeControls from './ArcadeControls';
import CabinetFooter from './CabinetFooter';
import ProductArcadeScreen from './ProductArcadeScreen';
import { CATALOG, type CategoryId } from '../lib/site';

export default function VintageCabinet() {
  const [category, setCategory] = useState<CategoryId>('burgers');
  const [index, setIndex] = useState(0);
  const [stick, setStick] = useState<'idle' | 'left' | 'right'>('idle');
  const touchX = useRef<number | null>(null);

  const items = CATALOG[category];
  const safeIndex = Math.min(index, items.length - 1);
  const item = items[safeIndex];

  const bumpStick = useCallback((dir: 'left' | 'right') => {
    setStick(dir);
    window.setTimeout(() => setStick('idle'), 140);
  }, []);

  const onPrev = useCallback(() => {
    bumpStick('left');
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [bumpStick, items.length]);

  const onNext = useCallback(() => {
    bumpStick('right');
    setIndex((i) => (i + 1) % items.length);
  }, [bumpStick, items.length]);

  const onCategory = useCallback((id: CategoryId) => {
    setCategory(id);
    setIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
      if (event.key === 'a' || event.key === 'A') onCategory('burgers');
      if (event.key === 'b' || event.key === 'B') onCategory('porcoes');
      if (event.key === 'x' || event.key === 'X') onCategory('drinks');
      if (event.key === 'y' || event.key === 'Y') onCategory('eventos');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCategory, onNext, onPrev]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchX.current == null) return;
    const end = event.changedTouches[0]?.clientX ?? touchX.current;
    const delta = end - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) < 42) return;
    if (delta > 0) onPrev();
    else onNext();
  };

  return (
    <section id="cabinet" className="va-scene" aria-label="Gabinete Vintage Arcade">
      <div className="va-cabinet">
        <div className="va-side va-side-left" aria-hidden="true" />
        <div className="va-side va-side-right" aria-hidden="true" />

        <ArcadeMarquee />

        <div className="va-bezel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <ProductArcadeScreen
            item={item}
            category={category}
            index={safeIndex}
            total={items.length}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>

        <ArcadeControls
          category={category}
          stick={stick}
          onPrev={onPrev}
          onNext={onNext}
          onCategory={onCategory}
        />

        <CabinetFooter />
      </div>
    </section>
  );
}
