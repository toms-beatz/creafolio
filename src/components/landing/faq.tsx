'use client';

import { CoordLabel } from '@/components/ui/coord-label';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/motion';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';

const faqs = [
    {
        question: "Qu'est-ce qu'un portfolio UGC ?",
        answer:
            "Un portfolio UGC (User Generated Content) est un site web qui présente tes créations de contenu pour les marques. Il regroupe tes vidéos, tes statistiques, tes tarifs et tes liens sociaux en un seul endroit professionnel — idéal pour décrocher des collaborations.",
    },
    {
        question: 'Comment créer un portfolio de créateur UGC gratuitement ?',
        answer:
            "Avec Blooprint, tu crées ton portfolio UGC en 5 minutes grâce au builder drag & drop. Choisis un template, glisse tes blocs (vidéos, bio, tarifs, liens), et publie sur blooprint.fr/tonom. Le plan gratuit inclut 1 portfolio et 6 blocs — aucune carte bancaire requise.",
    },
    {
        question: 'Pourquoi un créateur UGC a besoin d\'un portfolio ?',
        answer:
            "Les marques reçoivent des centaines de candidatures. Un portfolio UGC professionnel te distingue : il montre tes meilleures créations, tes métriques et ton style. C'est ton CV visuel — un lien unique à mettre dans ta bio Instagram, TikTok ou YouTube.",
    },
    {
        question: 'Quelle est la différence entre un portfolio UGC et un link-in-bio ?',
        answer:
            "Un link-in-bio (comme Linktree) affiche une liste de liens. Un portfolio UGC comme Blooprint va plus loin : il présente tes vidéos, tes stats, tes tarifs et ta bio dans un design pro pensé pour convaincre les marques — pas juste rediriger vers tes réseaux.",
    },
    {
        question: 'Comment les marques trouvent-elles des créateurs UGC ?',
        answer:
            "Les marques cherchent des créateurs via les réseaux sociaux, les plateformes UGC et Google. Avoir un portfolio en ligne optimisé SEO (comme blooprint.fr/tonom) te rend visible même quand tu ne prospectes pas. Les marques cliquent, voient ton travail, et te contactent.",
    },
    {
        question: 'Blooprint est-il gratuit ?',
        answer:
            "Oui ! Le plan Free inclut 1 portfolio avec 6 blocs, un sous-domaine blooprint.fr/username et les analytics de base. Le plan Premium (11€/mois ou 79€/an) débloque plusieurs portfolios, des blocs illimités, les analytics avancées et les templates premium.",
    },
];

export function Faq() {
    return (
        <section id="faq" aria-labelledby="faq-heading" className="relative py-20 lg:py-28">
            {/* Cross-hatch background */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(45deg, #38bdf8 1px, transparent 1px), linear-gradient(-45deg, #38bdf8 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }}
                aria-hidden="true"
            />
            <div className="mx-auto max-w-3xl px-4 lg:px-8">
                <FadeIn className="mb-12 text-center">
                    <CoordLabel text="[FAQ // 00.07]" className="mb-4 block" />
                    <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Questions fréquentes sur les{' '}
                        <span className="text-sky-400">portfolios UGC</span>
                    </h2>
                </FadeIn>

                <Stagger className="space-y-3">
                    {faqs.map((faq, i) => (
                        <StaggerItem key={i}>
                            <Accordion type="single" collapsible>
                                <AccordionItem value={`faq-${i}`}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>

            {/* Schema.org FAQPage — US-1103 CA-3 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map((faq) => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.answer,
                            },
                        })),
                    }),
                }}
            />
        </section>
    );
}
