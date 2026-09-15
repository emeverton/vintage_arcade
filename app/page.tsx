import VintageArcadeCabinet from './components/VintageArcadeCabinet';
import { WHATSAPP } from './lib/catalog';

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
      <div className="page-atmosphere" aria-hidden="true">
        <div className="absolute inset-0 bg-grid bg-[size:40px_40px] opacity-25" />
        <div className="page-atmosphere-glow" />
      </div>

      <div className="relative z-10 px-3 pb-16 pt-4 md:px-6 md:pt-8">
        <VintageArcadeCabinet />

        <div className="mx-auto mt-12 max-w-5xl md:mt-16">
          <section id="experiencia" className="content-section">
            <p className="section-kicker">Experiência</p>
            <h3 className="section-title">Uma refeição que vira partida</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {experienceCards.map((card) => (
                <article key={card.title} className="feature-card group">
                  <span>{card.eyebrow}</span>
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="cardapio" className="content-section mt-12 md:mt-16">
            <p className="section-kicker">Cardápio</p>
            <h3 className="section-title">Game over na sua fome</h3>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {menuHighlights.map((item) => (
                <article key={item.badge} className="menu-mode-card">
                  <span className="menu-mode-badge">{item.badge}</span>
                  <div>
                    <h5>{item.title}</h5>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <a
              href={`${WHATSAPP}?text=Oi%2C%20quero%20ver%20o%20card%C3%A1pio%20da%20Vintage%20Arcade.`}
              target="_blank"
              rel="noreferrer"
              className="retro-btn retro-btn-primary mt-6"
            >
              Abrir cardápio / pedir
            </a>
          </section>

          <section id="eventos" className="content-section mt-12 md:mt-16">
            <p className="section-kicker">Eventos</p>
            <h3 className="section-title">Desbloqueie uma fase especial</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
              Aniversário, encontro de amigos ou noite temática: consulte formatos e reserve direto com a equipe.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {events.map(([title, text], index) => (
                <article key={title} className="event-card">
                  <div className="event-card-level">LV.{index + 1}</div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <a
              href={`${WHATSAPP}?text=Oi%2C%20quero%20informa%C3%A7%C3%B5es%20sobre%20eventos%20e%20anivers%C3%A1rios%20na%20Vintage%20Arcade.`}
              target="_blank"
              rel="noreferrer"
              className="retro-btn retro-btn-primary mt-6"
            >
              Consultar evento
            </a>
          </section>

          <section id="visite" className="content-section mt-12 md:mt-16">
            <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,#151622,#090a10)] p-6 md:p-8">
              <p className="section-kicker text-vintagePink">Visite</p>
              <h3 className="section-title">Sua próxima partida é em Bebedouro</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                Rua Dr. Tobias Lima, 1320 — Centro, Bebedouro/SP. Telefone e WhatsApp: (17) 3340-2000.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {hours.map(([day, time]) => (
                  <div key={day} className="hours-row">
                    <span>{day}</span>
                    <strong>{time}</strong>
                  </div>
                ))}
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Vintage+Arcade+Rua+Dr+Tobias+Lima+1320+Bebedouro+SP"
                target="_blank"
                rel="noreferrer"
                className="retro-btn retro-btn-secondary mt-6"
              >
                Como chegar
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
