# EPIC-09 — Infrastructure & Performance

**Priorité d'implémentation :** 1 (premier)
**Statut :** Terminé
**Mantras actifs :** #7 KISS, #20 Performance is a Feature, #37 Ockham, IA-3 Explain
**Dépendances :** Aucune (base de tout)

---

## Objectif

Mettre en place la fondation technique de Blooprint : projet Next.js structuré, configuration Supabase et Stripe, déploiement Vercel, gestion des variables d'environnement, optimisation images et monitoring de base.

**Pourquoi en premier (Mantra #37 Ockham) :** Sans infra solide, tout le reste est fragile. Un setup propre dès le Sprint 0 évite la dette technique dès le début — surtout critique pour un solo dev.

---

## User Stories

---

### US-901 : Setup projet Next.js

**En tant que** développeur (TOM$)
**Je veux** un projet Next.js latest configuré avec App Router, TypeScript, Tailwind CSS v4 et ESLint
**Afin de** avoir une base de code propre, typsée et maintenable dès le départ

**Critères d'acceptance :**

- [ ] CA-1 : `next dev` démarre sans erreur
- [ ] CA-2 : TypeScript strict mode activé (`"strict": true` dans `tsconfig.json`)
- [ ] CA-3 : Tailwind CSS configuré et fonctionnel (classe de test visible)
- [ ] CA-4 : ESLint configuré avec règles Next.js + TypeScript
- [ ] CA-5 : Structure de dossiers respectée : `src/app/`, `src/components/`, `src/features/`, `src/lib/`, `src/types/`, `src/styles/`
- [ ] CA-6 : `.env.local` template créé avec toutes les variables requises (sans valeurs sensibles)
- [ ] CA-7 : `.gitignore` inclut `.env.local` et `node_modules`

**Priorité :** Critical
**Effort estimé :** 2-3h

---

### US-902 : Configuration Supabase

**En tant que** développeur (TOM$)
**Je veux** Supabase configuré (project + client SDK) avec les tables de base
**Afin de** pouvoir stocker utilisateurs, portfolios et données métier

**Critères d'acceptance :**

- [ ] CA-1 : Projet Supabase créé (plan Free)
- [ ] CA-2 : Client Supabase initialisé dans `src/lib/supabase/client.ts` (browser) et `src/lib/supabase/server.ts` (server components)
- [ ] CA-3 : Variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] CA-4 : Schema BDD initial créé via migrations SQL : tables `users`, `portfolios`, `components_data`, `subscriptions`
- [ ] CA-5 : Row Level Security (RLS) activé sur toutes les tables
- [ ] CA-6 : Supabase Storage bucket `portfolios-media` créé (public read, auth write)
- [ ] CA-7 : Connexion testée depuis Next.js (query simple sans erreur)

**Schema BDD initial :**

```sql
-- users (extension de auth.users Supabase)
profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  email text not null,
  plan text default 'free', -- 'free' | 'trial' | 'premium'
  trial_ends_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- portfolios
portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null default 'Mon Portfolio',
  slug text unique not null, -- = username au moment de création
  status text default 'draft', -- 'draft' | 'published' | 'suspended' | 'deleted'
  craft_state jsonb, -- état Craft.js sérialisé
  deleted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- subscriptions
subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text, -- 'active' | 'trialing' | 'canceled' | 'past_due'
  current_period_end timestamptz,
  created_at timestamptz default now()
)
```

**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-903 : Configuration Stripe

**En tant que** développeur (TOM$)
**Je veux** Stripe configuré avec les produits/prix MVP et les webhooks
**Afin de** pouvoir gérer abonnements, trial et paiements

**Critères d'acceptance :**

- [ ] CA-1 : Compte Stripe créé, mode test activé
- [ ] CA-2 : Produit "Blooprint Premium" créé avec 2 prix : `price_monthly` (9€/mois) et `price_yearly` (79€/an)
- [ ] CA-3 : Variables d'environnement : `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] CA-4 : Client Stripe initialisé dans `src/lib/stripe.ts`
- [ ] CA-5 : Endpoint webhook créé : `src/app/api/webhooks/stripe/route.ts`
- [ ] CA-6 : Stripe CLI installé localement pour tester webhooks en dev
- [ ] CA-7 : Events écoutés définis : `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

**Priorité :** High
**Effort estimé :** 2-3h

---

### US-904 : Déploiement Vercel

**En tant que** développeur (TOM$)
**Je veux** le projet déployé sur Vercel avec CI/CD automatique
**Afin de** avoir un environnement de preview et production dès le départ

**Critères d'acceptance :**

- [ ] CA-1 : Projet connecté à Vercel via Git (main → production, branches → preview)
- [ ] CA-2 : Variables d'environnement configurées sur Vercel (Production + Preview)
- [ ] CA-3 : Domaine `blooprint.fr` configuré sur Vercel (ou sous-domaine staging)
- [ ] CA-4 : Build Next.js passe en production sans erreurs TypeScript
- [ ] CA-5 : `vercel.json` configuré si nécessaire (headers, redirects)
- [ ] CA-6 : Webhook Stripe URL de production enregistrée dans Stripe Dashboard

**Priorité :** High
**Effort estimé :** 1-2h

---

### US-905 : Optimisation images Next.js

**En tant que** créateur
**Je veux** que mes images soient optimisées automatiquement
**Afin d'** avoir un portfolio rapide avec un bon score Lighthouse

**Critères d'acceptance :**

- [ ] CA-1 : `next/image` configuré avec domaines autorisés (Supabase Storage)
- [ ] CA-2 : Configuration `next.config.ts` : formats WebP/AVIF activés
- [ ] CA-3 : Compression auto au upload : images > 1MB compressées via sharp
- [ ] CA-4 : Validation taille upload : max 5MB (erreur explicite si dépassé)
- [ ] CA-5 : Lazy loading activé par défaut sur tous les composants image
- [ ] CA-6 : Placeholder blur pour les images Supabase Storage (LCP amélioré)

**Règles :** RG-006
**Priorité :** High
**Effort estimé :** 2-3h

---

### US-906 : Monitoring & Logging de base

**En tant que** développeur (TOM$)
**Je veux** un système de logging structuré pour les erreurs critiques
**Afin de** détecter et corriger les bugs rapidement (Mantra #4 Fail Fast, Fail Visible)

**Critères d'acceptance :**

- [ ] CA-1 : `console.error` remplacé par un logger structuré (`src/lib/logger.ts`) en production
- [ ] CA-2 : Erreurs Stripe webhooks loguées avec contexte (event type, user id, payload)
- [ ] CA-3 : Erreurs Supabase loguées avec query context
- [ ] CA-4 : Vercel Logs accessible pour monitoring production
- [ ] CA-5 : `NODE_ENV` géré correctement (debug logs désactivés en production)

**Priorité :** Medium
**Effort estimé :** 1-2h

---

## Hors scope MVP (V0.2+)

- Docker containerisation
- Redis cache
- Monitoring avancé (Datadog, Sentry)
- CDN custom
- Multi-région Vercel
- Edge functions avancées

---

## Checklist de validation Epic

- [ ] `npm run build` sans erreur
- [ ] `npm run lint` sans erreur
- [ ] Variables d'environnement documentées dans `.env.example`
- [ ] Connexion Supabase testée (read/write)
- [ ] Connexion Stripe testée (webhook test event reçu)
- [ ] Déploiement Vercel fonctionnel
- [ ] Lighthouse score > 90 sur page home (baseline)
