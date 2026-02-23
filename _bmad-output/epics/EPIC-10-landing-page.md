# EPIC-10 — Landing Page

**Priorité d'implémentation :** 2.5 (après EPIC-01, avant EPIC-02)
**Statut :** A faire
**Mantras actifs :** #7 KISS, #37 Ockham, IA-3 Explain, IA-16 Challenge
**Dépendances :** EPIC-01 (pages `/signup`, `/login`, `/pricing` existantes), shadcn/ui installé

---

## Objectif

Concevoir et implémenter la landing page publique de Blooprint (`/`) — première impression pour tout créateur UGC. Elle doit communiquer la valeur en < 5 secondes et convertir en inscription.

**Direction artistique : "Blueprint"**
Le design emprunte aux plans d'architecte et aux blueprints techniques :
bordures en tirets (`border-dashed`), grille de fond subtile, annotations en monospace, croix de repérage dans les coins, numéros de coordonnées. Palette sombre (quasi-noir `#09090b`) avec accent **lime** (`#bef264`) — référence Blooprint = Blueprint.
Inspiré de Raycast : typographie serrée, hiérarchie forte, peu de couleurs, beaucoup d'espace.

**Stack :** Next.js App Router (Server Component par défaut) + shadcn/ui + Tailwind CSS

---

## Composants shadcn/ui requis

```bash
npx shadcn@latest init    # configuration initiale
npx shadcn@latest add button badge card separator
```

**Config shadcn à documenter dans `components.json` :**

- Style : `default`
- Base color : `zinc`
- CSS variables : `true`
- tailwind prefix : _(vide)_

---

## Pages & routes liées (EPIC-01)

| Route      | Lien depuis landing                      |
| ---------- | ---------------------------------------- |
| `/signup`  | CTA Hero "C'est gratuit", CTA Final, Nav |
| `/login`   | Nav "Connexion"                          |
| `/pricing` | Section pricing + Nav                    |

---

## Structure de fichiers à créer

```
src/
  app/
    page.tsx                          ← Page principale (composition des sections)
  components/
    landing/
      nav.tsx                         ← Navigation
      hero.tsx                        ← Hero Section
      trust-bar.tsx                   ← Barre de confiance (logos)
      features.tsx                    ← Section features (3 cards)
      showcase.tsx                    ← Blueprint preview / mockup
      pricing-teaser.tsx              ← Aperçu Free vs Premium
      cta-final.tsx                   ← CTA de conversion final
      footer.tsx                      ← Footer
    ui/
      blueprint-grid.tsx              ← Background grille blueprint (réutilisable)
      dashed-card.tsx                 ← Carte avec bordure dashed (variante shadcn Card)
      crosshair.tsx                   ← Croix de repérage décorative
      coord-label.tsx                 ← Label coordonnée style "A1 / 47°N" en mono
```

---

## Design System — DA "Blueprint"

### Palette

```css
/* CSS Variables à ajouter dans globals.css */
--blueprint-bg: #09090b; /* quasi noir */
--blueprint-surface: #111113; /* surface cards */
--blueprint-border: #27272a; /* bordures solides */
--blueprint-dashed: #3f3f46; /* bordures dashed */
--blueprint-text: #fafafa; /* texte principal */
--blueprint-muted: #71717a; /* texte secondaire */
--blueprint-accent: #bef264; /* lime — accent Blooprint */
--blueprint-accent-dim: #3d5f0a; /* accent atténué pour backgrounds */
--blueprint-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Motifs récurrents (Tailwind classes)

| Motif                 | Classes Tailwind                                                         |
| --------------------- | ------------------------------------------------------------------------ |
| Carte blueprint       | `border border-dashed border-zinc-700 bg-zinc-950 rounded-xl`            |
| Annotation coordonnée | `font-mono text-xs text-zinc-500 select-none`                            |
| Accent lime           | `text-lime-300` / `bg-lime-300 text-zinc-950`                            |
| Grille fond           | `bg-[radial-gradient(...)] ou background-image: linear-gradient(dashed)` |
| Croix repérage        | `before: / after: pseudo-elements` ou composant SVG                      |
| Ligne séparatrice     | `border-dashed border-zinc-700`                                          |

### Règle typographique

- **Headlines :** `font-bold tracking-tight text-white` — très serrées, impact maximal
- **Corps :** `text-zinc-400 leading-relaxed`
- **Labels techniques :** `font-mono text-xs text-zinc-500` — annotations blueprint
- **Accent :** `text-lime-300` sur les mots-clés importants dans les headlines

---

## User Stories

---

### US-1001 : Navigation

**En tant que** visiteur
**Je veux** une navbar claire avec accès au login et signup
**Afin de** naviguer efficacement vers la conversion ou ma session

**Fichier :** `src/components/landing/nav.tsx`

**Critères d'acceptance :**

- [ ] CA-1 : Logo "Blooprint" à gauche — typo bold, lettre "B" en accent lime
- [ ] CA-2 : Liens navigation centraux (desktop) : "Features", "Pricing", "Docs" _(placeholder)_
- [ ] CA-3 : Boutons droite : "Connexion" (ghost) [→ `/login`] + "Commencer" (primary lime) [→ `/signup`]
- [ ] CA-4 : Sticky top avec `backdrop-blur-sm` + fine ligne dashed en bas
- [ ] CA-5 : Annotation coordonnée `[NAV // 00.01]` en mono dans un coin (décoration blueprint)
- [ ] CA-6 : Mobile : hamburger → menu drawer avec les mêmes liens (shadcn Sheet ou état simple)
- [ ] CA-7 : Server Component (pas de `'use client'` sauf pour le menu mobile)

**Composants shadcn :** `Button`
**Priorité :** Critical
**Effort estimé :** 1-2h

---

### US-1002 : Hero Section

**En tant que** créateur UGC qui découvre Blooprint
**Je veux** comprendre immédiatement ce que fait le produit et pourquoi c'est pour moi
**Afin de** décider de m'inscrire ou d'explorer plus loin

**Fichier :** `src/components/landing/hero.tsx`

**Design notes :**

```
[ BLOOPRINT // PLAN-001 ]          ← label mono small caps
Your portfolio,
  built like a                     ← headline multi-lignes, tracking-tighter
  blueprint.
                                   ← sous-titre 1 ligne max, zinc-400
Glisse, construis, publie. Ton portfolio UGC en 5 minutes.

[ C'est gratuit →]  [ Voir la démo ]  ← 2 CTAs : primary lime + ghost
                                   ← Pastille "✦ Trial 7 jours Premium offert"
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (ligne dashed separatrice)

[  PLACEHOLDER — MOCKUP BUILDER    ]  ← zone 16:9 avec bordure dashed
[  → `public/images/hero-mockup.png` ]
[  Fallback: composant skeleton    ]
```

**Critères d'acceptance :**

- [ ] CA-1 : Badge label `[BLOOPRINT // PLAN-001]` en font-mono lime audessus du titre
- [ ] CA-2 : Headline >= 3xl, `tracking-tighter`, mot-clé "blueprint" en `text-lime-300`
- [ ] CA-3 : Sous-titre 1 ligne max, `text-zinc-400`
- [ ] CA-4 : CTA primaire "C'est gratuit" → `/signup` (shadcn Button, bg lime, texte zinc-950)
- [ ] CA-5 : CTA secondaire "Voir la démo" → `#showcase` (ghost avec bordure dashed)
- [ ] CA-6 : Pastille de confiance `✦ Trial 7 jours Premium offert` sous les CTAs
- [ ] CA-7 : Zone mockup 16:9 avec `border-dashed border-zinc-700 rounded-xl` — image `public/images/hero-mockup.png` (placeholder SVG si absent)
- [ ] CA-8 : Croix de repérage `<Crosshair />` dans les 4 coins de la zone mockup
- [ ] CA-9 : Labels coordonnées `[X: 0.00] [Y: 0.00]` aux coins (décoratifs)
- [ ] CA-10 : Background : grille blueprint `<BlueprintGrid />` en positionnement absolu

**Composants shadcn :** `Button`, `Badge`
**Priorité :** Critical
**Effort estimé :** 2-3h

---

### US-1003 : Trust Bar (Preuve sociale)

**En tant que** visiteur
**Je veux** voir que d'autres créateurs utilisent Blooprint
**Afin de** rassurer ma décision d'inscription

**Fichier :** `src/components/landing/trust-bar.tsx`

**Design notes :**

```
──────── Ils construisent leur portfolio avec Blooprint ─────────   ← dashed

[  LOGO-1  ]  [  LOGO-2  ]  [  LOGO-3  ]  [  LOGO-4  ]  [  LOGO-5  ]
← placeholders : rectangles zinc-800 rounded, 120x32px, avec label "Creator @handle"
```

**Critères d'acceptance :**

- [ ] CA-1 : Label intro centré `text-zinc-500 text-sm` entre deux lignes dashed
- [ ] CA-2 : 5 blocs placeholder `120x32 bg-zinc-800 rounded border-dashed border-zinc-700` — emplacement `public/images/creators/creator-[1-5].png`
- [ ] CA-3 : Scroll horizontal sur mobile (overflow-x-auto, no scrollbar visible)
- [ ] CA-4 : Labels `@handle` en font-mono sous chaque logo (placeholders : `@creator_1` etc.)
- [ ] CA-5 : Annotation blueprint `[REFS // 00.03]` dans le coin sup droit de la section

**Priorité :** Medium
**Effort estimé :** 1h

---

### US-1004 : Features Section

**En tant que** visiteur
**Je veux** comprendre les 3 features clés de Blooprint
**Afin d'** évaluer si le produit répond à mon besoin de créateur UGC

**Fichier :** `src/components/landing/features.tsx`

**Design notes :**

```
[ FONCTIONNALITÉS // 00.04 ]

  Builder drag & drop      Templates UGC-ready      Publication en 1 clic
  ┌─ ─ ─ ─ ─ ─ ─ ─ ┐     ┌─ ─ ─ ─ ─ ─ ─ ─ ┐     ┌─ ─ ─ ─ ─ ─ ─ ─ ┐
  │                  │     │                  │     │                  │
  │ [PLACEHOLDER IMG]│     │ [PLACEHOLDER IMG]│     │ [PLACEHOLDER IMG]│
  │  feature-1.png   │     │  feature-2.png   │     │  feature-3.png   │
  └─ ─ ─ ─ ─ ─ ─ ─ ┘     └─ ─ ─ ─ ─ ─ ─ ─ ┘     └─ ─ ─ ─ ─ ─ ─ ─ ┘
  Titre feature             Titre feature             Titre feature
  Description courte        Description courte        Description courte
  [FT-01]                   [FT-02]                   [FT-03]
```

**Features à documenter :**

| Feature | Icône | Titre               | Description                                                                     |
| ------- | ----- | ------------------- | ------------------------------------------------------------------------------- |
| FT-01   | `⬡`   | Builder drag & drop | Glisse n'importe quel bloc. Ton portfolio prend forme en direct.                |
| FT-02   | `◈`   | Templates UGC-ready | Démarre depuis un template pensé pour les créateurs TikTok, Instagram, YouTube. |
| FT-03   | `◎`   | Publie en 1 clic    | `blooprint.fr/tonom` — ton lien dans la bio, toujours à jour.                   |

**Critères d'acceptance :**

- [ ] CA-1 : Section label `[FONCTIONNALITÉS // 00.04]` en mono en haut à gauche
- [ ] CA-2 : 3 cartes `<DashedCard />` en grille 3 colonnes (desktop) / 1 colonne (mobile)
- [ ] CA-3 : Chaque carte : zone image placeholder `aspect-video bg-zinc-900 border-dashed border-zinc-700 rounded-lg` — image `public/images/features/feature-[1-3].png`
- [ ] CA-4 : Icône technique (SVG 16x16) en lime + titre `font-semibold text-white`
- [ ] CA-5 : Description `text-zinc-400 text-sm leading-relaxed`
- [ ] CA-6 : Label numérique `[FT-0X]` en mono small en bas droite de chaque carte
- [ ] CA-7 : Hover : `border-lime-300/30 bg-zinc-900/80` transition 200ms

**Composants shadcn :** `Card`, `Badge`
**Priorité :** High
**Effort estimé :** 2h

---

### US-1005 : Showcase / Blueprint Preview

**En tant que** visiteur
**Je veux** voir une démonstration visuelle du builder en action
**Afin de** me projeter dans l'utilisation du produit

**Fichier :** `src/components/landing/showcase.tsx`
**Ancre :** `id="showcase"`

**Design notes :**

```
                    ← coordonnées blueprint aux 4 coins
[ APERÇU // 00.05 ]

  "Construis comme un architecte."

  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ┐
  │                                                         │
  │              [PLACEHOLDER — BUILDER SCREENSHOT]         │
  │           public/images/showcase/builder-demo.png       │
  │             ou séquence d'images animée (future)        │
  │                                                         │
  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ┘
         ↑                                        ↑
   [X: 00.512]                              [Y: 01.024]    ← labels décoratifs mono
```

**Critères d'acceptance :**

- [ ] CA-1 : Titre `"Construis comme un architecte."` avec "architecte" en `text-lime-300`
- [ ] CA-2 : Grande zone placeholder `min-h-[500px] border-dashed border-2 border-zinc-700 rounded-2xl bg-zinc-950 overflow-hidden` — image `public/images/showcase/builder-demo.png`
- [ ] CA-3 : Fallback si image absente : SVG d'un plan d'architecte simplifié ou grille de blocs (`<BlueprintGrid />` avec opacité élevée)
- [ ] CA-4 : `<Crosshair />` dans les 4 coins exacts de la zone
- [ ] CA-5 : Labels `[X: 00.512]` et `[Y: 01.024]` en mono zinc-500 à l'extérieur des coins
- [ ] CA-6 : `<CoordLabel text="[APERÇU // 00.05]" />` en haut gauche hors de la zone

**Priorité :** High
**Effort estimé :** 1-2h

---

### US-1006 : Pricing Teaser

**En tant que** visiteur convaincu
**Je veux** voir rapidement les plans disponibles
**Afin de** décider entre Free et Premium avant de m'inscrire

**Fichier :** `src/components/landing/pricing-teaser.tsx`

**Design notes :**

```
[ PLANS // 00.06 ]

  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐    ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
  │  FREE              │    │  PREMIUM [LIME BADGE] │
  │  0€                │    │  9€/mois              │
  │  · 1 portfolio     │    │  · 3 portfolios       │
  │  · 5 blocs max     │    │  · Illimité           │
  │  · Blooprint.fr    │    │  · Domaine perso      │
  │                    │    │  · Analytics          │
  │  [Commencer]       │    │  [Essai 7 jours →]    │
  └────────────────────┘    └───────────────────────┘

  → voir les détails complets sur /pricing
```

**Critères d'acceptance :**

- [ ] CA-1 : 2 cartes côte à côte (desktop) / empilées (mobile)
- [ ] CA-2 : Carte Free : `border-dashed border-zinc-700`
- [ ] CA-3 : Carte Premium : `border-2 border-lime-300/50 bg-zinc-900` + badge `RECOMMANDÉ` lime
- [ ] CA-4 : CTA Free "Commencer gratuit" → `/signup`
- [ ] CA-5 : CTA Premium "Essai 7 jours gratuit" → `/signup` (trial activé via EPIC-01)
- [ ] CA-6 : Lien "Voir tous les détails →" sous les cartes → `/pricing`
- [ ] CA-7 : Prix Premium avec toggle mensuel/annuel simple (état local React client)
- [ ] CA-8 : Annotation `[PLANS // 00.06]` en mono

**Composants shadcn :** `Card`, `Button`, `Badge`
**Priorité :** High
**Effort estimé :** 2h

---

### US-1007 : CTA Final

**En tant que** visiteur ayant scrollé jusqu'en bas
**Je veux** un dernier appel à l'action fort
**Afin de** convertir sans avoir à rescroller jusqu'en haut

**Fichier :** `src/components/landing/cta-final.tsx`

**Design notes :**

```
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

   Prêt à construire ton portfolio ?

   [ Commencer — c'est gratuit ] ← grand bouton lime pleine largeur max-w-sm

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
```

**Critères d'acceptance :**

- [ ] CA-1 : Section encadrée par deux lignes `border-dashed border-zinc-700`
- [ ] CA-2 : Titre centré, grand, mot "construire" en `text-lime-300`
- [ ] CA-3 : Unique bouton → `/signup`, size xl, pleine largeur max `max-w-sm`, bg lime texte noir
- [ ] CA-4 : Texte micro sous le bouton : "Aucune CB requise · Annulez à tout moment"
- [ ] CA-5 : `<BlueprintGrid />` en background de la section avec faible opacité

**Composants shadcn :** `Button`
**Priorité :** High
**Effort estimé :** 30min

---

### US-1008 : Footer

**En tant que** visiteur
**Je veux** accéder aux liens légaux et de navigation secondaire
**Afin de** trouver les CGU, politique de confidentialité, et contact

**Fichier :** `src/components/landing/footer.tsx`

**Design notes :**

```
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (border-dashed)

  Blooprint              Produit          Légal
  [B] logo               Features         CGU (/legal/cgu)
  © 2026 Blooprint       Pricing          Confidentialité (/legal/privacy)
  Fait avec ◈ par TOM$   Docs*            Contact (mailto:)

                         * placeholder — page non créée

[PAGE // EOF]    ← annotation blueprint finale en bas à droite
```

**Critères d'acceptance :**

- [ ] CA-1 : Séparateur top `border-dashed border-zinc-700`
- [ ] CA-2 : 3 colonnes (desktop) / 1 colonne (mobile) : Marque, Produit, Légal
- [ ] CA-3 : Colonne Marque : logo "Blooprint" + copyright `© 2026` + `Fait par TOM$`
- [ ] CA-4 : Colonne Produit : liens Features, Pricing [→ `/pricing`], Docs _(placeholder href=`#`)_
- [ ] CA-5 : Colonne Légal : CGU `→ /legal/cgu`, Confidentialité `→ /legal/privacy`, Contact `→ mailto:` _(placeholders, pages non créées)_
- [ ] CA-6 : Annotation finale `[PAGE // EOF]` en mono xs en bas à droite
- [ ] CA-7 : Tous les liens en `text-zinc-500 hover:text-white transition-colors`

**Priorité :** Medium
**Effort estimé :** 1h

---

### US-1009 : Composants UI Blueprint (partagés)

**En tant que** développeur (TOM$)
**Je veux** des composants décoratifs blueprint réutilisables
**Afin de** maintenir la cohérence DA sur toute la landing sans dupliquer du code

**Fichiers :**

- `src/components/ui/blueprint-grid.tsx`
- `src/components/ui/dashed-card.tsx`
- `src/components/ui/crosshair.tsx`
- `src/components/ui/coord-label.tsx`

**Critères d'acceptance :**

**BlueprintGrid** :

- [ ] CA-1 : Positionnement `absolute inset-0 pointer-events-none overflow-hidden`
- [ ] CA-2 : Grille SVG ou CSS de lignes dashed très fines, `opacity-[0.04]` par défaut, configurable via prop `opacity`
- [ ] CA-3 : Support prop `className` pour override

**DashedCard** :

- [ ] CA-4 : Wraper shadcn `Card` avec bordure dashed zinc-700 par défaut
- [ ] CA-5 : Prop `accent?: boolean` → active `border-lime-300/50`
- [ ] CA-6 : Fond `bg-zinc-950` par défaut

**Crosshair** :

- [ ] CA-7 : SVG — 2 lignes perpendiculaires + cercle central, stroke `currentColor`, taille 16x16 par défaut
- [ ] CA-8 : Positionné en `absolute` dans son parent, coordonnées via prop `position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`

**CoordLabel** :

- [ ] CA-9 : `<span className="font-mono text-xs text-zinc-500 select-none">` avec prop `text`
- [ ] CA-10 : Prop `position?: 'top-left' | 'top-right' | ...` pour positionnement absolu optionnel

**Priorité :** High (bloquant pour toutes les autres US)
**Effort estimé :** 1-2h

---

## Placeholders images à créer / remplacer

| Chemin                                     | Dimensions | Contenu attendu                             |
| ------------------------------------------ | ---------- | ------------------------------------------- |
| `public/images/hero-mockup.png`            | 1280x720   | Screenshot builder Craft.js (après EPIC-02) |
| `public/images/creators/creator-[1-5].png` | 120x32     | Logo / avatar créateur UGC (à sourcer)      |
| `public/images/features/feature-1.png`     | 800x450    | Demo builder drag & drop                    |
| `public/images/features/feature-2.png`     | 800x450    | Demo template UGC                           |
| `public/images/features/feature-3.png`     | 800x450    | Demo publication / lien bio                 |
| `public/images/showcase/builder-demo.png`  | 1920x1080  | Screenshot complet du builder               |

**Convention fallback :** si l'image est absente → composant `<ImagePlaceholder width={w} height={h} label="..." />` affiche un rectangle zinc-900 avec label centré en mono.

---

## Règles techniques

- [ ] **R-01 :** `src/app/page.tsx` est un **Server Component** — composition des sections, aucun `'use client'`
- [ ] **R-02 :** Seul `pricing-teaser.tsx` est Client Component (toggle mensuel/annuel)
- [ ] **R-03 :** Seul `nav.tsx` peut avoir une partie Client (menu mobile)
- [ ] **R-04 :** Métadonnées SEO dans `src/app/layout.tsx` : title, description, OG image _(placeholder)_
- [ ] **R-05 :** Pas de JavaScript non nécessaire — les animations sont CSS only (Tailwind `transition`, `animate-`)
- [ ] **R-06 :** Mobile-first — toutes les sections fonctionnent à partir de 375px
- [ ] **R-07 :** `next/image` obligatoire pour toutes les images (pas de `<img>`)
- [ ] **R-08 :** LCP < 2.5s — le hero doit s'afficher sans layout shift (dimensions images réservées)
- [ ] **R-09 :** Shadcn init doit utiliser le path alias `@/components/ui` (déjà configuré dans tsconfig)

---

## Checklist de validation finale

- [ ] `npm run build` sans erreur
- [ ] `npx tsc --noEmit` clean
- [ ] `npx next lint` clean
- [ ] Lighthouse mobile perf score > 85
- [ ] Toutes les images manquantes → fallback visible (pas d'alt vide, pas d'erreur 404)
- [ ] Liens `/signup`, `/login`, `/pricing` fonctionnels (EPIC-01 requis)
- [ ] Responsive vérifié : 375px, 768px, 1280px
- [ ] Annotation `[PAGE // EOF]` visible dans le footer

---

## Effort total estimé : 13-16h

| US        | Titre                | Effort     |
| --------- | -------------------- | ---------- |
| US-1009   | Composants blueprint | 1-2h       |
| US-1001   | Navigation           | 1-2h       |
| US-1002   | Hero Section         | 2-3h       |
| US-1003   | Trust Bar            | 1h         |
| US-1004   | Features Section     | 2h         |
| US-1005   | Showcase             | 1-2h       |
| US-1006   | Pricing Teaser       | 2h         |
| US-1007   | CTA Final            | 30min      |
| US-1008   | Footer               | 1h         |
| **Total** |                      | **13-16h** |
