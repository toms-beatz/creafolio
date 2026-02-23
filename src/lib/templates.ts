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
    props: { className: "flex flex-col gap-2 p-4 max-w-2xl mx-auto" },
    displayName: "Root",
    custom: {},
    hidden: false,
    nodes: childIds,
    linkedNodes: {},
  };
}

/* ══════════════════════════════════════════════════════════════
   TEMPLATE 1 — UGC Classique (6 blocs)
   ══════════════════════════════════════════════════════════════ */
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
          "Je crée du contenu authentique pour des marques ambitieuses. TikTok · Instagram · YouTube.",
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
        bio: "Créateur·rice UGC passionné·e, je collabore avec des marques pour créer du contenu vidéo authentique qui convertit.",
        niches: ["Beauté", "Lifestyle", "Food", "Tech"],
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
          { value: "30+", label: "Marques" },
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
        description:
          "Tu cherches un créateur UGC pour ta prochaine campagne ? Écris-moi.",
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

/* ══════════════════════════════════════════════════════════════
   TEMPLATE 2 — Portfolio Complet (9 blocs)
   ══════════════════════════════════════════════════════════════ */
function fullTemplate(): CraftState {
  const ids = {
    hero: "tmpl_hero",
    about: "tmpl_about",
    stats: "tmpl_stats",
    beforeAfter: "tmpl_ba",
    gallery: "tmpl_gallery",
    videos: "tmpl_videos",
    testimonials: "tmpl_testi",
    brands: "tmpl_brands",
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
          "Contenu authentique qui convertit. Spécialisé·e beauté, lifestyle et food.",
        ctaLabel: "Découvrir mon travail",
        ctaHref: "#gallery",
        imageUrl: "",
      },
      "Hero",
    ),
    [ids.about]: node(
      "AboutBlock",
      {
        heading: "À propos",
        bio: "Passionné·e par la création de contenu, je transforme les produits en histoires visuelles engageantes sur TikTok, Instagram et YouTube.",
        niches: ["Beauté", "Lifestyle", "Food", "Mode"],
      },
      "À propos",
    ),
    [ids.stats]: node(
      "StatsBlock",
      {
        title: "En quelques chiffres",
        stats: [
          { value: "100+", label: "Vidéos livrées" },
          { value: "5M+", label: "Vues totales" },
          { value: "50+", label: "Marques partenaires" },
        ],
      },
      "Stats",
    ),
    [ids.beforeAfter]: node(
      "BeforeAfterBlock",
      {
        heading: "Résultats concrets",
        beforeLabel: "Avant",
        afterLabel: "Après ma vidéo",
        beforeImage: "",
        afterImage: "",
        description: "Une vidéo UGC qui a boosté les conversions de +340%.",
        metric: "+340%",
      },
      "Before/After",
    ),
    [ids.gallery]: node(
      "GalleryBlock",
      {
        heading: "Mes créations",
        items: [
          { caption: "Campagne Beauté" },
          { caption: "Collab Lifestyle" },
          { caption: "Vidéo Food" },
          { caption: "Unboxing Tech" },
          { caption: "Story Mode" },
          { caption: "Review Produit" },
        ],
        columns: 3,
      },
      "Galerie",
    ),
    [ids.videos]: node(
      "VideoShowcaseBlock",
      {
        heading: "Mes vidéos",
        items: [
          {
            platform: "tiktok",
            url: "https://tiktok.com/@creator/video/123",
            title: "Vidéo UGC Beauty",
          },
          {
            platform: "youtube",
            url: "https://youtube.com/watch?v=abc",
            title: "Collab marque X",
          },
        ],
      },
      "Vidéos",
    ),
    [ids.testimonials]: node(
      "TestimonialsBlock",
      {
        heading: "Ce qu'ils disent",
        items: [
          {
            quote:
              "Excellente collaboration, contenu livré en avance et au-delà de nos attentes.",
            brand: "Marque A",
            contact: "Marie D.",
            role: "Brand Manager",
          },
          {
            quote:
              "ROI incroyable sur notre campagne TikTok grâce à son contenu authentique.",
            brand: "Marque B",
            contact: "Thomas L.",
            role: "CMO",
          },
        ],
      },
      "Témoignages",
    ),
    [ids.brands]: node(
      "BrandsBlock",
      {
        heading: "Ils m'ont fait confiance",
        items: [
          { name: "Nike" },
          { name: "L'Oréal" },
          { name: "Samsung" },
          { name: "Sephora" },
          { name: "Adidas" },
          { name: "Netflix" },
        ],
      },
      "Marques",
    ),
    [ids.contact]: node(
      "ContactBlock",
      {
        heading: "On collabore ?",
        description:
          "Envie de booster ta prochaine campagne avec du contenu UGC authentique ? Contacte-moi.",
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
   TEMPLATE 3 — Minimaliste (4 blocs)
   ══════════════════════════════════════════════════════════════ */
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
        description: "Contenu vidéo authentique pour marques ambitieuses.",
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
        items: [
          { caption: "Projet 1" },
          { caption: "Projet 2" },
          { caption: "Projet 3" },
          { caption: "Projet 4" },
        ],
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

/* ══════════════════════════════════════════════════════════════
   TEMPLATE 4 — Vide (canvas libre)
   ══════════════════════════════════════════════════════════════ */
function blankTemplate(): CraftState {
  return {
    ROOT: rootNode([]),
  };
}

/* ── Catalogue ────────────────────────────────────────────── */
export const TEMPLATES: TemplateInfo[] = [
  {
    id: "classic",
    name: "UGC Classique",
    description:
      "Le template idéal pour démarrer. Hero, à propos, stats, galerie, contact et footer.",
    icon: "diamond",
    blocks: ["Hero", "À propos", "Stats", "Galerie", "Contact", "Footer"],
    premium: false,
  },
  {
    id: "full",
    name: "Portfolio Complet",
    description:
      "Tout inclus : vidéos, témoignages, marques, before/after. Impressionne tes clients.",
    icon: "layers",
    blocks: [
      "Hero",
      "À propos",
      "Stats",
      "Before/After",
      "Galerie",
      "Vidéos",
      "Témoignages",
      "Marques",
      "Contact",
      "Footer",
    ],
    premium: false,
  },
  {
    id: "minimal",
    name: "Minimaliste",
    description: "Droit au but. Une galerie et un contact, rien de plus.",
    icon: "circle",
    blocks: ["Hero", "Galerie", "Contact", "Footer"],
    premium: false,
  },
  {
    id: "blank",
    name: "Page vide",
    description:
      "Canvas libre. Construis ton portfolio de zéro avec les blocs de ton choix.",
    icon: "square",
    blocks: [],
    premium: false,
  },
];

const TEMPLATE_GENERATORS: Record<string, () => CraftState> = {
  classic: classicTemplate,
  full: fullTemplate,
  minimal: minimalTemplate,
  blank: blankTemplate,
};

/**
 * Génère le craft_state pour un template donné.
 * Fallback sur "classic" si l'ID est invalide.
 */
export function generateTemplate(templateId: string): CraftState {
  const generator =
    TEMPLATE_GENERATORS[templateId] ?? TEMPLATE_GENERATORS.classic;
  return generator();
}
