# EPIC-07 — SEO

**Priorité d'implémentation :** 7
**Statut :** A faire
**Mantras actifs :** #20 Performance is a Feature, #37 Ockham
**Dépendances :** EPIC-04 (pages publiques portfolio), EPIC-03 (composants)

---

## Objectif

Garantir que chaque portfolio Blooprint est bien référencé sur les moteurs de recherche grâce à des meta tags dynamiques, Open Graph, sitemap XML et schema.org. Le SEO est un avantage concurrentiel clé vs Canva/Notion.

**Valeur pour le créateur (Mantra IA-3) :** Un bon SEO = les marques trouvent le créateur via Google même sans lien direct. C'est la promesse différenciatrice de Blooprint vs. Canva.

---

## User Stories

---

### US-701 : Meta tags dynamiques par portfolio

**En tant que** marque recherchant un créateur UGC sur Google
**Je veux** que les portfolios Blooprint apparaissent avec titre et description pertinents
**Afin de** comprendre rapidement le profil du créateur avant de cliquer

**Critères d'acceptance :**

- [ ] CA-1 : `generateMetadata()` Next.js sur `src/app/[username]/page.tsx`
- [ ] CA-2 : `<title>` : `[Nom Créateur] — Créateur UGC | Blooprint`
- [ ] CA-3 : `<meta name="description">` : générée depuis bio du créateur (150-160 caractères)
- [ ] CA-4 : Canonical URL : `https://blooprint.fr/[username]`
- [ ] CA-5 : `<meta name="robots" content="index, follow">` si publié, `noindex` si dépublié/supprimé
- [ ] CA-6 : Langue : `<html lang="fr">` par défaut

**Priorité :** High
**Effort estimé :** 2h

---

### US-702 : Open Graph & Twitter Cards

**En tant que** marque qui partage un lien portfolio sur LinkedIn/Twitter
**Je veux** que le lien génère un aperçu visuel attrayant (titre, image, description)
**Afin d'** avoir envie de cliquer et de partager facilement

**Critères d'acceptance :**

- [ ] CA-1 : Open Graph : `og:title`, `og:description`, `og:image`, `og:url`, `og:type = "profile"`
- [ ] CA-2 : `og:image` = photo profil du créateur (optimisée 1200x630px si possible, sinon image par défaut Blooprint)
- [ ] CA-3 : Twitter Card : `twitter:card = "summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`
- [ ] CA-4 : Image Open Graph servie via `next/og` ou image statique Blooprint si aucune photo
- [ ] CA-5 : Tags corrects sur portfolio dépublié : `og:type` présent mais `robots: noindex`

**Priorité :** High
**Effort estimé :** 2h

---

### US-703 : Sitemap XML dynamique

**En tant que** robot Google
**Je veux** un sitemap XML listant tous les portfolios publiés
**Afin de** les indexer rapidement et complètement

**Critères d'acceptance :**

- [ ] CA-1 : Route `src/app/sitemap.ts` → génère sitemap XML dynamiquement
- [ ] CA-2 : Sitemap inclut : home, pricing, et tous les portfolios `status = 'published'`
- [ ] CA-3 : Format : `<url><loc>`, `<lastmod>` (= `portfolios.updated_at`), `<changefreq>weekly`, `<priority>`
- [ ] CA-4 : Priorités : home = 1.0, portfolios = 0.8, pricing = 0.6
- [ ] CA-5 : Re-génération ISR : revalidate automatique après publication/dépublication
- [ ] CA-6 : URL sitemap : `https://blooprint.fr/sitemap.xml`
- [ ] CA-7 : Sitemap max 50 000 URLs (MVP bien en dessous, pas de chunking nécessaire)

**Priorité :** High
**Effort estimé :** 2-3h

---

### US-704 : robots.txt

**En tant que** robot Google
**Je veux** un fichier robots.txt clair
**Afin de** savoir quelles pages crawler et lesquelles ignorer

**Critères d'acceptance :**

- [ ] CA-1 : `src/app/robots.ts` → génère le fichier `robots.txt`
- [ ] CA-2 : `User-agent: *` → `Allow: /` pour les pages publiques
- [ ] CA-3 : `Disallow: /dashboard`, `/builder`, `/settings`, `/api`
- [ ] CA-4 : `Sitemap: https://blooprint.fr/sitemap.xml`
- [ ] CA-5 : Testé via Google Search Console (en production)

**Priorité :** Medium
**Effort estimé :** 0.5h

---

### US-705 : Schema.org pour portfolios UGC

**En tant que** moteur de recherche
**Je veux** comprendre le contenu structuré d'un portfolio Blooprint
**Afin de** afficher des rich snippets dans les résultats de recherche

**Critères d'acceptance :**

- [ ] CA-1 : Schema.org `Person` : name, description, url, image, sameAs (liens sociaux TikTok/Instagram)
- [ ] CA-2 : Schema.org `CreativeWork` ou `Portfolio` pour les collaborations (si applicable)
- [ ] CA-3 : JSON-LD injecté dans `<head>` via `<script type="application/ld+json">`
- [ ] CA-4 : Données générées dynamiquement depuis le contenu Craft.js du portfolio
- [ ] CA-5 : Validé via Google Rich Results Test

**Priorité :** Medium
**Effort estimé :** 2-3h

---

### US-706 : Performance = SEO (Core Web Vitals)

**En tant que** créateur UGC
**Je veux** que mon portfolio soit rapide pour améliorer mon référencement Google
**Afin d'** apparaître en haut des résultats quand une marque cherche un créateur de ma niche

**Critères d'acceptance :**

- [ ] CA-1 : LCP (Largest Contentful Paint) < 2.5s
- [ ] CA-2 : CLS (Cumulative Layout Shift) < 0.1 (images avec width/height définis)
- [ ] CA-3 : INP (Interaction to Next Paint) < 200ms
- [ ] CA-4 : Images Hero préloaded : `<link rel="preload">` ou `priority` prop Next Image
- [ ] CA-5 : Fonts système ou Google Fonts avec `display=swap` + preconnect
- [ ] CA-6 : Lighthouse score SEO > 95 sur page portfolio

**Priorité :** High
**Effort estimé :** 2-3h (si EPIC-09 bien faite, effort minimal)

---

## Hors scope MVP (V0.2+)

- SEO multilingue (hreflang)
- FAQ schema.org
- Breadcrumb schema
- Sitemaps multi-fichiers (si > 50K portfolios)
- Google Search Console monitoring automatisé

---

## Checklist de validation Epic

- [ ] Meta tags dynamiques corrects vérifiés avec `curl -I` ou outil debug OG
- [ ] Open Graph validé : [opengraph.xyz](https://www.opengraph.xyz) ou Facebook Debugger
- [ ] Sitemap accessible et valide : `/sitemap.xml`
- [ ] robots.txt correct : `/robots.txt`
- [ ] Schema.org validé : Google Rich Results Test
- [ ] Lighthouse SEO > 95 sur page portfolio publiée
