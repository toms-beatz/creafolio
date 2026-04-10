import type { Metadata } from 'next';
import { Habibi } from 'next/font/google';
import '@/styles/globals.css';
import { CookieConsent } from '@/components/rgpd/cookie-consent';

const habibi = Habibi({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-habibi',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://creafolio.fr'),
  title: {
    default: 'Portfolio Créateur UGC — Crée ton portfolio en 5 min | Creafolio',
    template: '%s | Creafolio',
  },
  description:
    "Crée ton portfolio UGC professionnel gratuitement. Builder drag & drop, templates prêts à l'emploi, publie en 1 clic sur creafolio.fr/tonnom.",
  keywords: [
    'portfolio UGC', 'créateur UGC', 'portfolio créateur contenu',
    'link in bio', 'builder portfolio', 'portfolio gratuit',
    'TikTok', 'Instagram', 'YouTube',
    'créer portfolio ugc', 'portfolio ugc en ligne',
    'exemple portfolio ugc', 'alternative linktree portfolio',
  ],
  alternates: { canonical: 'https://creafolio.fr' },
  openGraph: {
    title: 'Portfolio Créateur UGC — Crée ton portfolio en 5 min | Creafolio',
    description: "Crée ton portfolio UGC professionnel gratuitement. Builder drag & drop, templates prêts à l'emploi, publie en 1 clic.",
    url: 'https://creafolio.fr',
    siteName: 'Creafolio',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'Creafolio — Portfolio Builder pour créateurs UGC' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Créateur UGC — Crée ton portfolio en 5 min | Creafolio',
    description: "Crée ton portfolio UGC professionnel gratuitement. Builder drag & drop, templates prêts à l'emploi.",
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
    <html lang="fr" className={habibi.variable}>
      <body className="bg-[#f4eeea] text-[#1a1a1a] antialiased">
        {/* Skip to main content — a11y */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:rounded-lg focus:bg-[#ad7b60] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-[#d4a485]"
        >
          Aller au contenu principal
        </a>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
