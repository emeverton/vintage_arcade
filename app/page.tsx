import Image from 'next/image';

const navItems = [
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Cardápio', href: '#cardapio' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Contato', href: '#contato' }
];

const featureCards = [
  ['Food + Games + Nostalgia', 'A proposta não é só comer. É transformar jantar em experiência, com ambiente imersivo, arcade e identidade geek.'],
  ['Destino social de Bebedouro', 'Casal, família, turma de amigos e aniversário. A Vintage funciona melhor como destination brand do que como hamburgueria comum.'],
  ['Conteúdo naturalmente forte', 'O espaço, o branding e o tema geram criativos fortes para social, mídia paga e campanhas sazonais.']
];

const modes = [
  ['Player 1 — Date / casal', 'Clima retrô, lanche premium e atmosfera visual forte.'],
  ['Co-op — Família', 'Comida + diversão + memória afetiva para adultos e crianças.'],
  ['Versus — Grupo / amigos', 'Combos compartilháveis, disputas de arcade e alta recorrência.'],
  ['Continue? — Delivery', 'Capturar o desejo fora do salão sem depender apenas de agregadores.']
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-cabinetBlack text-white">
      <div className="pointer-events-none fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid bg-[size:30px_30px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,70,200,0.28),transparent_35%),radial-gradient(circle_at_bottom,rgba(255,79,163,0.14),transparent_30%)]" />
      </div>

      <section className="relative px-4 py-8 md:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="arcade-shell mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#141524_0%,#0a0a12_100%)] p-3 shadow-glow md:p-5">
            <header className="marquee-panel relative mx-auto mb-4 max-w-5xl overflow-hidden rounded-[1.8rem_1.8rem_1rem_1rem] border border-vintageYellow/30 bg-[linear-gradient(90deg,#1836a8_0%,#1E46C8_35%,#ff4fa3_100%)] bg-[length:200%_200%] px-4 py-4 shadow-neon animate-marquee md:px-8 md:py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-vintageYellow md:text-xs">Vintage Arcade • Bebedouro</p>
                  <h1 className="mt-1 text-2xl font-black uppercase tracking-wide md:text-4xl">Press Start</h1>
                </div>
                <nav className="flex flex-wrap items-center gap-2 md:justify-end">
                  {navItems.map((item) => (
                    <a key={item.label} href={item.href} className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition hover:border-vintageYellow hover:text-vintageYellow">
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </header>

            <div className="cabinet-screen-wrap relative mx-auto max-w-5xl px-2 pb-3 md:px-8 md:pb-6">
              <div className="screen-bezel rounded-[2rem_2rem_1rem_1rem] border border-white/10 bg-black p-3 md:p-5">
                <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(33,70,190,0.35),rgba(7,10,25,0.92)_65%)] p-6 shadow-screen md:p-10">
                  <div className="absolute inset-0 bg-scanlines bg-[size:100%_8px] opacity-20" />
                  <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <div>
                      <p className="mb-3 inline-flex rounded-full border border-vintageYellow/40 bg-vintageYellow/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-vintageYellow md:text-xs">Food + Games + Nostalgia</p>
                      <h2 className="max-w-2xl text-4xl font-black uppercase leading-[0.92] tracking-tight md:text-6xl">O fliperama vira a interface da experiência.</h2>
                      <p className="mt-5 max-w-2xl text-sm leading-6 text-white/78 md:text-base">A cabeça do gabinete funciona como navegação, a tela vira a hero e o painel de controle organiza experiências, produtos e chamadas para ação.</p>
                      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <a href="#contato" className="retro-btn retro-btn-primary">Reservar agora</a>
                        <a href="#cardapio" className="retro-btn retro-btn-secondary">Ver cardápio</a>
                      </div>
                    </div>

                    <div className="relative mx-auto max-w-[420px] animate-float">
                      <div className="rounded-[2rem] border border-white/12 bg-black/25 p-5 backdrop-blur-md">
                        <Image src="/images/vintage-arcade-logo.webp" alt="Vintage Arcade" width={700} height={700} className="mx-auto h-auto w-full max-w-[340px] object-contain" priority />
                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.14em] text-white/70">
                          {['KV central da marca', 'Pixel + neon + retrô', 'Produto memorável', 'Destino local'].map((item) => (
                            <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">{item}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="control-panel mx-auto max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#181a2b,#090a10)] px-4 py-6 md:px-8 md:py-8" id="experiencia">
              <div className="flex flex-wrap items-center gap-4">
                <div className="joystick-base"><div className="joystick-stick" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-vintageYellow">Control Panel</p>
                  <h3 className="text-2xl font-black uppercase tracking-wide">Uma LP que se comporta como a marca</h3>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {featureCards.map(([title, text]) => (
                  <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h4 className="text-lg font-black uppercase leading-tight text-vintageYellow">{title}</h4>
                    <p className="mt-3 text-sm leading-6 text-white/72">{text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]" id="cardapio">
                <div className="grid gap-4 md:grid-cols-2">
                  {modes.map(([title, text]) => (
                    <article key={title} className="rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:-translate-y-1 hover:border-vintageYellow/40">
                      <h4 className="text-base font-black uppercase">{title}</h4>
                      <p className="mt-3 text-sm leading-6 text-white/68">{text}</p>
                    </article>
                  ))}
                </div>

                <aside className="rounded-[1.75rem] border border-vintagePink/20 bg-[linear-gradient(180deg,rgba(255,79,163,0.12),rgba(30,70,200,0.08))] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-vintagePink">Cabinet Reference</p>
                  <h4 className="mt-2 text-xl font-black uppercase">Midway Mortal Kombat II</h4>
                  <p className="mt-3 text-sm leading-6 text-white/72">A referência guia proporção, verticalidade, moldura, presença de palco e leitura visual.</p>
                  <Image src="/images/mk-arcade-reference.webp" alt="Mortal Kombat II arcade cabinet" width={700} height={900} className="mt-5 h-auto w-full rounded-2xl border border-white/10 object-cover" />
                </aside>
              </div>
            </div>

            <div className="coin-door mx-auto mt-4 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#0b0c14,#07070b)] px-4 py-8 md:px-8 md:py-10" id="eventos">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-vintageYellow">Coin Door • Monetização</p>
              <h3 className="mt-2 text-3xl font-black uppercase leading-tight">Receita não vem só do lanche.</h3>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/75 md:text-base">A LP já nasce preparada para empurrar quatro frentes: salão, delivery/retirada, reservas e eventos/aniversários.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['AOV alvo', 'R$58–62'],
                  ['Clientes/dia M6', '≈ 96'],
                  ['Marketing M6', 'R$8 mil'],
                  ['Meta eventos', 'R$15 mil/mês']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/55">{label}</div>
                    <div className="mt-2 text-2xl font-black text-vintageYellow">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <footer id="contato" className="mx-auto mt-4 max-w-5xl rounded-[1rem_1rem_2rem_2rem] border border-white/10 bg-[linear-gradient(180deg,#141524,#0a0a12)] px-4 py-8 md:px-8 md:py-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-vintagePink">Game Over? Não. Continue.</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-tight">Pronto para transformar a LP em canal de receita?</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">Na próxima iteração entram links reais, prova social, cardápio, WhatsApp, tracking e CRM.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <a href="#" className="retro-btn retro-btn-primary min-w-[220px] text-center">Falar no WhatsApp</a>
                  <a href="#" className="retro-btn retro-btn-secondary min-w-[220px] text-center">Ver Instagram</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}
