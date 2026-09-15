import Image from 'next/image';

const navItems = [
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Contato', href: '#contato' }
];

const experienceCards = [
  {
    eyebrow: 'PLAYER 1',
    title: 'Food + Games + Nostalgia',
    text: 'Uma noite que mistura burger, arcade e memória afetiva em uma experiência impossível de confundir com uma hamburgueria comum.'
  },
  {
    eyebrow: 'CO-OP',
    title: 'Feito para compartilhar',
    text: 'Casal, família, amigos e aniversários. O salão funciona como destination brand para diferentes ocasiões de consumo.'
  },
  {
    eyebrow: 'HIGH SCORE',
    title: 'Uma marca que gera conteúdo',
    text: 'O ambiente, os arcades e o KV tornam cada visita naturalmente fotografável, compartilhável e fácil de transformar em campanha.'
  }
];

const menuModes = [
  {
    badge: '01',
    title: 'Burgers autorais',
    text: 'Produtos com naming, apresentação e personalidade alinhados à cultura gamer.'
  },
  {
    badge: '02',
    title: 'Combos & sides',
    text: 'Arquitetura de menu pensada para aumentar AOV sem depender de desconto agressivo.'
  },
  {
    badge: '03',
    title: 'Delivery & retirada',
    text: 'A mesma marca fora do salão, com jornada direta para pedido e recompra.'
  },
  {
    badge: '04',
    title: 'Eventos & aniversários',
    text: 'Pacotes estruturados para grupos, comemorações e experiências temáticas.'
  }
];

const eventModes = [
  ['Arcade Party', 'Formato enxuto para pequenos grupos e aniversários.'],
  ['Arcade Party Plus', 'Mesa reservada, combos e dinâmica de jogos para grupos maiores.'],
  ['Boss Battle Night', 'Campeonatos, empresas, ativações e noites temáticas.']
];

function ArcadeButton({ label, tone }: { label: string; tone: 'pink' | 'yellow' | 'blue' | 'red' }) {
  return (
    <div className={`arcade-action arcade-action-${tone}`} aria-hidden="true">
      <span />
      <small>{label}</small>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cabinetBlack text-white">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-grid bg-[size:34px_34px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(30,70,200,0.34),transparent_35%),radial-gradient(circle_at_90%_35%,rgba(255,79,163,0.16),transparent_28%),radial-gradient(circle_at_8%_75%,rgba(255,208,49,0.10),transparent_22%)]" />
      </div>

      <section className="relative px-3 py-5 md:px-6 md:py-10 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="arcade-shell cabinet-depth mx-auto max-w-6xl rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,#171824_0%,#09090f_100%)] p-2 shadow-glow md:p-5">
            <header className="marquee-panel relative mx-auto mb-3 max-w-5xl overflow-hidden rounded-[2rem_2rem_1rem_1rem] border border-vintageYellow/35 bg-[linear-gradient(100deg,#13278f_0%,#1E46C8_42%,#ff4fa3_100%)] bg-[length:200%_200%] px-5 py-4 shadow-neon animate-marquee md:px-8 md:py-5">
              <div className="marquee-noise absolute inset-0 opacity-30" />
              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="brand-chip">
                    <Image src="/images/vintage-arcade-logo.webp" alt="Vintage Arcade" width={90} height={90} className="h-12 w-12 object-contain md:h-14 md:w-14" priority />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.42em] text-vintageYellow md:text-[10px]">Vintage Arcade • Bebedouro</p>
                    <h1 className="mt-1 text-xl font-black uppercase tracking-[0.12em] md:text-3xl">Press Start</h1>
                  </div>
                </div>
                <nav className="flex flex-wrap items-center gap-2 md:justify-end">
                  {navItems.map((item) => (
                    <a key={item.label} href={item.href} className="nav-pill">
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </header>

            <section className="cabinet-screen-wrap relative mx-auto max-w-5xl px-1 pb-2 md:px-7 md:pb-5">
              <div className="screen-bezel rounded-[2.2rem_2.2rem_1rem_1rem] border border-white/10 bg-black p-3 md:p-5">
                <div className="hero-screen relative min-h-[650px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#060918] px-5 py-8 shadow-screen md:min-h-[700px] md:px-10 md:py-10">
                  <div className="absolute inset-0 bg-scanlines bg-[size:100%_8px] opacity-[0.14]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(30,70,200,0.40),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.62))]" />
                  <div className="screen-glow screen-glow-left" />
                  <div className="screen-glow screen-glow-right" />

                  <div className="relative z-10 flex min-h-[585px] flex-col items-center justify-center text-center md:min-h-[620px]">
                    <p className="mb-4 inline-flex rounded-full border border-vintageYellow/40 bg-vintageYellow/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.34em] text-vintageYellow md:text-[10px]">
                      Food + Games + Nostalgia
                    </p>

                    <div className="hero-logo-wrap">
                      <Image
                        src="/images/vintage-arcade-logo.webp"
                        alt="Vintage Arcade"
                        width={860}
                        height={860}
                        className="mx-auto h-auto w-full max-w-[390px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] md:max-w-[470px]"
                        priority
                      />
                    </div>

                    <h2 className="mt-6 max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.03em] md:text-6xl lg:text-7xl">
                      Comida. Games.<br />Nostalgia.
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-6 text-white/72 md:text-base md:leading-7">
                      Uma experiência arcade em Bebedouro onde o ambiente, o cardápio e a diversão fazem parte do mesmo jogo.
                    </p>

                    <div className="mt-7 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
                      <a href="#contato" className="retro-btn retro-btn-primary flex-1">Reservar mesa</a>
                      <a href="#cardapio" className="retro-btn retro-btn-secondary flex-1">Ver cardápio</a>
                    </div>

                    <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-2 md:gap-3">
                      {[
                        ['PLAY', 'No salão'],
                        ['ORDER', 'Delivery'],
                        ['PARTY', 'Eventos']
                      ].map(([value, label]) => (
                        <div key={value} className="screen-stat">
                          <strong>{value}</strong>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="screen-statusbar">
                    <span>1UP</span>
                    <span className="animate-pulseSoft">READY PLAYER?</span>
                    <span>HI-SCORE</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="control-panel mx-auto max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#191a27,#08090f)] px-4 py-6 md:px-8 md:py-8" id="experiencia">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex items-center gap-4">
                  <div className="joystick-base"><div className="joystick-stick" /></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintageYellow">Control Panel</p>
                    <h3 className="mt-1 text-2xl font-black uppercase tracking-wide md:text-3xl">Escolha seu modo de jogo</h3>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <ArcadeButton label="A" tone="pink" />
                  <ArcadeButton label="B" tone="yellow" />
                  <ArcadeButton label="X" tone="blue" />
                  <ArcadeButton label="Y" tone="red" />
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {experienceCards.map((card) => (
                  <article key={card.title} className="feature-card group">
                    <span>{card.eyebrow}</span>
                    <h4>{card.title}</h4>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]" id="cardapio">
                <div className="rounded-[1.8rem] border border-white/10 bg-black/25 p-5 md:p-6">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintagePink">Select Mode</p>
                      <h4 className="mt-1 text-2xl font-black uppercase md:text-3xl">O cardápio entra no jogo</h4>
                    </div>
                    <span className="hidden text-xs font-black uppercase tracking-[0.25em] text-white/35 md:block">4 modes available</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {menuModes.map((item) => (
                      <article key={item.badge} className="menu-mode-card">
                        <span className="menu-mode-badge">{item.badge}</span>
                        <div>
                          <h5>{item.title}</h5>
                          <p>{item.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <aside className="reference-card">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintagePink">Cabinet DNA</p>
                    <h4 className="mt-1 text-xl font-black uppercase">Inspirado no fliperama clássico</h4>
                    <p className="mt-3 text-sm leading-6 text-white/68">A verticalidade, a moldura, a marquee, o CRT e o painel físico foram traduzidos para a experiência digital.</p>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/35 p-3">
                    <Image src="/images/mk-arcade-reference.webp" alt="Arcade cabinet reference" width={700} height={900} className="h-auto w-full rounded-xl object-cover" />
                  </div>
                </aside>
              </div>
            </section>

            <section className="coin-door mx-auto mt-4 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#0b0c14,#06070b)] px-4 py-8 md:px-8 md:py-10" id="eventos">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintageYellow">Insert Coin • Eventos</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-[0.95] md:text-4xl">Transforme a noite em uma fase especial.</h3>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/72 md:text-base">Aniversários, encontros e noites temáticas com estrutura de produto — não apenas uma reserva de mesa.</p>
                  <a href="#contato" className="retro-btn retro-btn-primary mt-6">Quero reservar um evento</a>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {eventModes.map(([title, text], index) => (
                    <article key={title} className="event-card">
                      <div className="event-card-level">LV.{index + 1}</div>
                      <h4>{title}</h4>
                      <p>{text}</p>
                      <span>SELECT →</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <footer id="contato" className="mx-auto mt-4 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#151622,#090a10)] px-4 py-8 md:px-8 md:py-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintagePink">Continue?</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-tight md:text-4xl">Seu próximo game começa aqui.</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 md:text-base">Próxima etapa: conectar WhatsApp, cardápio, Instagram, prova social real, tracking e CRM sem alterar esta direção visual.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <a href="#" className="retro-btn retro-btn-primary min-w-[220px] text-center">Falar no WhatsApp</a>
                  <a href="#" className="retro-btn retro-btn-secondary min-w-[220px] text-center">Abrir Instagram</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}
