# EPIC-12 — Interface d'Administration Blooprint

**Priorité d'implémentation :** Post-MVP / Opérations
**Statut :** A faire
**Mantras actifs :** #4 Fail Fast, #39 Conséquences, IA-24 Clean Code
**Dépendances :** EPIC-01 (auth), EPIC-05 (billing), EPIC-06 (analytics), EPIC-08 (reports)

---

## Objectif

Fournir à TOM$ une interface d'administration complète pour piloter Blooprint : modérer les contenus signalés, gérer les utilisateurs et abonnements, suivre les métriques business (MRR, signups, churn), et intervenir manuellement quand nécessaire — sans devoir passer par Supabase Studio ou le dashboard Stripe.

**Valeur (Mantra IA-3) :** Chaque minute passée à chercher une info dans Supabase Studio = temps perdu. Un admin dashboard dédié = réactivité modération (RGPD obligatoire), visibilité MRR en temps réel, et autonomie opérationnelle.

---

## Architecture

```
src/app/admin/
├── layout.tsx          # Guard super-admin + sidebar nav
├── page.tsx            # Dashboard overview (KPIs)
├── users/
│   ├── page.tsx        # Liste users avec filtres
│   └── [id]/page.tsx   # Détail user (profil + portfolios + sub)
├── portfolios/
│   ├── page.tsx        # Liste portfolios avec filtres
│   └── [id]/page.tsx   # Détail portfolio (preview + actions)
├── reports/
│   └── page.tsx        # Queue de modération
├── billing/
│   └── page.tsx        # MRR, churn, revenus
└── settings/
    └── page.tsx        # Config admin (emails notif, etc.)
```

**Sécurité :** Route protégée par middleware — seuls les `profiles.role = 'admin'` peuvent accéder à `/admin/*`. Tous les appels BDD via `createAdminClient()` (service role, bypass RLS).

---

## User Stories

---

### US-1201 : Dashboard Overview (KPIs temps réel)

**En tant que** TOM$ (admin)
**Je veux** voir les métriques clés de Blooprint en un coup d'œil
**Afin de** piloter le business au quotidien

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin` affiche les KPIs suivants :
  - **Utilisateurs** : total, signups 7j, signups 30j, actifs 7j
  - **Portfolios** : total, publiés, drafts, suspendus
  - **Revenue** : MRR actuel, MRR 30j précédent, croissance %, ARR estimé
  - **Abonnements** : premium actifs, trials actifs, churn 30j, conversion trial→premium
  - **Signalements** : pending, traités 7j
- [ ] CA-2 : Cards KPI avec code couleur (vert = croissance, rouge = baisse, neutre = stable)
- [ ] CA-3 : Mini sparkline charts pour trends 30j (signups, MRR) — CSS-only ou lightweight
- [ ] CA-4 : Refresh auto toutes les 60s ou bouton refresh manuel
- [ ] CA-5 : Data fetched via server actions (pas d'API routes supplémentaires)
- [ ] CA-6 : Durée de chargement < 2s

**Priorité :** Critical
**Effort estimé :** 4-5h

---

### US-1202 : Gestion des utilisateurs

**En tant que** admin
**Je veux** lister, rechercher et gérer les comptes utilisateurs
**Afin de** supporter les créateurs et intervenir si nécessaire

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin/users` : liste paginée (20/page) avec colonnes : avatar, username, email, plan, signups date, portfolios count, status
- [ ] CA-2 : Barre de recherche : par username, email (recherche partielle `ILIKE`)
- [ ] CA-3 : Filtres : plan (free/trial/premium/all), statut (actif/supprimé), période signup
- [ ] CA-4 : Tri : par date signup, nom, plan
- [ ] CA-5 : Actions rapides depuis la liste :
  - Changer le plan manuellement (free → premium, etc.)
  - Étendre le trial (+7j, +14j, +30j)
  - Suspendre / réactiver le compte
- [ ] CA-6 : Page détail `/admin/users/[id]` :
  - Infos profil complètes
  - Liste des portfolios (avec liens vers preview)
  - Historique abonnement (Stripe subscription events)
  - Historique signalements émis/reçus
  - Boutons : modifier plan, reset password, supprimer compte
- [ ] CA-7 : Confirmation modale pour toutes les actions destructives
- [ ] CA-8 : Log d'audit : chaque action admin enregistrée (qui, quoi, quand)

**Priorité :** Critical
**Effort estimé :** 6-8h

---

### US-1203 : Gestion des portfolios

**En tant que** admin
**Je veux** lister et modérer les portfolios
**Afin de** m'assurer que le contenu respecte les CGU

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin/portfolios` : liste paginée avec : titre, slug, statut, créateur, created_at, vues totales
- [ ] CA-2 : Filtres : statut (published/draft/suspended/deleted), signalé (oui/non)
- [ ] CA-3 : Recherche par titre ou slug
- [ ] CA-4 : Actions rapides :
  - Voir le portfolio (preview dans un iframe ou onglet)
  - Suspendre le portfolio (+ notification email au créateur)
  - Dépublier → draft
  - Supprimer définitivement
- [ ] CA-5 : Page détail `/admin/portfolios/[id]` :
  - Preview du portfolio (StaticPortfolioRenderer)
  - Infos : créateur, statut, dates, analytics basiques
  - Historique signalements liés
  - Actions de modération
- [ ] CA-6 : Badge "signalé" visible sur les portfolios avec reports pending
- [ ] CA-7 : Action "Approuver le contenu" (clear tous les reports)

**Priorité :** High
**Effort estimé :** 5-6h

---

### US-1204 : Queue de modération (Signalements)

**En tant que** admin
**Je veux** traiter les signalements de contenu efficacement
**Afin de** maintenir la sécurité de la plateforme et rester RGPD compliant

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin/reports` : queue de modération triée par date (plus ancien en premier)
- [ ] CA-2 : Chaque report affiche : motif (badge couleur), description, date, portfolio concerné, preview thumbnail
- [ ] CA-3 : Filtres : statut (pending/reviewed/dismissed/actioned), motif (nsfw/haineux/spam/autre)
- [ ] CA-4 : Actions par report :
  - **Dismiss** : marquer comme non-fondé (`status = 'dismissed'`)
  - **Reviewed** : vu mais pas d'action (`status = 'reviewed'`)
  - **Action** : suspendre le portfolio + marquer `status = 'actioned'`
  - **Action + Ban** : suspendre portfolio + suspendre le compte créateur
- [ ] CA-5 : Preview inline du portfolio signalé (accordéon ou panneau latéral)
- [ ] CA-6 : Compteur de reports pending dans la sidebar admin (badge rouge)
- [ ] CA-7 : Email automatique au créateur quand son portfolio est suspendu pour violation
- [ ] CA-8 : Historique des actions de modération (qui a traité, quand, quelle décision)

**Priorité :** Critical
**Effort estimé :** 4-5h

---

### US-1205 : Dashboard Billing / Revenue

**En tant que** admin
**Je veux** suivre les revenus et la santé financière de Blooprint
**Afin de** prendre des décisions business éclairées

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin/billing` avec :
  - **MRR** (Monthly Recurring Revenue) calculé depuis subscriptions actives
  - **ARR** (Annual Recurring Revenue) = MRR × 12
  - **Churn rate** 30j : abonnements annulés / total abonnements
  - **ARPU** (Average Revenue Per User) = MRR / users premium
  - **LTV estimé** = ARPU / churn rate mensuel
- [ ] CA-2 : Graphique MRR sur les 6 derniers mois (bar chart CSS ou lightweight)
- [ ] CA-3 : Liste des dernières transactions (subscriptions created/canceled/renewed)
- [ ] CA-4 : Split mensuel vs annuel : nombre d'abonnés, revenu par type
- [ ] CA-5 : Liste des abonnements en `past_due` ou `incomplete` (à surveiller)
- [ ] CA-6 : Lien rapide vers Stripe Dashboard pour chaque subscription
- [ ] CA-7 : Calcul net après frais Stripe (2.2% + 0.25€ carte + 0.7% Billing)

**Priorité :** High
**Effort estimé :** 4-5h

---

### US-1206 : Admin Layout & Guard de sécurité

**En tant que** admin
**Je veux** un layout dédié et sécurisé pour l'interface admin
**Afin de** naviguer efficacement et empêcher les accès non autorisés

**Critères d'acceptance :**

- [ ] CA-1 : Layout `/admin/layout.tsx` :
  - Sidebar gauche fixe avec navigation : Overview, Users, Portfolios, Reports (badge), Billing, Settings
  - Header avec nom admin, bouton retour dashboard, logout
  - Design distinct du front (plus sombre, police mono, accents rouge/orange pour admin)
- [ ] CA-2 : Guard de sécurité :
  - Vérifier `profiles.role = 'admin'` (nouveau champ)
  - Redirect vers `/dashboard` si non-admin
  - Toutes les server actions admin vérifient le rôle
- [ ] CA-3 : `middleware.ts` mis à jour : `/admin/*` requiert auth
- [ ] CA-4 : Migration BDD : ajouter `role text default 'user' check (role in ('user', 'admin'))` à `profiles`
- [ ] CA-5 : Responsive : sidebar collapse en burger menu sur mobile (mais admin = principalement desktop)
- [ ] CA-6 : Breadcrumbs pour la navigation contextuelle

**Priorité :** Critical (pré-requis pour tout le reste)
**Effort estimé :** 3-4h

---

### US-1207 : Actions email admin

**En tant que** admin
**Je veux** envoyer des emails depuis l'interface admin
**Afin de** communiquer directement avec les créateurs

**Critères d'acceptance :**

- [ ] CA-1 : Action "Contacter le créateur" depuis la page user → ouvre un composer simple
- [ ] CA-2 : Templates email prédéfinis :
  - Bienvenue / onboarding tips
  - Violation CGU (portfolio suspendu)
  - Compte supprimé (confirmation)
  - Relance trial expirant
- [ ] CA-3 : Email envoyé via Supabase Edge Functions ou Resend (API simple)
- [ ] CA-4 : Log de l'email envoyé dans l'historique admin
- [ ] CA-5 : MVP : `mailto:` link avec template pré-rempli si pas de service email configuré

**Priorité :** Medium
**Effort estimé :** 3-4h

---

### US-1208 : Admin Settings & Configuration

**En tant que** admin
**Je veux** configurer certains paramètres de la plateforme
**Afin de** ajuster le comportement sans modifier le code

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin/settings` avec :
  - **Trial duration** : modifiable (défaut 7 jours)
  - **Max portfolios free/premium** : modifiable
  - **Max blocks free** : modifiable
  - **Maintenance mode** : toggle on/off (affiche banner "maintenance" sur toutes les pages)
- [ ] CA-2 : Config stockée dans table `app_config` (key/value) ou dans une table dédiée
- [ ] CA-3 : Changements appliqués immédiatement (pas de restart nécessaire)
- [ ] CA-4 : Historique des changements de config (qui, quand, ancienne/nouvelle valeur)
- [ ] CA-5 : Bouton "Reset to defaults"

**Priorité :** Low
**Effort estimé :** 3h

---

### US-1209 : Audit Log

**En tant que** admin
**Je veux** un historique complet de toutes les actions admin
**Afin de** tracer les interventions pour la conformité RGPD et la transparence

**Critères d'acceptance :**

- [ ] CA-1 : Table `admin_audit_log` :
  ```sql
  admin_audit_log (
    id uuid primary key default gen_random_uuid(),
    admin_id uuid references profiles(id) not null,
    action text not null,           -- 'user.plan_changed', 'portfolio.suspended', 'report.actioned', etc.
    target_type text not null,      -- 'user', 'portfolio', 'report', 'config'
    target_id text not null,        -- UUID de la cible
    details jsonb,                  -- { old_value, new_value, reason }
    created_at timestamptz default now()
  )
  ```
- [ ] CA-2 : Chaque server action admin insère un log automatiquement
- [ ] CA-3 : Page `/admin/settings` inclut section "Audit Log" avec liste paginée des 100 derniers logs
- [ ] CA-4 : Filtrable par action type, target type, admin, date range
- [ ] CA-5 : Non supprimable (append-only, pas de UPDATE/DELETE policy)

**Priorité :** Medium
**Effort estimé :** 3h

---

## Schema BDD complémentaire

```sql
-- Nouveau champ dans profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- Table de configuration
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- Valeurs par défaut
INSERT INTO app_config (key, value) VALUES
  ('trial_duration_days', '7'),
  ('max_portfolios_free', '1'),
  ('max_portfolios_premium', '5'),
  ('max_blocks_free', '6'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- Audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS : admin-only
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_audit_log: admin only"
  ON admin_audit_log FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config: admin only"
  ON app_config FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

---

## Stack technique

- **Layout** : Server Components (données serveur via `createAdminClient()`)
- **Actions** : Server Actions uniquement (pas d'API routes)
- **Charts** : CSS-only mini charts (sparklines, bar charts) — pas de lib externe (Recharts hors scope MVP)
- **Pagination** : `searchParams` URL-based (server-side)
- **Recherche** : Supabase `ilike` + index GIN si needed
- **Email** : Resend ou `mailto:` fallback
- **Styling** : Tailwind, même design system mais accent orange/rouge pour distinguer de l'app

---

## Hors scope (V0.3+)

- Dashboard analytics avancé (Mixpanel/PostHog intégration)
- Interface bulk actions (sélection multiple + action groupée)
- Notifications push admin (Slack webhook, Discord)
- API REST admin pour intégration externe
- Export CSV des données admin
- Role-based access (multiple admin roles: modérateur, billing, super-admin)
- Cron jobs automatisés (hard delete 30j, trial expiration emails)
- Real-time updates (Supabase Realtime subscriptions)

---

## Ordre d'implémentation recommandé

1. **US-1206** — Layout + guard + migration `role` (pré-requis)
2. **US-1201** — Dashboard overview KPIs
3. **US-1204** — Queue de modération (priorité RGPD)
4. **US-1202** — Gestion utilisateurs
5. **US-1203** — Gestion portfolios
6. **US-1205** — Dashboard billing
7. **US-1209** — Audit log
8. **US-1207** — Emails admin
9. **US-1208** — Settings config

---

## Checklist de validation Epic

- [ ] `/admin` accessible uniquement aux users avec `role = 'admin'`
- [ ] Non-admin redirigé vers `/dashboard`
- [ ] KPIs affichés correctement et en temps réel
- [ ] Reports traités → portfolio suspendu + email envoyé
- [ ] Changement de plan user → effectif immédiatement
- [ ] MRR calculé correctement depuis subscriptions
- [ ] Audit log trace toutes les actions admin
- [ ] Responsive sur desktop (mobile = bonus)
- [ ] Performance < 2s par page admin
- [ ] Aucune fuite de données (guard sur chaque server action)
