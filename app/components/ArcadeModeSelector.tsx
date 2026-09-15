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
    href: 'https://wa.me/551733402000?text=Oi%2C%20quero%20informações%20sobre%20aniversários%20e%20eventos%20na%20Vintage%20Arcade.',
    tone: 'red'
  }
];

export default function ArcadeModeSelector() {
  const [activeId, setActiveId] = useState(modes[0].id);
  const active = modes.find((mode) => mode.id === activeId) ?? modes[0];

  return (
    <div className="mode-selector">
      <div className="mode-selector-controls" role="tablist" aria-label="Escolha uma experiência Vintage Arcade">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active.id === mode.id}
            onClick={() => setActiveId(mode.id)}
            className={`arcade-action arcade-action-${mode.tone} ${active.id === mode.id ? 'is-active' : ''}`}
          >
            <span aria-hidden="true" />
            <small>{mode.key}</small>
            <em>{mode.label}</em>
          </button>
        ))}
      </div>

      <div className="mode-selector-display" role="tabpanel">
        <div>
          <span className="mode-kicker">MODE SELECTED · {active.label}</span>
          <h4>{active.title}</h4>
          <p>{active.text}</p>
        </div>
        <a className="retro-btn retro-btn-primary" href={active.href} target="_blank" rel="noreferrer">
          {active.cta}
        </a>
      </div>
    </div>
  );
}
