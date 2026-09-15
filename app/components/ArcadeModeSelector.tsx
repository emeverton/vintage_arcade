'use client';

import { useCallback, useState, type KeyboardEvent } from 'react';

type Mode = {
  id: string;
  key: string;
  label: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  tone: 'pink' | 'yellow' | 'blue' | 'red';
};

const modes: Mode[] = [
  {
    id: 'salao',
    key: 'A',
    label: 'SALÃO',
    title: 'Jogue, coma e fique mais um pouco',
    text: 'A experiência completa da Vintage: ambiente temático, arcades, burgers e aquela sensação de voltar alguns anos no tempo.',
    cta: 'Reservar pelo WhatsApp',
    href: 'https://wa.me/551733402000?text=Oi%2C%20quero%20reservar%20uma%20mesa%20na%20Vintage%20Arcade.',
    tone: 'pink'
  },
  {
    id: 'delivery',
    key: 'B',
    label: 'DELIVERY',
    title: 'Continue a partida em casa',
    text: 'Peça seus favoritos para delivery ou retirada e leve a identidade da Vintage para fora do salão.',
    cta: 'Pedir pelo WhatsApp',
    href: 'https://wa.me/551733402000?text=Oi%2C%20quero%20fazer%20um%20pedido%20na%20Vintage%20Arcade.',
    tone: 'yellow'
  },
  {
    id: 'grupo',
    key: 'X',
    label: 'CO-OP',
    title: 'Chame seu squad',
    text: 'Casal, família ou turma de amigos: escolha sua companhia, monte o combo e transforme a noite em modo co-op.',
    cta: 'Organizar uma visita',
    href: 'https://wa.me/551733402000?text=Oi%2C%20quero%20organizar%20uma%20visita%20em%20grupo%20na%20Vintage%20Arcade.',
    tone: 'blue'
  },
  {
    id: 'evento',
    key: 'Y',
    label: 'PARTY',
    title: 'Desbloqueie uma fase especial',
    text: 'Aniversários e encontros podem virar uma experiência própria, com reserva, alimentação e dinâmica de arcade no mesmo lugar.',
    cta: 'Consultar evento',
    href: 'https://wa.me/551733402000?text=Oi%2C%20quero%20informa%C3%A7%C3%B5es%20sobre%20anivers%C3%A1rios%20e%20eventos%20na%20Vintage%20Arcade.',
    tone: 'red'
  }
];

export default function ArcadeModeSelector() {
  const [activeId, setActiveId] = useState(modes[0].id);
  const active = modes.find((mode) => mode.id === activeId) ?? modes[0];

  const selectByIndex = useCallback((index: number) => {
    const next = modes[(index + modes.length) % modes.length];
    setActiveId(next.id);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const current = modes.findIndex((mode) => mode.id === activeId);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        selectByIndex(current + 1);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectByIndex(current - 1);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        selectByIndex(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        selectByIndex(modes.length - 1);
      }
    },
    [activeId, selectByIndex]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-stretch">
      <div
        className="control-deck grid grid-cols-4 gap-2 lg:grid-cols-2"
        role="tablist"
        aria-label="Escolha uma experiência Vintage Arcade"
        onKeyDown={onKeyDown}
      >
        {modes.map((mode) => {
          const selected = active.id === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="arcade-mode-panel"
              id={`arcade-mode-${mode.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(mode.id)}
              className={`arcade-action arcade-action-${mode.tone} ${selected ? 'is-active' : ''}`}
            >
              <span className="arcade-button-cap" aria-hidden="true" />
              <small>{mode.key}</small>
              <em className="not-italic text-[9px] font-black tracking-[0.16em] text-white/65">{mode.label}</em>
            </button>
          );
        })}
      </div>

      <div
        id="arcade-mode-panel"
        className="flex min-h-[180px] flex-col justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-5 md:p-6"
        role="tabpanel"
        aria-labelledby={`arcade-mode-${active.id}`}
      >
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.28em] text-vintageYellow">MODE SELECTED · {active.label}</span>
          <h4 className="mt-3 max-w-xl text-2xl font-black uppercase leading-tight md:text-3xl">{active.title}</h4>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">{active.text}</p>
        </div>
        <a className="retro-btn retro-btn-primary mt-5 self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vintageYellow" href={active.href} target="_blank" rel="noreferrer">
          {active.cta}
        </a>
      </div>
    </div>
  );
}
