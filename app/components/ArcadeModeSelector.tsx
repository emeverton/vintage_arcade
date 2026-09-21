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

const WHATSAPP = 'https://wa.me/551733402000';

const modes: Mode[] = [
  {
    id: 'cardapio',
    key: 'A',
    label: 'PEDIR',
    title: 'Peça sandubas, porções e bebidas',
    text: 'Fale com a Vintage pelo WhatsApp para ver o cardápio e montar seu pedido para delivery ou retirada.',
    cta: 'Cardápio pelo WhatsApp',
    href: `${WHATSAPP}?text=${encodeURIComponent('Oi, quero ver o cardápio e fazer um pedido na Vintage Arcade.')}`,
    tone: 'yellow'
  },
  {
    id: 'salao',
    key: 'B',
    label: 'SALÃO',
    title: 'Venha jogar e comer no salão',
    text: 'Reserve uma mesa e aproveite o ambiente arcade com comida, games e nostalgia em Bebedouro.',
    cta: 'Reservar visita',
    href: `${WHATSAPP}?text=${encodeURIComponent('Oi, quero reservar uma mesa na Vintage Arcade.')}`,
    tone: 'pink'
  },
  {
    id: 'grupo',
    key: 'X',
    label: 'TURMA',
    title: 'Traga a galera',
    text: 'Casal, família ou amigos: organize a visita e transforme a noite em uma partida compartilhada.',
    cta: 'Organizar visita',
    href: `${WHATSAPP}?text=${encodeURIComponent('Oi, quero organizar uma visita em grupo na Vintage Arcade.')}`,
    tone: 'blue'
  },
  {
    id: 'evento',
    key: 'Y',
    label: 'FESTA',
    title: 'Aniversário e encontros',
    text: 'Consulte formatos para comemorações e eventos com a equipe da Vintage.',
    cta: 'Consultar evento',
    href: `${WHATSAPP}?text=${encodeURIComponent('Oi, quero informações sobre aniversários e eventos na Vintage Arcade.')}`,
    tone: 'red'
  }
];

export default function ArcadeModeSelector() {
  const [activeId, setActiveId] = useState(modes[0].id);
  const active = modes.find((mode) => mode.id === activeId) ?? modes[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-stretch">
      <div className="grid grid-cols-4 gap-2 rounded-[1.5rem] border border-white/10 bg-black/25 p-3 sm:gap-3 sm:p-4 lg:grid-cols-2" role="tablist" aria-label="Escolha uma experiência Vintage Arcade">
        {modes.map((mode) => {
          const selected = active.id === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`mode-panel-${mode.id}`}
              id={`mode-tab-${mode.id}`}
              onClick={() => setActiveId(mode.id)}
              className={`arcade-action arcade-action-${mode.tone} rounded-2xl border px-2 py-3 transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vintageYellow sm:px-3 ${selected ? 'border-vintageYellow/50 bg-white/10 -translate-y-1' : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]'}`}
            >
              <span aria-hidden="true" />
              <small>{mode.key}</small>
              <em className="not-italic text-[8px] font-black tracking-[0.12em] text-white/60 sm:text-[9px] sm:tracking-[0.16em]">{mode.label}</em>
            </button>
          );
        })}
      </div>

      <div
        id={`mode-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`mode-tab-${active.id}`}
        className="flex min-h-[190px] flex-col justify-between rounded-[1.5rem] border border-vintageBlue/25 bg-[radial-gradient(circle_at_top_right,rgba(30,70,200,0.20),transparent_45%),rgba(255,255,255,0.035)] p-5 md:min-h-[210px] md:p-6"
      >
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.28em] text-vintageYellow">Modo · {active.label}</span>
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
