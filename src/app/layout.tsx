import type { Metadata } from 'next';
import '@/styles/globals.css';
import { CookieConsent } from '@/components/rgpd/cookie-consent';

export const metadata: Metadata = {
  metadataBase: new URL('https://blooprint.fr'),
  title: {
    default: 'Portfolio Créateur UGC — Crée ton portfolio en 5 min | Blooprint',
    template: '%s | Blooprint',
  },
  description:
    'Crée ton portfolio UGC professionnel gratuitement. Builder drag & drop, templates prêts à l\'emploi, publie en 1 clic sur blooprint.fr/tonom.',
  keywords: [
    'portfolio UGC', 'créateur UGC', 'portfolio créateur contenu',
    'link in bio', 'builder portfolio', 'portfolio gratuit',
    'TikTok', 'Instagram', 'YouTube',
    'créer portfolio ugc', 'portfolio ugc en ligne',
    'exemple portfolio ugc', 'alternative linktree portfolio',
  ],
  alternates: { canonical: 'https://blooprint.fr' },
  openGraph: {
    title: 'Portfolio Créateur UGC — Crée ton portfolio en 5 min | Blooprint',
    description: 'Crée ton portfolio UGC professionnel gratuitement. Builder drag & drop, templates prêts à l\'emploi, publie en 1 clic.',
    url: 'https://blooprint.fr',
    siteName: 'Blooprint',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'Blooprint — Portfolio Builder pour créateurs UGC' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Créateur UGC — Crée ton portfolio en 5 min | Blooprint',
    description: 'Crée ton portfolio UGC professionnel gratuitement. Builder drag & drop, templates prêts à l\'emploi.',
    images: ['/images/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

