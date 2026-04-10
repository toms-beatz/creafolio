/**
 * Catalogue de templates UGC — sélectionnables à la création d'un portfolio.
 *
 * Chaque template = un craft_state Craft.js sérialisé pré-rempli.
 * Les IDs de nœuds sont préfixés tmpl_ pour éviter les collisions.
 */

/* ── Types ────────────────────────────────────────────────── */
export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  blocks: string[]; // noms des blocs inclus (pour affichage)
  premium: boolean;
  /** Thème suggéré pour ce template */
  defaultThemeId?: string;
  /** Niches cibles */
  niches: string[];
}

type CraftState = Record<string, unknown>;

/* ── Helper : nœud minimal ────────────────────────────────── */
function node(
  resolvedName: string,
  props: Record<string, unknown>,
  displayName: string,
): CraftState {
  return {
    type: { resolvedName },
    isCanvas: false,
    props,
    displayName,
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
  };
}

function rootNode(childIds: string[]): CraftState {
  return {
    type: "div",
    isCanvas: true,
    props: { className: "flex flex-col gap-2" },
    displayName: "Root",
    custom: {},
    hidden: false,
    nodes: childIds,
    linkedNodes: {},
  };
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE 1 — Beauty & Cosmétique
   Niches : Beauté, Skincare, Cosmétique, Make-up
   Structure : Hero → Stats → Avant/Après → Galerie → Témoignages → Contact → Footer
   ══════════════════════════════════════════════════════════════ */
function beautyTemplate(): CraftState {
  const ids = {
    hero: "tmpl_hero",
    stats: "tmpl_stats",
    ba: "tmpl_ba",
    gallery: "tmpl_gallery",
    testi: "tmpl_testi",
    contact: "tmpl_contact",
    footer: "tmpl_footer",
  };

  return {
    ROOT: rootNode(Object.values(ids)),
    [ids.hero]: node(
      "HeroBlock",
      {
        name: "Ton Prénom",
        title: "UGC Creator — Beauté & Skincare",
        description:
          "Je crée du contenu authentique pour les marques beauté, cosmétique et skincare. Résultats mesurables, esthétique soignée.",
        ctaLabel: "Voir mes résultats",
        ctaHref: "#gallery",
        imageUrl: "",
      },
      "Hero",
    ),
    [ids.stats]: node(
      "StatsBlock",
      {
        title: "Mes chiffres clés",
        stats: [
          { value: "80+", label: "Vidéos beauté livrées" },
          { value: "+34%", label: "Taux de conversion moyen" },
          { value: "25+", label: "Marques beauté" },
        ],
      },
      "Stats",
    ),
    [ids.ba]: node(
      "BeforeAfterBlock",
      {
        heading: "Transformation visible",
        beforeLabel: "Avant",
        afterLabel: "Après ma vidéo",
        beforeImage: "",
        afterImage: "",
        description:
          "Un contenu UGC skincare qui a généré +340% de conversions pour ma cliente.",
        metric: "+340% conversions",
      },
      "Avant/Après",
    ),
    [ids.gallery]: node(
      "GalleryBlock",
      {
        heading: "Mes projets beauté",
        items: [
          { caption: "Routine skincare AM" },
          { caption: "Review fond de teint" },
          { caption: "Unboxing coffret parfum" },
          { caption: "Tuto masque visage" },
          { caption: "Collab sérum anti-âge" },
          { caption: "Test rouge à lèvres" },
        ],
        columns: 2,
      },
      "Galerie",
    ),
    [ids.testi]: node(
      "TestimonialsBlock",
      {
        heading: "Ce que disent les marques",
        items: [
          {
            quote:
              "Contenu d'une qualité rare. Notre produit a trouvé son image grâce à sa créativité.",
            brand: "Sephora Collection",
            contact: "Céline R.",
            role: "Brand Manager",
          },
          {
            quote:
              "Campagne livrée en 48h, résultats au-delà de nos attentes sur TikTok.",
            brand: "NUXE",
            contact: "Alicia M.",
            role: "Responsable digital",
          },
        ],
      },
      "Témoignages",
    ),
    [ids.contact]: node(
      "ContactBlock",
      {
        heading: "Collaborons ensemble",
        description:
          "Tu cherches une créatrice beauté pour ta prochaine campagne ? Discutons-en.",
        email: "ton@email.com",
        ctaLabel: "Me contacter",
        socials: [],
      },
      "Contact",
    ),
    [ids.footer]: node(
      "FooterBlock",
      {
        copyright: `© ${new Date().getFullYear()} Mon Nom`,
        links: [],
        showWatermark: true,
      },
      "Footer",
    ),
  };
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE 2 — Lifestyle & Food
   Niches : Lifestyle, Food, Voyage, Bien-être
   Structure : Hero → Galerie(3col) → Marques → Stats → À propos → Contact → Footer
   ══════════════════════════════════════════════════════════════ */
function lifestyleTemplate(): CraftState {
  const ids = {
    hero: "tmpl_hero",
    gallery: "tmpl_gallery",
    brands: "tmpl_brands",
    stats: "tmpl_stats",
    about: "tmpl_about",
    contact: "tmpl_contact",
    footer: "tmpl_footer",
  };

  return {
    ROOT: rootNode(Object.values(ids)),
    [ids.hero]: node(
      "HeroBlock",
      {
        name: "Ton Prénom",
        title: "Lifestyle & Food Creator",
        description:
          "Contenu authentique et appétissant pour les marques food, lifestyle et voyage. Je fais briller vos produits au quotidien.",
        ctaLabel: "Découvrir mon univers",
        ctaHref: "#gallery",
        imageUrl: "",
      },
      "Hero",
    ),
    [ids.gallery]: node(
      "GalleryBlock",
      {
        heading: "Mon univers",
        items: [
          { caption: "Brunch parisien" },
          { caption: "Collab restaurant étoilé" },
          { caption: "Road trip Côte d'Azur" },
          { caption: "Recette healthy bowl" },
          { caption: "Dégustation fromages AOP" },
          { caption: "Séjour spa week-end" },
          { caption: "Marché fermier local" },
          { caption: "Café de spécialité" },
          { caption: "Atelier cuisine italienne" },
        ],
        columns: 3,
      },
      "Galerie",
    ),
    [ids.brands]: node(
      "BrandsBlock",
      {
        heading: "Ils m'ont fait confiance",
        items: [
          { name: "Deliveroo" },
          { name: "Nespresso" },
          { name: "Airbnb" },
          { name: "Le Creuset" },
          { name: "Yves Rocher" },
          { name: "Monoprix Bio" },
        ],
      },
      "Marques",
    ),
    [ids.stats]: node(
      "StatsBlock",
      {
        title: "En chiffres",
        stats: [
          { value: "120K", label: "Abonnés TikTok" },
          { value: "4.8%", label: "Taux d'engagement" },
          { value: "60+", label: "Collabs food & lifestyle" },
        ],
      },
      "Stats",
    ),
    [ids.about]: node(
      "AboutBlock",
      {
        heading: "Mon histoire",
        bio: "Passionnée de gastronomie et de voyages, je capture les émotions au quotidien. Mes contenus reflètent un art de vivre authentique qui résonne avec les communautés lifestyle.",
        niches: ["Food", "Lifestyle", "Voyage", "Bien-être"],
      },
      "À propos",
    ),
    [ids.contact]: node(
      "ContactBlock",
      {
        heading: "On fait équipe ?",
        description:
          "Restaurant, marque food ou destination touristique ? Je donne vie à ton univers.",
        email: "ton@email.com",
        ctaLabel: "Parlons de ton projet",
        socials: [],
      },
      "Contact",
    ),
    [ids.footer]: node(
      "FooterBlock",
      {
        copyright: `© ${new Date().getFullYear()} Mon Nom`,
        links: [],
        showWatermark: true,
      },
      "Footer",
    ),
  };
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE 3 — Tech & Gaming
   Niches : Tech, Gaming, Apps, Digital
   Structure : Hero → Vidéos → Stats → Galerie(2col) → Contact → Footer
   ══════════════════════════════════════════════════════════════ */
function techTemplate(): CraftState {
  const ids = {
    hero: "tmpl_hero",
    videos: "tmpl_videos",
    stats: "tmpl_stats",
    gallery: "tmpl_gallery",
    contact: "tmpl_contact",
    footer: "tmpl_footer",
  };

  return {
    ROOT: rootNode(Object.values(ids)),
    [ids.hero]: node(
      "HeroBlock",
      {
        name: "Ton Pseudo",
        title: "Tech & Gaming Creator",
        description:
          "Reviews honnêtes, tests gaming et contenu digital hautement engageant. Je transforme la complexité tech en contenu UGC accessible.",
        ctaLabel: "Voir mes vidéos",
        ctaHref: "#videos",
        imageUrl: "",
      },
      "Hero",
    ),
    [ids.videos]: node(
      "VideoShowcaseBlock",
      {
        heading: "Mes contenus",
        items: [
          {
            platform: "tiktok",
            url: "https://tiktok.com/@creator/video/123",
            title: "Review iPhone 16 en 60s",
          },
          {
            platform: "youtube",
            url: "https://youtube.com/watch?v=abc",
            title: "Unboxing PS5 Slim — vaut-il le prix ?",
          },
          {
            platform: "tiktok",
            url: "https://tiktok.com/@creator/video/456",
            title: "Top 5 apps productivité 2025",
          },
        ],
      },
      "Vidéos",
    ),
    [ids.stats]: node(
      "StatsBlock",
      {
        title: "Impact",
        stats: [
          { value: "2.4M", label: "Vues mensuelles" },
          { value: "87K", label: "Abonnés combinés" },
          { value: "40+", label: "Appareils testés" },
        ],
      },
      "Stats",
    ),
    [ids.gallery]: node(
      "GalleryBlock",
      {
        heading: "Projets récents",
        items: [
          { caption: "Collab Samsung Galaxy" },
          { caption: "Review casque Sony" },
          { caption: "Test setup gaming RGB" },
          { caption: "Unboxing drone DJI" },
        ],
        columns: 2,
      },
      "Galerie",
    ),
    [ids.contact]: node(
      "ContactBlock",
      {
        heading: "Travaillons ensemble",
        description:
          "Marque tech ou gaming à la recherche d'un créateur authentique ? Contacte-moi.",
        email: "ton@email.com",
        ctaLabel: "Collaborer",
        socials: [],
      },
      "Contact",
    ),
    [ids.footer]: node(
      "FooterBlock",
      {
        copyright: `© ${new Date().getFullYear()} Mon Pseudo`,
        links: [],
        showWatermark: true,
      },
      "Footer",
    ),
  };
}

/* ── Legacy templates (kept for backwards-compat) ─────────── */
function classicTemplate(): CraftState {
  const ids = {
    hero: "tmpl_hero",
    about: "tmpl_about",
    stats: "tmpl_stats",
    gallery: "tmpl_gallery",
    contact: "tmpl_contact",
    footer: "tmpl_footer",
  };
  return {
    ROOT: rootNode(Object.values(ids)),
    [ids.hero]: node(
      "HeroBlock",
      {
        name: "Ton Nom",
        title: "Créateur·rice UGC",
        description:
          "Je crée du contenu authentique pour des marques ambitieuses.",
        ctaLabel: "Voir mes projets",
        ctaHref: "#gallery",
        imageUrl: "",
      },
      "Hero",
    ),
    [ids.about]: node(
      "AboutBlock",
      {
        heading: "À propos",
        bio: "Créateur·rice UGC passionné·e.",
        niches: ["Beauté", "Lifestyle"],
      },
      "À propos",
    ),
    [ids.stats]: node(
      "StatsBlock",
      {
        title: "Mes chiffres",
        stats: [
          { value: "50+", label: "Projets UGC" },
          { value: "2M+", label: "Vues générées" },
        ],
      },
      "Stats",
    ),
    [ids.gallery]: node(
      "GalleryBlock",
      {
        heading: "Mes projets",
        items: [
          { caption: "Projet 1" },
          { caption: "Projet 2" },
          { caption: "Projet 3" },
        ],
        columns: 3,
      },
      "Galerie",
    ),
    [ids.contact]: node(
      "ContactBlock",
      {
        heading: "Travaillons ensemble",
        description: "Contacte-moi.",
        email: "ton@email.com",
        ctaLabel: "Envoie-moi un message",
        socials: [],
      },
      "Contact",
    ),
    [ids.footer]: node(
      "FooterBlock",
      {
        copyright: `© ${new Date().getFullYear()} Mon Nom`,
        links: [],
        showWatermark: true,
      },
      "Footer",
    ),
  };
}

function minimalTemplate(): CraftState {
  const ids = {
    hero: "tmpl_hero",
    gallery: "tmpl_gallery",
    contact: "tmpl_contact",
    footer: "tmpl_footer",
  };
  return {
    ROOT: rootNode(Object.values(ids)),
    [ids.hero]: node(
      "HeroBlock",
      {
        name: "Ton Nom",
        title: "UGC Creator",
        description: "Contenu vidéo authentique.",
        ctaLabel: "Contact",
        ctaHref: "#contact",
        imageUrl: "",
      },
      "Hero",
    ),
    [ids.gallery]: node(
      "GalleryBlock",
      {
        heading: "Portfolio",
        items: [{ caption: "Projet 1" }, { caption: "Projet 2" }],
        columns: 2,
      },
      "Galerie",
    ),
    [ids.contact]: node(
      "ContactBlock",
      {
        heading: "Contact",
        description: "Disponible pour collaborations.",
        email: "ton@email.com",
        ctaLabel: "Écrire",
        socials: [],
      },
      "Contact",
    ),
    [ids.footer]: node(
      "FooterBlock",
      {
        copyright: `© ${new Date().getFullYear()}`,
        links: [],
        showWatermark: true,
      },
      "Footer",
    ),
  };
}

/* ── Catalogue visible ────────────────────────────────────── */
export const TEMPLATES: TemplateInfo[] = [
  {
    id: "beauty",
    name: "Beauty & Cosmétique",
    description:
      "Pour créateurs beauté : transformation avant/après, galerie produits, témoignages marques.",
    icon: "circle",
    blocks: [
      "Hero",
      "Stats",
      "Avant/Après",
      "Galerie",
      "Témoignages",
      "Contact",
    ],
    premium: false,
    defaultThemeId: "pastel",
    niches: ["Beauté", "Skincare", "Cosmétique", "Make-up"],
  },
  {
    id: "lifestyle",
    name: "Lifestyle & Food",
    description:
      "Pour créateurs food et lifestyle : galerie impact, marques partenaires, histoire personnelle.",
    icon: "layers",
    blocks: ["Hero", "Galerie", "Marques", "Stats", "À propos", "Contact"],
    premium: false,
    defaultThemeId: "retro",
    niches: ["Lifestyle", "Food", "Voyage", "Bien-être"],
  },
  {
    id: "tech",
    name: "Tech & Gaming",
    description:
      "Pour créateurs tech : vidéos en avant, chiffres clés, galerie produits tech.",
    icon: "diamond",
    blocks: ["Hero", "Vidéos", "Stats", "Galerie", "Contact"],
    premium: false,
    defaultThemeId: "neon",
    niches: ["Tech", "Gaming", "Apps", "Digital"],
  },
];

const TEMPLATE_GENERATORS: Record<string, () => CraftState> = {
  beauty: beautyTemplate,
  lifestyle: lifestyleTemplate,
  tech: techTemplate,
  // Legacy
  classic: classicTemplate,
  minimal: minimalTemplate,
};

/**
 * Génère le craft_state pour un template donné.
 * Fallback sur "beauty" si l'ID est invalide.
 */
export function generateTemplate(templateId: string): CraftState {
  const generator =
    TEMPLATE_GENERATORS[templateId] ?? TEMPLATE_GENERATORS.beauty;
  return generator();
}
