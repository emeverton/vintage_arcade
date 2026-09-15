import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vintage Arcade | Landing Page',
  description: 'LP interativa da Vintage Arcade inspirada em gabinete arcade clássico.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preload" as="image" href="/images/vintage-arcade-hero-9x16.webp" type="image/webp" media="(max-width: 767px)" />
        <link rel="preload" as="image" href="/images/vintage-arcade-hero-4x5.webp" type="image/webp" media="(min-width: 768px) and (max-width: 1023px)" />
        <link rel="preload" as="image" href="/images/vintage-arcade-hero-16x9.webp" type="image/webp" media="(min-width: 1024px)" />
      </head>
      <body>{children}</body>
    </html>
  );
}
