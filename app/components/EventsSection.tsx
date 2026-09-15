import { WHATSAPP } from '../lib/site';

export default function EventsSection() {
  const items = [
    ['Arcade Party', 'Aniversários e grupos com reserva e clima de arcade.'],
    ['Co-op Night', 'Encontro de amigos ou família com comida e games.'],
    ['Boss Battle', 'Noites temáticas e ativações especiais sob consulta.']
  ];

  return (
    <section id="eventos" className="va-section">
      <p className="va-kicker">03 · Eventos</p>
      <h3>Desbloqueie uma fase especial</h3>
      <div className="va-grid-3">
        {items.map(([title, text]) => (
          <article key={title} className="va-card">
            <h4>{title}</h4>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <a
        href={`${WHATSAPP}?text=${encodeURIComponent('Oi, quero informações sobre eventos e aniversários na Vintage Arcade.')}`}
        target="_blank"
        rel="noreferrer"
        className="va-btn va-btn-primary mt-6"
      >
        Consultar evento
      </a>
    </section>
  );
}
