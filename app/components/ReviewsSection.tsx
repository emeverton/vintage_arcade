export default function ReviewsSection() {
  const stats = [
    ['4,8★', 'Google'],
    ['540+', 'Avaliações'],
    ['2018', 'Desde']
  ];

  return (
    <section id="reviews" className="va-section">
      <p className="va-kicker">04 · Prova social</p>
      <h3>A comunidade já deu continue</h3>
      <div className="va-stats">
        {stats.map(([value, label]) => (
          <div key={label} className="va-stat">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
