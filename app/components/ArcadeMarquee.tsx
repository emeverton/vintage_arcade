import Image from 'next/image';

const NAV = [
  { label: 'CARDÁPIO', href: '#cardapio' },
  { label: 'EXPERIÊNCIA', href: '#experiencia' },
  { label: 'EVENTOS', href: '#eventos' },
  { label: 'VISITE', href: '#visite' }
];

export default function ArcadeMarquee() {
  return (
    <header className="va-marquee">
      <div className="va-marquee-light" aria-hidden="true" />
      <div className="va-marquee-glass" aria-hidden="true" />
      <div className="va-marquee-row">
        <a href="#cabinet" className="va-marquee-brand" aria-label="Vintage Arcade">
          <Image
            src="/images/vintage-arcade-logo.webp"
            alt="Vintage Arcade"
            width={160}
            height={160}
            className="va-marquee-logo"
            priority
          />
        </a>
        <nav className="va-marquee-nav" aria-label="Navegação">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
