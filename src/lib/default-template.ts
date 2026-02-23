/**
 * Template UGC par défaut — pré-chargé à la création d'un portfolio.
 * Structure sérialisée Craft.js : ROOT → [HeroBlock, AboutBlock, StatsBlock, GalleryBlock, ContactBlock, FooterBlock]
 */

export function generateDefaultTemplate(): Record<string, unknown> {
  // Fixed IDs pour le template (stables, pas de collision avec d'autres nodes)
  const heroId = "tmpl_hero";
  const aboutId = "tmpl_about";
  const statsId = "tmpl_stats";
  const galleryId = "tmpl_gallery";
  const contactId = "tmpl_contact";
  const footerId = "tmpl_footer";

  return {
    ROOT: {
      type: { resolvedName: "div" },
      isCanvas: true,
      props: { className: "flex flex-col gap-2 p-4 max-w-2xl mx-auto" },
      displayName: "Root",
      custom: {},
      hidden: false,
      nodes: [heroId, aboutId, statsId, galleryId, contactId, footerId],
      linkedNodes: {},
    },
    [heroId]: {
      type: { resolvedName: "HeroBlock" },
      isCanvas: false,
      props: {
        name: "Ton Nom",
        title: "Créateur·rice UGC",
        description:
          "Je crée du contenu authentique pour des marques ambitieuses. TikTok · Instagram · YouTube.",
        ctaLabel: "Voir mes projets",
        ctaHref: "#gallery",
        imageUrl: "",
      },
      displayName: "Hero",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    [aboutId]: {
      type: { resolvedName: "AboutBlock" },
      isCanvas: false,
      props: {
        heading: "À propos",
        bio: "Créateur·rice UGC passionné·e, je collabore avec des marques pour créer du contenu vidéo authentique qui convertit.",
        niches: ["Beauté", "Lifestyle", "Food", "Tech"],
      },
      displayName: "À propos",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    [statsId]: {
      type: { resolvedName: "StatsBlock" },
      isCanvas: false,
      props: {
        title: "Mes chiffres",
        stats: [
          { value: "50+", label: "Projets UGC" },
          { value: "2M+", label: "Vues générées" },
          { value: "30+", label: "Marques" },
        ],
      },
      displayName: "Stats",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    [galleryId]: {
      type: { resolvedName: "GalleryBlock" },
      isCanvas: false,
      props: {
        heading: "Mes projets",
        items: [
          { caption: "Projet 1" },
          { caption: "Projet 2" },
          { caption: "Projet 3" },
        ],
        columns: 3,
      },
      displayName: "Galerie",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    [contactId]: {
      type: { resolvedName: "ContactBlock" },
      isCanvas: false,
      props: {
        heading: "Travaillons ensemble",
        description:
          "Tu cherches un créateur UGC pour ta prochaine campagne ? Écris-moi.",
        email: "ton@email.com",
        ctaLabel: "Envoie-moi un message",
        socials: [],
      },
      displayName: "Contact",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
    [footerId]: {
      type: { resolvedName: "FooterBlock" },
      isCanvas: false,
      props: {
        copyright: `© ${new Date().getFullYear()} Mon Nom`,
        links: [],
        showWatermark: true,
      },
      displayName: "Footer",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  };
}
