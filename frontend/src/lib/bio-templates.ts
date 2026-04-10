/**
 * Templates de bio statiques par niche — fallback quand OpenAI n'est pas configuré.
 * US-1507
 */

export const BIO_TEMPLATES: Record<string, string> = {
  Beauté:
    "Je crée des contenus beauté authentiques qui convertissent. Mes vidéos mettent en valeur les produits que j'aime avec une touche naturelle et engageante.",
  Mode: "Passionnée de mode, je produis des contenus visuels impactants qui font vendre. Mon style unique attire une audience fidèle de fashionistas.",
  Food: "Je transforme chaque plat en histoire visuelle. Mes contenus food génèrent de l'envie et poussent à l'achat de manière naturelle et authentique.",
  Voyage:
    "Je documente mes aventures avec un regard artistique. Mes contenus voyage inspirent et donnent envie de partir — idéal pour les marques de tourisme.",
  Tech: "Je simplifie la tech pour tout le monde. Mes reviews honnêtes et mes tutoriels clairs aident les marques à atteindre une audience curieuse et acheteure.",
  Gaming:
    "Créateur gaming passionné, je produis des contenus immersifs qui engagent une communauté de joueurs actifs et influençables dans leurs achats.",
  Sport:
    "Je combine performance et authenticité dans mes contenus fitness. Mon audience cherche l'inspiration et fait confiance à mes recommandations de produits.",
  Maison:
    "Je transforme les espaces en sources d'inspiration. Mes contenus home & déco attirent une audience qui aime investir dans son intérieur.",
  Lifestyle:
    "Je partage un style de vie aspirationnel avec naturel. Mes contenus lifestyle touchent une audience diverse et engagée, parfaite pour les collaborations de marque.",
  Autre:
    "Je crée du contenu authentique qui génère de l'engagement et de la confiance. Ma communauté est attentive à mes recommandations et influence ses décisions d'achat.",
};

export function getBioTemplate(niche: string): string {
  return BIO_TEMPLATES[niche] ?? BIO_TEMPLATES["Autre"];
}
