import BrandMark from './components/BrandMark';
import ArcadeModeSelector from './components/ArcadeModeSelector';

/** Destinos operacionais já existentes na LP. Não inventar cardápio/iFood/telefone. */
const WHATSAPP = 'https://wa.me/551733402000';
const INSTAGRAM = 'https://www.instagram.com/vintagearcadeburger/';
const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Vintage+Arcade+Rua+Dr+Tobias+Lima+1320+Bebedouro+SP';

const MENU_WHATSAPP = `${WHATSAPP}?text=${encodeURIComponent('Oi, quero ver o cardápio e fazer um pedido na Vintage Arcade.')}`;
const VISIT_WHATSAPP = `${WHATSAPP}?text=${encodeURIComponent('Oi, quero reservar uma mesa na Vintage Arcade.')}`;
const EVENT_WHATSAPP = `${WHATSAPP}?text=${encodeURIComponent('Oi, quero informações sobre eventos e aniversários na Vintage Arcade.')}`;
const GENERIC_WHATSAPP = `${WHATSAPP}?text=${encodeURIComponent('Oi, vim pelo site da Vintage Arcade.')}`;

const navItems = [
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Visite', href: '#visite' }
];

const experienceCards = [
  {
    eyebrow: 'PLAYER 1',
    title: 'Comer e jogar no mesmo lugar',
    text: 'Burgers, porções, drinks e fliperamas em um ambiente feito para transformar a refeição em experiência.'
  },
  {
    eyebrow: 'CO-OP',
    title: 'Diversão para todas as idades',
    text: 'Clássicos e jogos atuais para amigos, casais e famílias — no salão ou na visita em grupo.'
  },
  {
    eyebrow: 'CONTINUE?',
    title: 'Peça ou venha até a Vintage',
    text: 'Cardápio e pedidos pelo WhatsApp. Reserva e localização direto no contato da casa.'
  }
];

const menuHighlights = [
  {
    badge: '01',
    title: 'Sandubas',
    text: 'Burgers com personalidade gamer e especiais da casa.'
  },
  {
    badge: '02',
    title: 'Porções',
    text: 'Para compartilhar no salão ou completar o pedido.'
  },
  {
    badge: '03',
    title: 'Drinks & bebidas',
    text: 'Opções para acompanhar burgers, jogos e encontros.'
  },
  {
    badge: '04',
    title: 'Delivery & retirada',
    text: 'Peça pelo WhatsApp e leve a Vintage para casa.'
  }
];

const events = [
  ['Arcade Party', 'Aniversários e pequenos grupos com reserva e clima de arcade.'],
  ['Noite em turma', 'Encontro de amigos ou família com comida, jogos e tempo para ficar.'],
  ['Fase especial', 'Noites temáticas e ativações sob consulta com a equipe.']
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cabinetBlack text-white">
      <div className="pointer-events-none fixed inset-0 opacity-40" aria-hidden="true">
        <div className="absolute inset-0 bg-grid bg-[size:34px_34px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(30,70,200,0.34),transparent_35%),radial-gradient(circle_at_90%_35%,rgba(255,79,163,0.16),transparent_28%),radial-gradient(circle_at_8%_75%,rgba(255,208,49,0.10),transparent_22%)]" />
      </div>

      <section className="relative px-3 py-4 md:px-6 md:py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="arcade-shell cabinet-depth mx-auto max-w-6xl rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,#171824_0%,#09090f_100%)] p-2 shadow-glow md:p-5">
            <header className="marquee-panel relative mx-auto mb-3 max-w-5xl overflow-hidden rounded-[2rem_2rem_1rem_1rem] border border-vintageYellow/35 bg-[linear-gradient(100deg,#13278f_0%,#1E46C8_42%,#ff4fa3_100%)] bg-[length:200%_200%] px-4 py-3 shadow-neon animate-marquee md:px-8 md:py-4">
              <div className="marquee-noise absolute inset-0 opacity-30" aria-hidden="true" />
              <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <a href="#top" className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vintageYellow">
                  <BrandMark size="sm" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.32em] text-vintageYellow md:tracking-[0.42em] md:text-[10px]">
                      Vintage Arcade · Bebedouro
                    </p>
                    <p className="mt-1 text-lg font-black uppercase tracking-[0.12em] md:text-2xl">Press Start</p>
                  </div>
                </a>
                <nav className="flex flex-wrap items-center gap-2 md:justify-end" aria-label="Navegação principal">
                  {navItems.map((item) => (
                    <a key={item.label} href={item.href} className="nav-pill">
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </header>

            <section id="top" className="cabinet-screen-wrap relative mx-auto max-w-5xl px-1 pb-2 md:px-7 md:pb-4">
              <div className="screen-bezel rounded-[2.2rem_2.2rem_1rem_1rem] border border-white/10 bg-black p-3 md:p-5">
                <div className="hero-screen relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#060918] px-4 pb-12 pt-6 shadow-screen md:px-10 md:pb-14 md:pt-8">
                  <div className="absolute inset-0 bg-scanlines bg-[size:100%_8px] opacity-[0.14]" aria-hidden="true" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(30,70,200,0.40),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.62))]" aria-hidden="true" />
                  <div className="screen-glow screen-glow-left" aria-hidden="true" />
                  <div className="screen-glow screen-glow-right" aria-hidden="true" />

                  <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
                    <p className="mb-3 inline-flex rounded-full border border-vintageYellow/40 bg-vintageYellow/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] text-vintageYellow md:px-4 md:tracking-[0.34em] md:text-[10px]">
                      Food + Games + Nostalgia
                    </p>

                    <BrandMark size="lg" className="hero-brand" />

                    <h1 className="mt-4 max-w-4xl text-3xl font-black uppercase leading-[0.92] tracking-[-0.03em] md:mt-5 md:text-5xl lg:text-6xl">
                      Cardápio, pedido<br className="hidden sm:block" /> e visita à Vintage
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/72 md:mt-4 md:text-base md:leading-7">
                      Sandubas, porções, drinks e fliperamas no coração de Bebedouro. Peça pelo WhatsApp ou venha jogar no salão.
                    </p>

                    <div className="mt-5 flex w-full max-w-lg flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-center">
                      <a href={MENU_WHATSAPP} target="_blank" rel="noreferrer" className="retro-btn retro-btn-primary flex-1">
                        Ver cardápio / pedir
                      </a>
                      <a href={VISIT_WHATSAPP} target="_blank" rel="noreferrer" className="retro-btn retro-btn-secondary flex-1">
                        Reservar visita
                      </a>
                    </div>

                    <div id="cardapio" className="mt-6 grid w-full gap-2 text-left sm:grid-cols-2 md:mt-7">
                      {menuHighlights.map((item) => (
                        <article key={item.badge} className="menu-mode-card menu-mode-card-compact">
                          <span className="menu-mode-badge">{item.badge}</span>
                          <div>
                            <h2 className="m-0 text-sm font-black uppercase md:text-[0.95rem]">{item.title}</h2>
                            <p className="mt-1 text-xs leading-5 text-white/62 md:text-[0.82rem] md:leading-[1.55]">{item.text}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="screen-statusbar" aria-hidden="true">
                    <span>1UP</span>
                    <span className="animate-pulseSoft">INSERT COIN</span>
                    <span>READY</span>
                  </div>
                </div>
              </div>
            </section>

            <section
              className="control-panel mx-auto max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#191a27,#08090f)] px-4 py-5 md:px-8 md:py-7"
              id="experiencia"
            >
              <div className="flex items-center gap-4">
                <div className="joystick-base" aria-hidden="true">
                  <div className="joystick-stick" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintageYellow">Painel de controles</p>
                  <h2 className="mt-1 text-xl font-black uppercase tracking-wide md:text-3xl">Escolha como jogar</h2>
                </div>
              </div>

              <div className="mt-5 md:mt-6">
                <ArcadeModeSelector />
              </div>

              <div className="mt-6 grid gap-3 md:mt-7 md:grid-cols-3 md:gap-4">
                {experienceCards.map((card) => (
                  <article key={card.title} className="feature-card feature-card-compact group">
                    <span>{card.eyebrow}</span>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section
              className="coin-door mx-auto mt-3 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#0b0c14,#06070b)] px-4 py-6 md:mt-4 md:px-8 md:py-8"
              id="eventos"
            >
              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintageYellow">Insert Coin · Eventos</p>
                  <h2 className="mt-2 text-2xl font-black uppercase leading-[0.95] md:text-4xl">
                    Comemore na Vintage
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/72 md:mt-4 md:text-base">
                    Aniversário, encontro de amigos ou noite temática: consulte formatos e reserve com a equipe.
                  </p>
                  <a href={EVENT_WHATSAPP} target="_blank" rel="noreferrer" className="retro-btn retro-btn-primary mt-5">
                    Consultar evento
                  </a>
                </div>

                <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                  {events.map(([title, text], index) => (
                    <article key={title} className="event-card event-card-compact">
                      <div className="event-card-level">LV.{index + 1}</div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                      <span>SELECT →</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="visite"
              className="visit-panel mx-auto mt-3 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#151622,#090a10)] px-4 py-6 md:mt-4 md:px-8 md:py-8"
            >
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintagePink">Continue?</p>
                  <h2 className="mt-2 text-2xl font-black uppercase leading-tight md:text-4xl">
                    Visite a Vintage em Bebedouro
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 md:mt-4 md:text-base">
                    Rua Dr. Tobias Lima, 1320 — Centro, Bebedouro/SP.
                    <br />
                    Telefone e WhatsApp: (17) 3340-2000.
                  </p>
                  <p className="mt-3 text-xs leading-5 text-white/45">
                    Horários de funcionamento sob confirmação pelo WhatsApp ou Instagram — não publicados aqui até validação comercial.
                  </p>
                </div>

                <div className="contact-console">
                  <div className="contact-console-screen">
                    <span>ESCOLHA O CANAL</span>
                    <strong>PRONTO?</strong>
                  </div>
                  <a href={MENU_WHATSAPP} target="_blank" rel="noreferrer" className="retro-btn retro-btn-primary w-full text-center">
                    Cardápio / pedido
                  </a>
                  <a href={GENERIC_WHATSAPP} target="_blank" rel="noreferrer" className="retro-btn retro-btn-secondary w-full text-center">
                    WhatsApp
                  </a>
                  <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="retro-btn retro-btn-secondary w-full text-center">
                    @vintagearcadeburger
                  </a>
                  <a href={MAPS} target="_blank" rel="noreferrer" className="retro-btn retro-btn-secondary w-full text-center">
                    Como chegar
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
