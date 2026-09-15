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
        <link rel="preload" as="image" href="/images/vintage-arcade-logo.webp" type="image/webp" />
      </head>
      <body>{children}</body>
    </html>
  );
}
