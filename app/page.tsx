import Image from 'next/image';
import ArcadeModeSelector from './components/ArcadeModeSelector';

const WHATSAPP = 'https://wa.me/551733402000';
const INSTAGRAM = 'https://www.instagram.com/vintagearcadeburger/';

const navItems = [
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Visite', href: '#visite' }
];

const experienceCards = [
  {
    eyebrow: 'PLAYER 1',
    title: 'Food + Games + Nostalgia',
    text: 'Burger, porções, drinks e arcades em um ambiente construído para transformar uma refeição em experiência.'
  },
  {
    eyebrow: 'CO-OP',
    title: 'Diversão para várias gerações',
    text: 'Clássicos dos videogames encontram games atuais em uma proposta que funciona para amigos, casais e famílias.'
  },
  {
    eyebrow: 'HIGH SCORE',
    title: '4,8 no Google',
    text: 'Mais de 500 avaliações ajudam a provar que o tema chama atenção, mas comida, serviço e ambiente sustentam a experiência.'
  }
];

const menuHighlights = [
  {
    badge: '01',
    title: 'Sandubas lendários',
    text: 'Burgers com naming e personalidade inspirados no universo gamer, incluindo linhas e especiais da casa.'
  },
  {
    badge: '02',
    title: 'Porções & acompanhamentos',
    text: 'Itens para compartilhar e completar a partida no salão ou no pedido.'
  },
  {
    badge: '03',
    title: 'Drinks & bebidas',
    text: 'A experiência continua no copo, com opções para acompanhar burgers, jogos e encontros.'
  },
  {
    badge: '04',
    title: 'Delivery & retirada',
    text: 'Peça fora do salão e continue jogando em casa. Atendimento direto pelo canal da Vintage.'
  }
];

const events = [
  ['Arcade Party', 'Aniversários e pequenos grupos com reserva e clima de arcade.'],
  ['Co-op Night', 'Encontro de amigos ou família com comida, jogos e tempo para ficar.'],
  ['Boss Battle', 'Noites temáticas, campeonatos e ativações especiais sob consulta.']
];

const hours = [
  ['Ter–Qui', '18h–22h30'],
  ['Sex–Sáb', '18h–23h'],
  ['Dom', '18h–22h30'],
  ['Seg', 'Fechado']
];

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
                <a href="#top" className="flex items-center gap-3" aria-label="Vintage Arcade - início">
                  <div className="brand-chip">
                    <Image src="/images/vintage-arcade-logo.webp" alt="Vintage Arcade" width={90} height={90} className="h-12 w-12 object-contain md:h-14 md:w-14" priority />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.42em] text-vintageYellow md:text-[10px]">Vintage Arcade • Bebedouro</p>
                    <h1 className="mt-1 text-xl font-black uppercase tracking-[0.12em] md:text-3xl">Press Start</h1>
                  </div>
                </a>
                <nav className="flex flex-wrap items-center gap-2 md:justify-end">
                  {navItems.map((item) => (
                    <a key={item.label} href={item.href} className="nav-pill">{item.label}</a>
                  ))}
                </nav>
              </div>
            </header>

            <section id="top" className="cabinet-screen-wrap relative mx-auto max-w-5xl px-1 pb-2 md:px-7 md:pb-5">
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
                      <Image src="/images/vintage-arcade-logo.webp" alt="Logo Vintage Arcade" width={860} height={860} className="mx-auto h-auto w-full max-w-[390px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] md:max-w-[470px]" priority />
                    </div>

                    <h2 className="mt-6 max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.03em] md:text-6xl lg:text-7xl">
                      Comida. Games.<br />Nostalgia.
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-6 text-white/72 md:text-base md:leading-7">
                      Uma experiência arcade no coração de Bebedouro, com sandubas lendários, porções, drinks e diversão para todas as idades.
                    </p>

                    <div className="mt-7 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
                      <a href={`${WHATSAPP}?text=Oi%2C%20quero%20reservar%20uma%20mesa%20na%20Vintage%20Arcade.`} target="_blank" rel="noreferrer" className="retro-btn retro-btn-primary flex-1">Reservar mesa</a>
                      <a href={`${WHATSAPP}?text=Oi%2C%20quero%20ver%20o%20card%C3%A1pio%20da%20Vintage%20Arcade.`} target="_blank" rel="noreferrer" className="retro-btn retro-btn-secondary flex-1">Ver cardápio</a>
                    </div>

                    <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-2 md:gap-3">
                      {[
                        ['4,8★', 'Google'],
                        ['540+', 'Avaliações'],
                        ['2018', 'Desde']
                      ].map(([value, label]) => (
                        <div key={label} className="screen-stat"><strong>{value}</strong><span>{label}</span></div>
                      ))}
                    </div>
                  </div>

                  <div className="screen-statusbar">
                    <span>1UP</span><span className="animate-pulseSoft">READY PLAYER?</span><span>HI-SCORE</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="control-panel mx-auto max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#191a27,#08090f)] px-4 py-6 md:px-8 md:py-8" id="experiencia">
              <div className="flex items-center gap-4">
                <div className="joystick-base"><div className="joystick-stick" /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintageYellow">Control Panel</p>
                  <h3 className="mt-1 text-2xl font-black uppercase tracking-wide md:text-3xl">Escolha seu modo de jogo</h3>
                </div>
              </div>

              <div className="mt-6"><ArcadeModeSelector /></div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {experienceCards.map((card) => (
                  <article key={card.title} className="feature-card group">
                    <span>{card.eyebrow}</span><h4>{card.title}</h4><p>{card.text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]" id="cardapio">
                <div className="rounded-[1.8rem] border border-white/10 bg-black/25 p-5 md:p-6">
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintagePink">Select Menu</p>
                      <h4 className="mt-1 text-2xl font-black uppercase md:text-3xl">Game over na sua fome</h4>
                    </div>
                    <span className="hidden text-xs font-black uppercase tracking-[0.25em] text-white/35 md:block">4 categories</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {menuHighlights.map((item) => (
                      <article key={item.badge} className="menu-mode-card">
                        <span className="menu-mode-badge">{item.badge}</span>
                        <div><h5>{item.title}</h5><p>{item.text}</p></div>
                      </article>
                    ))}
                  </div>
                  <a href={`${WHATSAPP}?text=Oi%2C%20quero%20ver%20o%20card%C3%A1pio%20da%20Vintage%20Arcade.`} target="_blank" rel="noreferrer" className="retro-btn retro-btn-primary mt-5">Abrir cardápio / pedir</a>
                </div>

                <aside className="reference-card">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintagePink">Arcade DNA</p>
                    <h4 className="mt-1 text-xl font-black uppercase">O tema não fica só na decoração</h4>
                    <p className="mt-3 text-sm leading-6 text-white/68">A cultura gamer aparece no espaço, nas máquinas, no naming dos produtos e na maneira como a Vintage comunica a experiência.</p>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/35 p-3">
                    <Image src="/images/mk-arcade-reference.webp" alt="Referência de gabinete de arcade clássico" width={700} height={900} className="h-auto w-full rounded-xl object-cover" />
                  </div>
                </aside>
              </div>
            </section>

            <section className="coin-door mx-auto mt-4 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#0b0c14,#06070b)] px-4 py-8 md:px-8 md:py-10" id="eventos">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintageYellow">Insert Coin • Eventos</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-[0.95] md:text-4xl">Faça sua próxima comemoração virar uma fase especial.</h3>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/72 md:text-base">Aniversário, encontro de amigos ou uma noite temática: consulte formatos para grupos e reserve direto com a equipe.</p>
                  <a href={`${WHATSAPP}?text=Oi%2C%20quero%20informa%C3%A7%C3%B5es%20sobre%20eventos%20e%20anivers%C3%A1rios%20na%20Vintage%20Arcade.`} target="_blank" rel="noreferrer" className="retro-btn retro-btn-primary mt-6">Consultar evento</a>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {events.map(([title, text], index) => (
                    <article key={title} className="event-card">
                      <div className="event-card-level">LV.{index + 1}</div><h4>{title}</h4><p>{text}</p><span>SELECT →</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section id="visite" className="visit-panel mx-auto mt-4 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#151622,#090a10)] px-4 py-8 md:px-8 md:py-10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-vintagePink">Continue?</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-tight md:text-4xl">Sua próxima partida é em Bebedouro.</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 md:text-base">Rua Dr. Tobias Lima, 1320 — Centro, Bebedouro/SP. Telefone e WhatsApp: (17) 3340-2000.</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {hours.map(([day, time]) => (
                      <div key={day} className="hours-row"><span>{day}</span><strong>{time}</strong></div>
                    ))}
                  </div>
                </div>

                <div className="contact-console">
                  <div className="contact-console-screen">
                    <span>CHOOSE CHANNEL</span>
                    <strong>READY?</strong>
                  </div>
                  <a href={`${WHATSAPP}?text=Oi%2C%20vim%20pelo%20site%20da%20Vintage%20Arcade.`} target="_blank" rel="noreferrer" className="retro-btn retro-btn-primary w-full text-center">WhatsApp</a>
                  <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="retro-btn retro-btn-secondary w-full text-center">@vintagearcadeburger</a>
                  <a href="https://www.google.com/maps/search/?api=1&query=Vintage+Arcade+Rua+Dr+Tobias+Lima+1320+Bebedouro+SP" target="_blank" rel="noreferrer" className="retro-btn retro-btn-secondary w-full text-center">Como chegar</a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
