<div align="center">

# Creafolio

**Le builder de portfolio pensé pour les créateurs UGC.**  
Crée, personnalise et publie un portfolio pro en quelques minutes — sans coder.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Laravel](https://img.shields.io/badge/Laravel-11-red?logo=laravel)](https://laravel.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

</div>

---

## Aperçu

Creafolio est un SaaS **monorepo full-stack** permettant aux créateurs de contenu UGC de construire leur portfolio via un éditeur visuel drag & drop (Craft.js), de publier leur page sur un sous-domaine personnalisé et de gérer leurs abonnements via Stripe.

```
┌─────────────────────────────────────────────────────┐
│                   creafolio.fr                      │
│                                                     │
│  ┌────────────┐   ┌─────────────────────────────┐  │
│  │  Landing   │   │  App (dashboard + builder)  │  │
│  │  Next.js   │   │        Next.js 15            │  │
│  └────────────┘   └──────────────┬──────────────┘  │
│                                  │ REST API          │
│                   ┌──────────────▼──────────────┐  │
│                   │     Laravel 11 (API)         │  │
│                   └──────────────┬──────────────┘  │
│                                  │                   │
│                   ┌──────────────▼──────────────┐  │
│                   │    PostgreSQL 16 (Docker)    │  │
│                   └─────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS |
| **Éditeur visuel** | Craft.js (drag & drop) |
| **Backend** | Laravel 11, Laravel Sanctum (auth API stateless) |
| **Base de données** | PostgreSQL 16 |
| **Auth / Storage** | Supabase (phase transitoire → Laravel natif) |
| **Paiements** | Stripe (subscriptions, webhooks, portail client) |
| **Emails** | Resend |
| **Temps réel** | Laravel Reverb (WebSockets) |
| **Infra** | Docker Compose (dev + prod), Nginx reverse proxy |

---

## Démarrage rapide

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24+
- `make`

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/toms-beatz/creafolio.git
cd creafolio

# 2. Configurer les variables d'environnement
cp .env.example .env
# Ouvrir .env et remplir : APP_KEY, Supabase, Stripe, Resend

# 3. Démarrer toute la stack
make up

# 4. Migrations + seed (premier lancement)
make migrate
make seed
```

> La stack complète est disponible en ~30 secondes.

### Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Généré via `php artisan key:generate` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de ton projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (backend only) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `RESEND_API_KEY` | Clé API Resend |
| `ADMIN_SEED_EMAIL` | Email du compte admin créé au seed |

### URLs de développement

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/v1 |
| Via Nginx | http://localhost:80 |
| PostgreSQL | localhost:5432 |

---

## Structure du monorepo

```
creafolio/
├── frontend/                  # Next.js 15 (App Router)
│   └── src/
│       ├── app/               # Pages & layouts (route groups)
│       ├── components/        # Composants UI partagés
│       ├── features/          # Modules par feature (builder, auth…)
│       ├── lib/               # Clients API, Supabase, Stripe, utils
│       └── types/             # Types TypeScript globaux
│
├── backend/                   # Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/   # Controllers REST
│   │   ├── Models/            # Eloquent models
│   │   └── Events/            # Reverb events
│   ├── database/
│   │   ├── migrations/        # Schéma de base de données
│   │   └── seeders/           # Données initiales
│   └── routes/api.php         # Routes API versionnées
│
├── docker/
│   └── nginx/
│       ├── nginx.conf         # Config dev
│       └── nginx.prod.conf    # Config prod (SSL ready)
│
├── docker-compose.yml         # Stack de développement
├── docker-compose.prod.yml    # Stack de production
├── Makefile                   # Commandes courantes
└── .env.example               # Template des variables
```

---

## Commandes `make`

```bash
# Stack
make up              # Démarrer la stack (mode détaché)
make down            # Arrêter la stack
make build           # Rebuilder les images Docker
make logs            # Suivre les logs en temps réel

# Base de données
make migrate         # Exécuter les migrations Laravel
make seed            # Seeder la base de données
make fresh           # migrate:fresh --seed (reset complet)

# Tests
make test-backend    # Lancer la suite PHPUnit

# Shells
make shell-backend   # Shell dans le container Laravel
make shell-frontend  # Shell dans le container Next.js

# Production
make up-prod         # Démarrer en mode production
make build-prod      # Rebuilder les images prod (sans cache)
```

---

## Architecture réseau

```
Internet
   │
[Nginx :80/:443]          ← reverse proxy + SSL
   ├── /                → frontend:3000  (Next.js)
   └── /api             → backend:8000   (Laravel)
                                │
                           [PostgreSQL :5432]
```

Les services communiquent via le réseau Docker interne. Seul Nginx expose des ports publics.

---

## Fonctionnalités

- **Builder drag & drop** — éditeur visuel Craft.js, composants personnalisables
- **Templates** — galerie de templates pré-construits
- **Sous-domaines** — slug personnalisé automatiquement configuré
- **Freemium / Pro** — gestion d'abonnements Stripe, portail client intégré
- **Analytics** — statistiques de visite par portfolio
- **Admin** — interface d'administration complète (utilisateurs, templates, billing)
- **Support** — système de tickets intégré
- **Accessibilité** — conforme WCAG 2.1 AA

---

## Contribution

1. Fork le repo
2. Crée une branche : `git checkout -b feature/ma-feature`
3. Commit tes changements : `git commit -m 'feat: ma feature'`
4. Push : `git push origin feature/ma-feature`
5. Ouvre une Pull Request

---

## License

Proprietary © 2026 — Tous droits réservés.
