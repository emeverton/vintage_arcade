import { INSTAGRAM, WHATSAPP } from '../lib/site';

export default function CabinetFooter() {
  return (
    <footer className="va-lower">
      <div className="va-coin-row" aria-hidden="true">
        <span className="va-coin" />
        <p>INSERT COIN</p>
        <span className="va-coin" />
      </div>
      <p className="va-address">
        Rua Dr. Tobias Lima, 1320
        <br />
        Centro — Bebedouro/SP
      </p>
      <a
        href={`${WHATSAPP}?text=${encodeURIComponent('Oi, quero reservar uma mesa na Vintage Arcade.')}`}
        target="_blank"
        rel="noreferrer"
        className="va-btn va-btn-primary"
      >
        Reservar mesa
      </a>
      <div className="va-social">
        <a href={`${WHATSAPP}?text=${encodeURIComponent('Oi, vim pelo site da Vintage Arcade.')}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer">
          Instagram
        </a>
      </div>
    </footer>
  );
}
