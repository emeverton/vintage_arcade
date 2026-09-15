export default function ExperienceSection() {
  const cards = [
    {
      title: 'Food + Games + Nostalgia',
      text: 'Burger, porções, drinks e arcades em um ambiente feito para transformar uma refeição em experiência.'
    },
    {
      title: 'Para todas as gerações',
      text: 'Clássicos e games atuais no mesmo lugar — amigos, casais e famílias.'
    },
    {
      title: 'Destino em Bebedouro',
      text: 'Mais do que uma hamburgueria: um ponto de encontro com identidade própria.'
    }
  ];

  return (
    <section id="experiencia" className="va-section">
      <p className="va-kicker">01 · Experiência</p>
      <h3>Food + Games + Nostalgia</h3>
      <div className="va-grid-3">
        {cards.map((card) => (
          <article key={card.title} className="va-card">
            <h4>{card.title}</h4>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
