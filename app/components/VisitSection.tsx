import { HOURS, INSTAGRAM, MAPS, WHATSAPP } from '../lib/site';

export default function VisitSection() {
  return (
    <section id="visite" className="va-section">
      <p className="va-kicker">05 · Visite</p>
      <h3>Sua próxima partida é em Bebedouro</h3>
      <p className="va-lead">
        Rua Dr. Tobias Lima, 1320 — Centro, Bebedouro/SP.
        <br />
        Telefone e WhatsApp: (17) 3340-2000.
      </p>

      <div className="va-hours">
        {HOURS.map(([day, time]) => (
          <div key={day}>
            <span>{day}</span>
            <strong>{time}</strong>
          </div>
        ))}
      </div>

      <div className="va-visit-actions">
        <a
          href={`${WHATSAPP}?text=${encodeURIComponent('Oi, vim pelo site da Vintage Arcade.')}`}
          target="_blank"
          rel="noreferrer"
          className="va-btn va-btn-primary"
        >
          WhatsApp
        </a>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="va-btn va-btn-ghost">
          Instagram
        </a>
        <a href={MAPS} target="_blank" rel="noreferrer" className="va-btn va-btn-ghost">
          Como chegar
        </a>
      </div>
    </section>
  );
}
