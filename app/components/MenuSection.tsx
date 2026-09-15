import { WHATSAPP } from '../lib/site';

export default function MenuSection() {
  const items = [
    ['Sandubas lendários', 'Burgers com naming e personalidade do universo gamer.'],
    ['Porções', 'Para compartilhar e completar a partida no salão.'],
    ['Drinks & bebidas', 'Opções para acompanhar burgers, jogos e encontros.'],
    ['Delivery & retirada', 'Peça fora do salão pelo canal direto da Vintage.']
  ];

  return (
    <section id="cardapio" className="va-section">
      <p className="va-kicker">02 · Cardápio</p>
      <h3>Destaques da casa</h3>
      <div className="va-grid-2">
        {items.map(([title, text]) => (
          <article key={title} className="va-card">
            <h4>{title}</h4>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <a
        href={`${WHATSAPP}?text=${encodeURIComponent('Oi, quero ver o cardápio da Vintage Arcade.')}`}
        target="_blank"
        rel="noreferrer"
        className="va-btn va-btn-primary mt-6"
      >
        Abrir cardápio
      </a>
    </section>
  );
}
