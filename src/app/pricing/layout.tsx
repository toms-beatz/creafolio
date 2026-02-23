import type { Metadata } from 'next';
import { Nav } from '@/components/landing/nav';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
    title: 'Pricing — Plans Free & Premium',
    description: 'Blooprint Free pour démarrer, Premium à 11€/mois ou 79€/an pour les créateurs UGC ambitieux. 7 jours d\'essai gratuit, sans CB.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Nav />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
