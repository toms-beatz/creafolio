# Interview Summary - Blooprint Fullstack Expert Agent

**Date:** 2026-02-09  
**Duration:** 65 minutes  
**Interviewer:** BYAN-TEST  
**Interviewee:** TOM$  
**Methodology:** 4-Phase Intelligent Interview (BMAD)

---

## Executive Summary

Création réussie d'un agent fullstack expert pour le projet **Blooprint**, un builder de portfolio SaaS freemium destiné aux créateurs UGC. L'interview a permis de définir un contexte projet complet, une documentation business rigoureuse, et un agent spécialisé avec 5 capacités et 13 mantras BMAD.

**Résultat:** Agent validé et généré pour 2 plateformes (GitHub Copilot CLI + VSCode).

---

## PHASE 1: PROJECT CONTEXT (15-30 min)

### Projet Basics

**Nom:** Blooprint

**Description:** Builder de portfolio drag & drop généraliste avec templates et composants par niche (focus UGC en MVP).

**Problème résolu:** Les créateurs UGC (TikTok, Instagram) ont des portfolios visuellement médiocres (Canva), sans SEO, ou trop chers/complexes (Webflow). La barrière technique pour créer un site web professionnel est trop élevée.

**Solution:** Drag & drop simple type Elementor, templates professionnels par niche, composants custom, SEO natif, modèle freemium accessible.

**Maturité:** Idée (phase conceptuelle)

### Stack Technique

**Frontend/Backend:** Next.js 14+ (App Router), React 18+, TypeScript  
**Visual Builder:** Craft.js (drag & drop)  
**BDD/Auth/Storage:** Supabase (PostgreSQL, Auth, Storage)  
**Billing:** Stripe (webhooks, subscriptions)  
**Hébergement:** Vercel  
**Docker:** Skip pour MVP

**Décision clé:** Option Next.js fullstack (vs Laravel API + React séparé) pour simplicité et déploiement gratuit Vercel.

### Team & Timeline

**Team:** Solo (TOM$)  
**Effort:** 20h/semaine  
**Timeline:** 3-4 mois pour MVP  
**Méthodologie:** BMAD Agile

### Pain Points & 5 Whys

**WHY #1:** Pourquoi créer Blooprint ? → Pour les autres (créateurs UGC)  
**WHY #2:** Qu'est-ce qui frustre ? → Portfolios visuellement nuls, pas optimisés SEO  
**WHY #3:** Pourquoi maintenant ? → Envie de faire ce projet + besoin marché identifié  
**WHY #4:** Quel problème résolu ? → Complexité de créer un site web professionnel  
**WHY #5:** Cause racine ? → "I want money" + portfolios actuels sont nuls/pas attractifs/compliqués

**Root Cause:** Démocratiser la création de portfolios professionnels pour créateurs/freelances sans compétences techniques, avec focus visuel + SEO + simplicité + monétisation.

### Goals & Success Criteria

**Objectifs MVP:**
- 10+ utilisateurs inscrits
- 10+ portfolios créés
- Début de revenus avec remboursement si insatisfait
- Engagement: portfolios visités/utilisés
- Feedback positif des early adopters

---

## PHASE 2: BUSINESS/DOMAIN (15-20 min)

### Business Domain

**Industrie:** SaaS B2C - Portfolio Builders  
**Secteur:** Créateurs de contenu UGC (User Generated Content)  
**Cible:** Créateurs TikTok, Instagram produisant du contenu pour marques  
**Valeur:** Portfolio professionnel pour démarcher marques et obtenir collaborations rémunérées

### Glossaire Métier (8 concepts - RG-PRJ-002 ✓)

1. **Portfolio:** Site web mono-page d'un créateur UGC présentant ses projets, collaborations, stats et contact pour démarcher des marques.

2. **Créateur:** Utilisateur de Blooprint. Créateur de contenu UGC (vidéos, photos) qui collabore avec des marques contre rémunération.

3. **Template:** Design complet de portfolio (couleurs, typographie, layout, structure) personnalisable via le visual builder.

4. **Composant:** Bloc fonctionnel drag & drop du builder (ex: Hero, Video Showcase, Before/After). Le créateur les assemble pour construire son portfolio.

5. **Collaboration:** Projet rémunéré entre un créateur UGC et une marque. Une collaboration peut contenir plusieurs contenus (vidéos/photos).

6. **Marque:** Entreprise cliente du créateur UGC pour qui il produit du contenu.

7. **Stats:** Données de performance du créateur (vues, engagement, followers, conversions) présentées dans le portfolio pour prouver son impact.

8. **Publication:** Portfolio publié en ligne, accessible publiquement via URL personnalisée (blooprint.fr/username).

### Acteurs (3)

1. **Créateur** (utilisateur principal) - Crée, édite, publie portfolios
2. **Marque/Recruteur** (visiteur externe) - Consulte portfolios, contacte créateurs
3. **Admin Blooprint** (système) - Gestion plateforme, modération, support

### Processus Métier (8)

1. **Onboarding Créateur**
2. **Création Portfolio**
3. **Publication Portfolio**
4. **Visite Portfolio (Marque)**
5. **Upgrade Premium**
6. **Dépublication**
7. **Suppression Portfolio**
8. **Downgrade Premium → Free**

### Règles de Gestion (11)

RG-001 à RG-011 couvrant: username unique, auth, trial, portfolios limités, composants limités, stockage, custom domain, publication, RGPD, soft delete, modération.

### Modèle Économique

**Type:** Freemium SaaS

**Free Tier:**
- 1 portfolio
- 6 composants max
- 500MB storage
- blooprint.fr/username
- Watermark "Built with Blooprint"
- Analytics basiques (vues)

**Premium Tier (9€/mois ou 79€/an):**
- 3 portfolios max
- Composants illimités
- 5GB storage
- Custom domain (V0.2+)
- Pas de watermark
- Analytics avancées (visiteurs uniques, taux clic, sources)

**Trial:** 7 jours Premium automatique dès signup

**Refund:** 14 jours satisfait ou remboursé

**Décision clé:** Modèle A (Freemium classique) choisi pour MVP avec objectif de générer revenus dès le lancement.

### Edge Cases

- User uploade 100 images énormes → Limite 5MB/fichier + compression auto + quota 500MB Free
- Contenu illégal/NSFW → CGU + système signalement + modération manuelle
- Paiement Stripe échoue → Downgrade Free automatique + email notification
- Race condition username → Transaction SQL, premier validé gagne
- Custom domain conflit → 1 domain = 1 portfolio unique (contrainte BDD)

---

## PHASE 3: AGENT NEEDS (10-15 min)

### Décisions Scope MVP

**Challenge accepté:** Focus UGC uniquement (pas multi-niche en MVP)

**Scope finalisé:**
- **1 template UGC** optimisé (vs 3 templates initialement proposés)
- **8-10 composants** essentiels (vs 15 initialement proposés)
- Auth + Craft.js + BDD + Publication
- **Budget:** ~210-230h (marge confortable pour 3-4 mois)

**Ajustements validés:**
- Custom domain → **V0.2** (économie ~20-30h)
- Onboarding → **Tooltip minimal** (+2-3h, meilleure UX)
- Pas de Docker en MVP
- Stockage Free: **500MB** (Option A validée)

### Rôle de l'Agent

**Choix:** 1 agent généraliste (vs 4-5 agents spécialisés)

**Nom:** Blooprint Fullstack Expert

**Rôle:** Expert fullstack spécialisé dans la création de builders web SaaS. Maîtrise Next.js, Craft.js, Supabase, Stripe et le business model freemium pour créateurs UGC.

### Connaissances Requises

**Business:**
- Glossaire complet (8 concepts)
- Modèle économique freemium
- Règles métier (11 RG)
- Cible utilisateur (créateurs UGC)
- Processus clés

**Techniques:**
- Next.js 14+ (App Router, Server Components, API Routes)
- React 18+ (hooks, context, performance)
- TypeScript
- Craft.js (visual builder)
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Stripe (billing, webhooks, subscriptions)
- Vercel (deployment)
- SEO (meta tags, sitemap, schema.org)
- Security (XSS, CSRF, SQL injection, RGPD)

### Capacités (5 - RG-AGT-002 ✓)

1. **Architecturer & Développer** features Blooprint
2. **Optimiser Performance & SEO**
3. **Valider Architecture & Sécurité**
4. **Guider Design Système** et composants
5. **Résoudre Bugs & Debugging**

### Mantras Prioritaires (13 - RG-AGT-003 ✓)

**Core (8):**
- #4 Fail Fast, Fail Visible
- #7 KISS (Keep It Simple)
- #18 TDD is Not Optional
- #20 Performance is a Feature
- #37 Rasoir d'Ockham (Start Simple)
- #39 Évaluation des Conséquences
- IA-3 Explain Reasoning (Transparence)
- IA-16 Challenge Before Confirm

**Support (5):**
- #33 Data Dictionary First
- #34 MCD ⇄ MCT (Cross-validation)
- IA-21 Self-Aware Agent
- IA-23 No Emoji Pollution
- IA-24 Clean Code Always

### Style de Communication

**Profil:** Consultant Technique Pragmatique  
**Ton:** Tutoiement, professionnel, direct  
**Longueur:** Concis par défaut, détaillé si nécessaire  
**Code:** Sur demande uniquement  
**Emojis:** Aucun (Mantra IA-23 strict)  
**Principe:** Toujours expliquer le POURQUOI (Mantra IA-3)

### Use Cases (9 - RG-AGT-004 ✓)

1. Architecture autosave builder
2. Intégration Stripe billing
3. Optimisation Core Web Vitals
4. Review sécurité auth Supabase
5. Debugging Craft.js complexe
6. Structure composants UGC réutilisables
7. Challenge décisions techniques
8. Personnalisation avancée Craft.js
9. SEO dynamique (meta tags, sitemap, schema.org)

**Décision:** Tous les use cases considérés critiques (avec flexibilité si retard).

---

## PHASE 4: VALIDATION & CO-CRÉATION (10 min)

### Challenges Adressés

**Challenge 1 - Scope MVP Ambitieux:**  
✅ Accepté avec flexibilité (custom domain → V0.2, tooltip minimal ajouté)

**Challenge 2 - Use Cases Critiques:**  
✅ Tous confirmés critiques (9 use cases)

**Challenge 3 - Stockage Free 500MB:**  
✅ Validé 500MB (vs 100-200MB suggéré)

**Challenge 4 - Custom Domain Complexe:**  
✅ Repoussé en V0.2 (économie ~20-30h)

**Challenge 5 - Pas d'Onboarding:**  
✅ Ajout tooltip minimal (+2-3h) pour meilleure UX

### Évaluation des Conséquences (Mantra #39)

**Impacts Positifs:**
- Focus UGC = niche claire, positionnement fort
- Freemium = barrière entrée basse, conversion progressive
- Stack moderne = scalable, maintenable
- 1 agent généraliste = cohérence, maintenance simple

**Risques Identifiés & Mitigations:**
1. **Craft.js complexité** → Agent UC-005 + UC-008, POC rapide Sprint 0
2. **Stripe webhooks** → Agent UC-002, tests Stripe CLI, monitoring
3. **Scope creep** → Agent UC-007 challenge scope, Mantra #37
4. **SEO/Performance négligé** → Agent UC-003 + UC-009, Mantra #20
5. **Stockage 500MB généreux** → Monitoring usage, ajustement V0.2 si nécessaire
6. **Solo dev burnout** → Planning réaliste, breaks, célébration milestones

**Trade-offs Acceptés:**
- Custom domain V0.2 (sacrifice feature pour vitesse)
- Pas onboarding complet (sacrifice UX pour effort)
- 1 template seulement (sacrifice choix pour focus)
- 500MB Free (risque coût mais acquisition facilitée)

### Validation Finale

**Status:** ✅ VALIDÉ

**Livrables créés:**
1. ✅ ProjectContext (YAML) - Business documentation complète
2. ✅ AgentSpec (YAML) - Agent specification validée
3. ✅ Agent GitHub Copilot CLI (.md) - Format BMAD
4. ✅ Agent VSCode (.md) - Format markdown optimisé
5. ✅ Interview Summary (ce document)

**Règles validées:**
- ✅ RG-PRJ-002: Glossaire >= 5 concepts (8 concepts)
- ✅ RG-AGT-001: Agent name unique
- ✅ RG-AGT-002: >= 3 capabilities (5 capacités)
- ✅ RG-AGT-003: >= 5 mantras (13 mantras)
- ✅ RG-AGT-004: >= 3 use cases (9 use cases)

---

## Key Decisions Summary

1. **Niche:** Focus UGC uniquement en MVP (vs multi-niche)
2. **Stack:** Next.js fullstack (vs Laravel + React séparé)
3. **Builder:** Craft.js (vs GrapesJS ou custom)
4. **Auth:** Supabase Auth (gestion TOM$ via SDK)
5. **Scope:** 1 template + 8-10 composants (vs 3 templates + 15 composants)
6. **Custom Domain:** V0.2 (vs MVP)
7. **Onboarding:** Tooltip minimal (vs pas d'onboarding)
8. **Stockage:** Free 500MB, Premium 5GB (Option A)
9. **Docker:** Skip pour MVP
10. **Monétisation:** Freemium Modèle A (9€/mois, trial 7j, refund 14j)
11. **Agent:** 1 agent généraliste (vs 4-5 spécialisés)
12. **Mantras:** 13 mantras (8 core + 5 support)
13. **Plateformes:** GitHub Copilot CLI + VSCode

---

## Next Steps

### Pour TOM$:

1. **Activer l'agent:**
   - GitHub Copilot CLI: `@blooprint-fullstack-expert`
   - VSCode: Charger le fichier markdown dans context

2. **Sprint 0 (Semaine 1-2):**
   - Setup projet Next.js 14 (TypeScript, Tailwind)
   - Setup Supabase (compte, projet, connexion)
   - POC Craft.js (test drag & drop basique)
   - Schema BDD initial (users, portfolios, components)

3. **Sprint 1 (Semaine 3-4):**
   - Auth Supabase (signup, login, email confirmation)
   - Onboarding flow (username, trial activation)
   - Builder page (Craft.js integration)

4. **Demander à l'agent:**
   - "Guide-moi sur l'architecture autosave pour le builder"
   - "Comment structurer le schema Supabase pour Blooprint ?"
   - "Propose une roadmap Sprint 0 → Sprint 1"

### Fichiers Créés:

**Localisation:** `_bmad-output/bmb-creations/blooprint/`

- `project-context.yaml` - Documentation business complète
- `agent-spec.yaml` - Specification agent validée
- `blooprint-fullstack-expert-vscode.md` - Agent VSCode
- `interview-summary.md` - Ce document

**Localisation:** `_bmad/bmb/agents/`

- `blooprint-fullstack-expert.md` - Agent GitHub Copilot CLI

---

## Interview Statistics

**Total Duration:** 65 minutes  
**Phase 1 (Context):** ~20 minutes  
**Phase 2 (Business):** ~20 minutes  
**Phase 3 (Agent Needs):** ~15 minutes  
**Phase 4 (Validation):** ~10 minutes

**Questions Asked:** ~35 questions  
**Challenges Issued:** 10 challenges (5 majeurs)  
**Decisions Made:** 13 décisions clés  
**Glossary Terms:** 8 concepts  
**Business Rules:** 11 règles  
**Processes:** 8 processus  
**Actors:** 3 acteurs  
**Capabilities:** 5 capacités  
**Mantras:** 13 mantras  
**Use Cases:** 9 use cases  

**Validation Status:** ✅ ALL PASSED

---

**Created by:** BYAN-TEST  
**Date:** 2026-02-09  
**Interview Methodology:** 4-Phase Intelligent Interview (Merise Agile + TDD + 64 Mantras)  
**Project:** Blooprint - Builder Portfolio UGC SaaS  
**User:** TOM$
