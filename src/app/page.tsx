import { Nav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { TrustBar } from '@/components/landing/trust-bar';
import { Features } from '@/components/landing/features';
import { Showcase } from '@/components/landing/showcase';
import { Testimonials } from '@/components/landing/testimonials';
import { PricingTeaser } from '@/components/landing/pricing-teaser';
import { Faq } from '@/components/landing/faq';
import { CtaFinal } from '@/components/landing/cta-final';
import { Footer } from '@/components/landing/footer';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://blooprint.fr';

/**
 * Landing page Blooprint — Server Component.
 * Composition des sections, aucun état client ici.
 */
export default function HomePage() {
  // Schema.org SoftwareApplication — US-1106 CA-3
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Blooprint',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: APP_URL,
    description: 'Builder de portfolios pour créateurs UGC. Drag & drop, templates, publication en 1 clic.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Nav />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <Features />
        <Showcase />
        <Testimonials />
        <PricingTeaser />
        <Faq />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  );
}

