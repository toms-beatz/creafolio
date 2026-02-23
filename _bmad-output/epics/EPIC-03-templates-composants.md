# EPIC-03 — Templates & Composants

**Priorité d'implémentation :** 4
**Statut :** A faire
**Mantras actifs :** #7 KISS, #20 Performance, #24 Clean Code, #33 Data Dictionary
**Dépendances :** EPIC-09 (infra), EPIC-02 (builder Craft.js initialisé)

---

## Objectif

Créer le template UGC unique du MVP et les 8-10 composants essentiels pour que les créateurs UGC puissent construire un portfolio professionnel. Chaque composant est un Craft.js User Component réutilisable, personnalisable et performant.

**Scope MVP (Mantra #37 Ockham) :**

- **1 template** UGC optimisé (pas de multi-templates en MVP)
- **8-10 composants** essentiels : Hero, About, Portfolio Grid, Before/After, Video Showcase, Stats, Testimonials, Brands, Contact, Footer

---

## User Stories

---

### US-301 : Template UGC par défaut

**En tant que** créateur UGC
**Je veux** que mon portfolio démarre avec un template professionnel pré-rempli
**Afin de** partir d'une base solide et ne pas avoir une page vide

**Critères d'acceptance :**

- [ ] CA-1 : Template "UGC Creator" pré-chargé à la création du premier portfolio
- [ ] CA-2 : Template inclut Hero + About + Portfolio Grid + Contact + Footer avec contenu placeholder
- [ ] CA-3 : Design : typographie moderne, couleurs neutres (noir/blanc/accent), espacements généreux
- [ ] CA-4 : Template 100% personnalisable (tous les textes/images remplaçables)
- [ ] CA-5 : Template optimisé mobile-first (responsive)
- [ ] CA-6 : Template validé Lighthouse : Performance > 85, Accessibility > 90

**Priorité :** Critical
**Effort estimé :** 4-6h

---

### US-302 : Composant Hero (Section principale)

**En tant que** créateur UGC
**Je veux** une section Hero avec mon nom, titre, photo et liens réseaux sociaux
**Afin de** faire une première impression forte auprès des marques

**Props éditables :**

- Nom créateur (texte)
- Titre / Tagline (ex: "Créateur UGC Beauté | 1M+ vues")
- Photo profil (upload image — ronde ou carrée)
- Image de fond optionnelle
- Liens sociaux : TikTok, Instagram, YouTube, Email (URLs)
- Bouton CTA principal (texte + URL)

**Critères d'acceptance :**

- [ ] CA-1 : Composant rendu responsive desktop + mobile
- [ ] CA-2 : Upload photo profil : 5MB max, compression auto, lazy load
- [ ] CA-3 : Liens sociaux ouvrent dans nouvel onglet (`target="_blank" rel="noopener"`)
- [ ] CA-4 : TypeScript interface `HeroProps` complète et validée
- [ ] CA-5 : Accessible : alt text image obligatoire, liens avec aria-label

**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-303 : Composant About Me

**En tant que** créateur UGC
**Je veux** une section "À propos" avec ma bio et mes spécialités
**Afin de** présenter mon parcours et ma niche aux marques

**Props éditables :**

- Titre section (ex: "À propos de moi")
- Bio (textarea — rich text simple ou plain text)
- Spécialités/Niches (tags : Beauté, Tech, Lifestyle...)
- Photo optionnelle (portrait)
- Années d'expérience, nombre de collaborations (stats quick)

**Critères d'acceptance :**

- [ ] CA-1 : Bio max 500 caractères (avec compteur visible)
- [ ] CA-2 : Tags spécialités : max 6 tags, personnalisables
- [ ] CA-3 : Layout flexible : texte seul ou texte + image côte à côte
- [ ] CA-4 : XSS protection : sanitisation du contenu bio avant rendu HTML
- [ ] CA-5 : TypeScript interface `AboutProps` validée

**Priorité :** Critical
**Effort estimé :** 2-3h

---

### US-304 : Composant Portfolio Grid

**En tant que** créateur UGC
**Je veux** une galerie de mes meilleures collaborations avec images/vidéos
**Afin de** montrer visuellement la qualité de mon travail aux marques

**Props éditables :**

- Titre section
- Items (tableau) : chaque item = { image/thumbnail, titre collaboration, marque, description courte, lien externe optionnel }
- Layout : grid 2 colonnes ou 3 colonnes
- Nombre d'items affichés (3, 6, 9...)

**Critères d'acceptance :**

- [ ] CA-1 : Grid responsive : 3 cols desktop, 2 cols tablet, 1 col mobile
- [ ] CA-2 : Images lazy loaded avec aspect ratio fixe (éviter layout shift — CLS)
- [ ] CA-3 : Hover effect : overlay avec titre + marque
- [ ] CA-4 : Lien externe optionnel par item (vers TikTok, Instagram de la vidéo)
- [ ] CA-5 : Upload images : 5MB max par image, compression auto
- [ ] CA-6 : TypeScript interface `PortfolioGridItem[]` validée

**Priorité :** Critical
**Effort estimé :** 4-5h

---

### US-305 : Composant Before/After

**En tant que** créateur UGC
**Je veux** afficher un comparatif avant/après pour mes meilleurs résultats
**Afin de** prouver l'impact de mon contenu de manière visuelle et percutante

**Props éditables :**

- Titre section
- Image "Before" + label (ex: "Avant Blooprint")
- Image "After" + label (ex: "Après ma vidéo")
- Description du résultat (texte)
- Metric clé optionnelle (ex: "+340% de ventes")

**Critères d'acceptance :**

- [ ] CA-1 : Slider interactif avant/après (drag pour révéler) OU affichage côte à côte (option dans props)
- [ ] CA-2 : Responsive : images s'adaptent sur mobile
- [ ] CA-3 : Les deux images ont le même ratio (warning si différent)
- [ ] CA-4 : TypeScript interface `BeforeAfterProps` validée

**Priorité :** High
**Effort estimé :** 3-4h

---

### US-306 : Composant Video Showcase

**En tant que** créateur UGC
**Je veux** intégrer des vidéos de mes créations (TikTok, YouTube, Instagram)
**Afin de** montrer directement mes créations vidéo aux marques

**Props éditables :**

- Titre section
- Items vidéo (tableau) : { platform: 'tiktok' | 'youtube' | 'instagram', url, thumbnail optionnelle, description }
- Layout : 1 vidéo principale ou grille

**Critères d'acceptance :**

- [ ] CA-1 : Embed TikTok, YouTube, Instagram via URL (extract video ID)
- [ ] CA-2 : Chargement lazy des iframes (performance — Mantra #20)
- [ ] CA-3 : MVP videos = liens externes uniquement (pas d'upload vidéo direct — Mantra #37)
- [ ] CA-4 : Thumbnail de fallback si embed non disponible
- [ ] CA-5 : URL validation minimum : format URL valide
- [ ] CA-6 : TypeScript interface `VideoItem[]` validée

**Priorité :** High
**Effort estimé :** 3-4h

---

### US-307 : Composant Stats

**En tant que** créateur UGC
**Je veux** afficher mes statistiques clés (followers, vues, engagement)
**Afin de** prouver quantitativement mon impact aux marques

**Props éditables :**

- Titre section
- Items stats (4-6 max) : { valeur, label, icône optionnelle } — ex: "1M+", "vues TikTok"

**Critères d'acceptance :**

- [ ] CA-1 : Layout : grille flex 2x2 ou 3x2 selon nombre de stats
- [ ] CA-2 : Animation count-up au scroll (optionnelle, dégradée si JS disabled)
- [ ] CA-3 : Max 6 stats configurables
- [ ] CA-4 : TypeScript interface `StatItem[]` validée
- [ ] CA-5 : Accessible : aria-label sur chaque stat

**Priorité :** High
**Effort estimé :** 2h

---

### US-308 : Composant Testimonials

**En tant que** créateur UGC
**Je veux** afficher des avis et témoignages de marques avec qui j'ai collaboré
**Afin de** renforcer ma crédibilité via la preuve sociale

**Props éditables :**

- Titre section
- Items (tableau) : { texte témoignage, nom marque, logo marque optionnel, nom contact, poste contact }
- Layout : carousel ou grille

**Critères d'acceptance :**

- [ ] CA-1 : Affichage en carousel (1 à la fois) ou grille (2-3 cols)
- [ ] CA-2 : Logo marque : upload image ou texte fallback
- [ ] CA-3 : TypeScript interface `TestimonialItem[]` validée
- [ ] CA-4 : Max 10 témoignages

**Priorité :** Medium
**Effort estimé :** 3h

---

### US-309 : Composant Brands

**En tant que** créateur UGC
**Je veux** afficher les logos des marques avec qui j'ai travaillé
**Afin de** montrer en un coup d'oeil mon portefeuille de clients

**Props éditables :**

- Titre section (ex: "Ils m'ont fait confiance")
- Items logos : { image logo, nom marque (alt), lien optionnel }

**Critères d'acceptance :**

- [ ] CA-1 : Grille logos responsive (3-6 logos par ligne)
- [ ] CA-2 : Images logos en niveaux de gris par défaut, couleurs au hover
- [ ] CA-3 : Alt text = nom marque (accessibilité)
- [ ] CA-4 : TypeScript interface `BrandItem[]` validée
- [ ] CA-5 : Logo upload 5MB max, recommandé format PNG transparent

**Priorité :** Medium
**Effort estimé :** 2h

---

### US-310 : Composant Contact

**En tant que** créateur UGC
**Je veux** une section contact avec mes coordonnées et liens
**Afin que** les marques puissent facilement me contacter pour une collaboration

**Props éditables :**

- Titre section (ex: "Travaillons ensemble")
- Email de contact
- Liens sociaux principaux (TikTok, Instagram, LinkedIn)
- Message d'introduction (texte court)
- CTA texte (ex: "Envoyer un email")

**Critères d'acceptance :**

- [ ] CA-1 : Email affiché avec lien `mailto:` (pas de formulaire en MVP — RG-001 V0.2+)
- [ ] CA-2 : Liens sociaux ouvrent dans nouvel onglet
- [ ] CA-3 : Email obfuscation basique anti-spam (encodage HTML ou JS)
- [ ] CA-4 : TypeScript interface `ContactProps` validée

**Priorité :** High
**Effort estimé :** 1-2h

---

### US-311 : Composant Footer

**En tant que** créateur UGC
**Je veux** un footer avec mon nom et le watermark Blooprint
**Afin de** finaliser proprement mon portfolio

**Props éditables :**

- Copyright texte (ex: "© 2026 John Creator")
- Liens footer optionnels (Instagram, TikTok, email)

**Critères d'acceptance :**

- [ ] CA-1 : Footer affiche "Built with Blooprint" watermark si compte Free (non supprimable en Free)
- [ ] CA-2 : Compte Premium : watermark masqué par défaut (toggle optionnel)
- [ ] CA-3 : Lien watermark redirige vers `blooprint.fr` (referral)
- [ ] CA-4 : TypeScript interface `FooterProps` validée

**Règles :** RG-004 (Free watermark)
**Priorité :** High
**Effort estimé :** 1h

---

## Structure fichiers composants

```
src/components/
  craft/
    Hero/
      index.tsx       # Composant Craft.js (useNode)
      Hero.tsx        # UI pure (props typed)
      types.ts        # HeroProps interface
    About/
    PortfolioGrid/
    BeforeAfter/
    VideoShowcase/
    Stats/
    Testimonials/
    Brands/
    Contact/
    Footer/
```

---

## Hors scope MVP (V0.2+)

- Templates supplémentaires (Dev, Designer, Photographe)
- Composants additionnels (Timeline, Pricing, FAQ, Map)
- Formulaire de contact intégré (V0.2 — CGU, spam, RGPD)
- Personnalisation couleurs/typographie globale au niveau template
- Animations avancées (Framer Motion)

---

## Checklist de validation Epic

- [ ] Les 8-10 composants rendus correctement dans le builder
- [ ] Chaque composant a son interface TypeScript
- [ ] Upload images fonctionne avec limite 5MB
- [ ] Responsive validé (desktop + mobile) sur tous les composants
- [ ] Watermark affiché Footer en Free / masqué en Premium
- [ ] Lighthouse Accessibility > 90 sur le portfolio rendu
