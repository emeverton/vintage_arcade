import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vintage Arcade | Bebedouro',
  description:
    'Food, games e nostalgia em Bebedouro. Peça pelo WhatsApp ou visite o salão arcade da Vintage.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
