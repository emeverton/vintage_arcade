import { Outfit, Press_Start_2P } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-arcade',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Vintage Arcade | Bebedouro',
  description: 'Food + Games + Nostalgia. Sandubas, drinks e fliperama em Bebedouro/SP.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${pressStart.variable}`}>
      <head>
        <link rel="preload" as="image" href="/images/vintage-arcade-logo.webp" type="image/webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
