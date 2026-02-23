# EPIC-11 — SEO Landing Page (Top Google "portfolio créateur UGC")

**Priorité d'implémentation :** Post-launch / Croissance
**Statut :** A faire
**Mantras actifs :** #20 Performance is a Feature, #37 Ockham, IA-3 Explain Reasoning
**Dépendances :** EPIC-07 (SEO technique), EPIC-10 (landing page existante)

---

## Objectif

Positionner la landing page Blooprint dans le **top 3 Google.fr** pour les requêtes liées aux portfolios de créateurs UGC. Le SEO de la landing est le principal canal d'acquisition organique et doit convertir les créateurs qui cherchent une solution de portfolio.

**Requêtes cibles (par volume estimé) :**
| Requête | Volume estimé | Difficulté | Priorité |
|---|---|---|---|
| `portfolio créateur ugc` | 500-1K/mois | Faible | ★★★ |
| `portfolio ugc` | 1K-2K/mois | Moyenne | ★★★ |
| `créer portfolio ugc` | 200-500/mois | Faible | ★★★ |
| `portfolio ugc gratuit` | 200-500/mois | Faible | ★★★ |
| `portfolio ugc en ligne` | 100-300/mois | Faible | ★★☆ |
| `exemple portfolio ugc` | 300-500/mois | Faible | ★★☆ |
| `portfolio tiktok créateur` | 100-300/mois | Faible | ★★☆ |
| `link in bio portfolio` | 500-1K/mois | Moyenne | ★★☆ |
| `site portfolio créateur contenu` | 100-200/mois | Faible | ★☆☆ |
| `alternative linktree portfolio` | 200-500/mois | Moyenne | ★☆☆ |

**Valeur (Mantra IA-3) :** Chaque position gagnée sur Google = créateurs qualifiés qui arrivent sans pub. À 500 recherches/mois sur "portfolio créateur ugc", être #1 = ~150 visites/mois gratuites → ~15-30 signups si conversion 10-20%.

---

## User Stories

---

### US-1101 : Optimisation des balises title & meta description

**En tant que** créateur UGC cherchant "portfolio créateur ugc" sur Google
**Je veux** voir un résultat Blooprint clair et attractif dans les SERPs
**Afin de** comprendre immédiatement que c'est l'outil qu'il me faut et cliquer

**Critères d'acceptance :**

- [ ] CA-1 : `<title>` landing optimisé : `Portfolio Créateur UGC — Crée ton portfolio en 5 min | Blooprint` (< 60 caractères)
- [ ] CA-2 : `<meta name="description">` : contient les mots-clés primaires + proposition de valeur + CTA (< 160 caractères) : "Crée ton portfolio UGC professionnel gratuitement. Builder drag & drop, templates prêts à l'emploi, publie en 1 clic sur blooprint.fr/tonom."
- [ ] CA-3 : `metadataBase` défini dans root layout : `https://blooprint.fr`
- [ ] CA-4 : Keywords enrichis dans `metadata.keywords` : `portfolio UGC`, `créateur UGC`, `portfolio créateur contenu`, `link in bio`, `builder portfolio`, `TikTok`, `Instagram`, `YouTube`, `portfolio gratuit`
- [ ] CA-5 : Canonical URL explicite sur landing : `https://blooprint.fr`
- [ ] CA-6 : Open Graph image réelle (1200x630) déployée : `/images/og-image.png`

**Priorité :** Critical
**Effort estimé :** 1h

---

### US-1102 : Contenu sémantique & heading hierarchy optimisés

**En tant que** Google crawler
**Je veux** comprendre la structure sémantique de la landing page
**Afin de** identifier le sujet principal (portfolios UGC) et l'indexer correctement

**Critères d'acceptance :**

- [ ] CA-1 : H1 unique optimisé SEO : `Crée ton portfolio créateur UGC en 5 minutes` (contient la requête principale dans le H1)
- [ ] CA-2 : H2 des sections intègrent des variantes de mots-clés :
  - Features : `Le builder de portfolios UGC pensé pour les créateurs`
  - Showcase : `Exemples de portfolios UGC créés avec Blooprint`
  - Pricing : `Un portfolio UGC gratuit ou premium, à toi de choisir`
  - FAQ : `Questions fréquentes sur les portfolios UGC`
- [ ] CA-3 : Sous-titres (`<p>`) enrichis avec long-tail keywords naturellement
- [ ] CA-4 : Texte alt de toutes les images contient des variantes keyword (ex: "Aperçu du builder de portfolio UGC Blooprint")
- [ ] CA-5 : Les sections utilisent des balises sémantiques : `<section>`, `<article>`, `<nav>`, `<aside>` appropriées
- [ ] CA-6 : Le CTA principal contient la requête secondaire : "Créer mon portfolio UGC – c'est gratuit"

**Priorité :** Critical
**Effort estimé :** 2h

---

### US-1103 : Section FAQ SEO (Schema.org FAQPage)

**En tant que** Google
**Je veux** comprendre les questions fréquentes liées aux portfolios UGC
**Afin de** afficher des rich snippets FAQ dans les résultats de recherche (position 0)

**Critères d'acceptance :**

- [ ] CA-1 : Nouvelle section FAQ sur la landing (avant le CTA final)
- [ ] CA-2 : FAQ optimisées autour des requêtes longue traîne :
  - "Qu'est-ce qu'un portfolio UGC ?"
  - "Comment créer un portfolio de créateur UGC gratuitement ?"
  - "Pourquoi un créateur UGC a besoin d'un portfolio ?"
  - "Quelle est la différence entre un portfolio UGC et un link-in-bio ?"
  - "Comment les marques trouvent-elles des créateurs UGC ?"
  - "Blooprint est-il gratuit ?"
- [ ] CA-3 : Schema.org `FAQPage` JSON-LD dans `<head>` de la landing
- [ ] CA-4 : Toggle accordion pour les réponses (accessible, keyboard navigable)
- [ ] CA-5 : Réponses contiennent les mots-clés de manière naturelle (200-300 chars chaque)
- [ ] CA-6 : Validé via Google Rich Results Test

**Priorité :** High
**Effort estimé :** 3h

---

### US-1104 : Section "Exemples de portfolios" (Social proof SEO)

**En tant que** créateur UGC cherchant "exemple portfolio ugc"
**Je veux** voir des exemples réels de portfolios créés avec Blooprint
**Afin de** visualiser ce que je peux créer et être convaincu

**Critères d'acceptance :**

- [ ] CA-1 : Remplacer le Showcase placeholder par une galerie de 3-6 portfolios réels publiés
- [ ] CA-2 : Chaque card affiche : screenshot/preview, nom du créateur, niche (TikTok, Instagram, etc.)
- [ ] CA-3 : Lien vers le portfolio publié (blooprint.fr/slug) — internal linking SEO
- [ ] CA-4 : Alt tags optimisés : "Portfolio UGC de [nom] — créateur [niche]"
- [ ] CA-5 : Section title H2 : "Exemples de portfolios UGC créés avec Blooprint"
- [ ] CA-6 : Dynamique : fetch les portfolios les plus récents/populaires (ou curated list)

**Priorité :** High
**Effort estimé :** 3h

---

### US-1105 : Page de contenu SEO "/c-est-quoi-un-portfolio-ugc"

**En tant que** créateur débutant cherchant "c'est quoi un portfolio ugc" sur Google
**Je veux** trouver un guide complet qui m'explique et me redirige vers Blooprint
**Afin de** comprendre le concept et être convaincu de créer le mien

**Critères d'acceptance :**

- [ ] CA-1 : Page `/blog/portfolio-ugc` ou `/guide/portfolio-ugc` (URL slug optimisée)
- [ ] CA-2 : Contenu long-form (~1500-2000 mots) couvrant :
  - Définition d'un portfolio UGC
  - Pourquoi c'est indispensable en 2026
  - Ce qu'il doit contenir (vidéos, stats, tarifs, liens)
  - Les erreurs à éviter
  - Comment créer le sien avec Blooprint (CTA)
- [ ] CA-3 : H1 : "Portfolio UGC : Le guide complet pour créateurs en 2026"
- [ ] CA-4 : Internal links vers landing, pricing, signup
- [ ] CA-5 : Schema.org `Article` JSON-LD
- [ ] CA-6 : Table des matières avec anchor links
- [ ] CA-7 : `generateMetadata()` avec title/description/OG optimisés
- [ ] CA-8 : Ajouté au sitemap

**Priorité :** Medium
**Effort estimé :** 4-5h (rédaction + intégration)

---

### US-1106 : Trust Bar avec données réelles & micro-données

**En tant que** visiteur
**Je veux** voir des preuves sociales réelles sur la landing
**Afin de** être rassuré que Blooprint est utilisé par d'autres créateurs

**Critères d'acceptance :**

- [ ] CA-1 : Remplacer les handles placeholders par des métriques réelles ou crédibles : "X portfolios créés", "X créateurs actifs"
- [ ] CA-2 : Compteurs dynamiques (query Supabase côté server) ou statiques (manuels, mis à jour)
- [ ] CA-3 : Micro-donnée Schema.org `SoftwareApplication` sur la landing :
  - `@type`: `SoftwareApplication`
  - `name`: `Blooprint`
  - `applicationCategory`: `BusinessApplication`
  - `offers`: { `@type`: `Offer`, `price`: `0`, `priceCurrency`: `EUR` }
  - `operatingSystem`: `Web`
- [ ] CA-4 : Si > 10 portfolios créés : badge "X portfolios déjà créés" near hero
- [ ] CA-5 : Alt text descriptif sur les avatars/logos

**Priorité :** Medium
**Effort estimé :** 2h

---

### US-1107 : Performance landing (Core Web Vitals)

**En tant que** Google
**Je veux** que la landing se charge rapidement
**Afin de** la favoriser dans le ranking (Core Web Vitals = facteur de classement)

**Critères d'acceptance :**

- [ ] CA-1 : LCP < 2.5s sur mobile 3G (tester via Lighthouse)
- [ ] CA-2 : Remplacer `ImagePlaceholder` par de vrais composants `next/image` avec `priority` sur le hero
- [ ] CA-3 : CLS < 0.1 : toutes les images avec dimensions explicites (`width`/`height`)
- [ ] CA-4 : INP < 200ms : pas de JS bloquant au chargement
- [ ] CA-5 : Fonts : utiliser `next/font` au lieu de Google Fonts external (élimine le preconnect et le FOUT)
- [ ] CA-6 : Lighthouse SEO score > 95, Performance score > 90 sur landing
- [ ] CA-7 : Vérifier que le CookieConsent ne cause pas de CLS (position: fixed OK)
- [ ] CA-8 : Compresser les images OG et features en WebP < 100KB
- [ ] CA-9 : Prefetch landing → signup via `<Link prefetch>` sur les CTAs

**Priorité :** High
**Effort estimé :** 3h

---

### US-1108 : Internal linking & URL hierarchy

**En tant que** Google crawler
**Je veux** un maillage interne cohérent entre les pages
**Afin de** comprendre l'architecture du site et distribuer le PageRank

**Critères d'acceptance :**

- [ ] CA-1 : Footer enrichi : liens vers guide/blog, pricing, légal, exemples
- [ ] CA-2 : Breadcrumbs Schema.org sur pricing, guide, légal
- [ ] CA-3 : Cross-links entre guide → landing, pricing → landing, portfolio → landing
- [ ] CA-4 : `<Link>` Next.js (pas de `<a>`) pour tous les liens internes (prefetch automatique)
- [ ] CA-5 : URL hierarchy propre : `/`, `/pricing`, `/guide/[slug]`, `/legal/*`, `/[portfolio-slug]`
- [ ] CA-6 : Pas de liens cassés (vérifier avec `next build` warnings ou crawl tool)

**Priorité :** Medium
**Effort estimé :** 2h

---

## Stratégie SEO résumée

```
Position 0 (FAQ)     ← US-1103 : FAQ Schema.org
Position 1-3         ← US-1101 + US-1102 : Title/meta + contenu sémantique
Position 4-10        ← US-1104 + US-1106 : Social proof + trust
Long-tail capture    ← US-1105 : Guide "Portfolio UGC"
Technical baseline   ← US-1107 + US-1108 : Perf + internal linking
```

## Hors scope (V0.3+)

- Blog CMS / articles réguliers
- Backlink strategy (guest posts, directories)
- Google Search Console automated monitoring
- A/B testing des titles/descriptions
- Hreflang (international)
- Video SEO (YouTube embeds avec schema VideoObject)
- Google Ads / SEM (paid)

---

## Checklist de validation Epic

- [ ] Lighthouse SEO > 95, Performance > 90 sur landing
- [ ] Google Rich Results Test : FAQPage valide
- [ ] `<title>` contient "portfolio créateur UGC"
- [ ] H1 contient la requête principale
- [ ] OG image réelle déployée et visible sur opengraph.xyz
- [ ] Schema.org SoftwareApplication + FAQPage validés
- [ ] Guide longform indexé et dans le sitemap
- [ ] Exemples portfolios réels avec links internes
- [ ] Aucun lien cassé sur la landing
- [ ] Core Web Vitals "Good" sur PageSpeed Insights
