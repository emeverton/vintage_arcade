'use client';

import { useState } from 'react';

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

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-stretch">
      <div className="grid grid-cols-4 gap-3 rounded-[1.5rem] border border-white/10 bg-black/25 p-4 lg:grid-cols-2" role="tablist" aria-label="Escolha uma experiência Vintage Arcade">
        {modes.map((mode) => {
          const selected = active.id === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(mode.id)}
              className={`arcade-action arcade-action-${mode.tone} rounded-2xl border px-3 py-3 transition duration-150 ${selected ? 'border-vintageYellow/50 bg-white/10 -translate-y-1' : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'}`}
            >
              <span aria-hidden="true" />
              <small>{mode.key}</small>
              <em className="not-italic text-[9px] font-black tracking-[0.16em] text-white/60">{mode.label}</em>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-[210px] flex-col justify-between rounded-[1.5rem] border border-vintageBlue/25 bg-[radial-gradient(circle_at_top_right,rgba(30,70,200,0.20),transparent_45%),rgba(255,255,255,0.035)] p-5 md:p-6" role="tabpanel">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.28em] text-vintageYellow">MODE SELECTED · {active.label}</span>
          <h4 className="mt-3 max-w-xl text-2xl font-black uppercase leading-tight md:text-3xl">{active.title}</h4>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">{active.text}</p>
        </div>
        <a className="retro-btn retro-btn-primary mt-5 self-start" href={active.href} target="_blank" rel="noreferrer">
          {active.cta}
        </a>
      </div>
    </div>
  );
}
