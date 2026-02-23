# EPIC-05 — Freemium & Billing (Stripe)

**Priorité d'implémentation :** 6
**Statut :** A faire
**Mantras actifs :** #4 Fail Fast, #18 TDD, #39 Conséquences, IA-16 Challenge
**Dépendances :** EPIC-09 (Stripe configuré), EPIC-01 (users avec plan), EPIC-04 (portfolio limits)

---

## Objectif

Implémenter le système de billing complet : upgrade Free → Premium, abonnements Stripe (mensuel/annuel), gestion trial, webhooks, downgrade graceful et refund policy 14 jours.

**Challenge critique (Mantra IA-16 + #39 Conséquences) :** Les webhooks Stripe sont la pièce la plus critique — ils synchronisent l'état de l'abonnement avec Supabase. Un bug ici = utilisateurs avec mauvais accès ou paiements non reconnus. Tester exhaustivement avec Stripe CLI.

---

## User Stories

---

### US-501 : Page Pricing

**En tant que** créateur en Free
**Je veux** voir clairement la comparaison Free vs Premium
**Afin de** décider si l'upgrade vaut l'investissement

**Critères d'acceptance :**

- [ ] CA-1 : Page `/pricing` accessible publiquement et depuis le dashboard
- [ ] CA-2 : Tableau comparatif Free vs Premium avec toutes les features
- [ ] CA-3 : Toggle mensuel / annuel avec calcul économies annuel (ex: "Économise 29€/an")
- [ ] CA-4 : Prix affichés clairement : 9€/mois ou 79€/an
- [ ] CA-5 : CTA "Commencer le Premium" → vers checkout Stripe
- [ ] CA-6 : Si en trial actif : badge "Tu profites du Premium" + jours restants
- [ ] CA-7 : Si déjà Premium : bouton "Gérer mon abonnement" → Stripe Customer Portal

**Priorité :** High
**Effort estimé :** 2-3h

---

### US-502 : Upgrade Free → Premium (Checkout Stripe)

**En tant que** créateur en Free (ou trial expiré)
**Je veux** upgrader vers Premium via un paiement sécurisé
**Afin de** débloquer composants illimités, 3 portfolios et analytics avancées

**Critères d'acceptance :**

- [ ] CA-1 : API Route `POST /api/billing/checkout` → créé une Stripe Checkout Session
- [ ] CA-2 : Si pas de `stripe_customer_id` → créer un Stripe Customer + sauver ID dans `profiles`
- [ ] CA-3 : Redirect vers Stripe Checkout (hébergé par Stripe pour sécurité PCI)
- [ ] CA-4 : `success_url` = `/dashboard?upgraded=true`, `cancel_url` = `/pricing`
- [ ] CA-5 : Mode abonnement avec `trial_period_days: 0` (trial géré en amont par Blooprint)
- [ ] CA-6 : Si en trial actif → checkout en mode "commence à la fin du trial"
- [ ] CA-7 : `metadata` Stripe : `userId` pour associer paiement à l'utilisateur

**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-503 : Webhooks Stripe

**En tant que** système Blooprint
**Je veux** recevoir et traiter les événements Stripe
**Afin de** synchroniser le statut d'abonnement en temps réel dans Supabase

**Critères d'acceptance :**

- [ ] CA-1 : Endpoint `POST /api/webhooks/stripe` vérifie signature Stripe (header `stripe-signature`)
- [ ] CA-2 : Signature invalide → 400 immédiat, log sécurité
- [ ] CA-3 : `customer.subscription.created` → créer/update `subscriptions`, `profiles.plan = 'premium'`
- [ ] CA-4 : `customer.subscription.updated` → update status, `current_period_end`
- [ ] CA-5 : `customer.subscription.deleted` → `profiles.plan = 'free'`, trigger downgrade graceful
- [ ] CA-6 : `invoice.payment_failed` → log + prépare downgrade si past_due prolongé
- [ ] CA-7 : Idempotence : vérifier si event déjà traité (stocker event ID dans BDD) — éviter double traitement
- [ ] CA-8 : Réponse `200` immédiate à Stripe (timeout 5s max) — processing async si besoin
- [ ] CA-9 : Stripe CLI utilisé pour tester tous les events localement

**Priorité :** Critical
**Effort estimé :** 5-6h

---

### US-504 : Downgrade Premium → Free (Graceful)

**En tant que** créateur qui annule son abonnement Premium
**Je veux** un downgrade propre qui préserve mes données
**Afin de** ne pas perdre mes portfolios (même si certains sont suspendus)

**Critères d'acceptance :**

- [ ] CA-1 : Annulation Stripe → webhook `subscription.deleted` → downgrade déclenché
- [ ] CA-2 : Si créateur a > 1 portfolio : UI `/downgrade` → "Choisis le portfolio à garder actif"
- [ ] CA-3 : Les autres portfolios passent à `status = 'suspended'` (non accessibles publiquement)
- [ ] CA-4 : Portfolio en `suspended` : créateur voit dans dashboard "Suspendu — Upgrade pour réactiver"
- [ ] CA-5 : Re-upgrade Premium → portfolios suspendus réactivés automatiquement
- [ ] CA-6 : Portfolios suspendus pendant > 6 mois → email warning "Tes portfolios seront supprimés sous 30 jours"
- [ ] CA-7 : `profiles.plan` = `'free'`
- [ ] CA-8 : Email notification envoyé au créateur lors du downgrade effectif

**Règles :** RG-004
**Priorité :** High
**Effort estimé :** 4-5h

---

### US-505 : Stripe Customer Portal (Gestion abonnement)

**En tant que** créateur Premium
**Je veux** gérer mon abonnement (annuler, changer de plan, voir factures)
**Afin d'** avoir le contrôle complet sur ma facturation

**Critères d'acceptance :**

- [ ] CA-1 : API Route `POST /api/billing/portal` → créé une Stripe Customer Portal Session
- [ ] CA-2 : Redirect vers Stripe Customer Portal (hébergé Stripe)
- [ ] CA-3 : Depuis le portal : annuler, changer mensuel↔annuel, voir historique factures
- [ ] CA-4 : `return_url` = `/settings/billing`
- [ ] CA-5 : Bouton "Gérer mon abonnement" accessible depuis `/settings/billing`

**Priorité :** High
**Effort estimé :** 1-2h

---

### US-506 : Limites Free en temps réel

**En tant que** créateur Free
**Je veux** des indications claires quand j'atteins les limites Free
**Afin de** comprendre ce que je dois upgrader pour continuer

**Critères d'acceptance :**

- [ ] CA-1 : Composants limit (RG-005) : bannière dans builder dès 5/6 composants, blocage à 6
- [ ] CA-2 : Portfolio limit (RG-004) : bouton "Créer portfolio" désactivé si déjà 1 portfolio
- [ ] CA-3 : Storage limit (RG-006) : warning upload si > 80% quota, blocage si 100%
- [ ] CA-4 : Chaque limite affiche un CTA "Upgrade Premium" qui redirige vers `/pricing`
- [ ] CA-5 : Vérification côté serveur (jamais côté client uniquement — sécurité)

**Règles :** RG-004, RG-005, RG-006
**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-507 : Refund Policy 14 jours

**En tant que** créateur Premium insatisfait dans les 14 jours
**Je veux** être remboursé selon la politique de remboursement
**Afin de** m'engager sans risque financier

**Critères d'acceptance :**

- [ ] CA-1 : Politique refund affichée clairement sur la page pricing et checkout
- [ ] CA-2 : Dans les 14 jours après premier paiement → remboursement possible via support (email TOM$)
- [ ] CA-3 : Remboursement traité manuellement via Stripe Dashboard (MVP — pas d'automatisation)
- [ ] CA-4 : Après remboursement Stripe → webhook `charge.refunded` → downgrade automatique
- [ ] CA-5 : CGV mentionnent la refund policy légalement (template à jour)

**Priorité :** Medium
**Effort estimé :** 1h (process) + 2h (légal CGV)

---

## Schema BDD complémentaire

```sql
-- Ajouts table subscriptions
stripe_event_ids text[] default '{}', -- idempotence des webhooks
canceled_at timestamptz,
cancel_at_period_end boolean default false
```

---

## Tests critiques (Mantra #18 TDD)

```
- test: webhook signature invalide → 400 rejeté
- test: subscription.created → plan = 'premium' dans profiles
- test: subscription.deleted → downgrade Free + portfolios suspendus si > 1
- test: event déjà reçu → idempotence respectée (pas de double traitement)
- test: composant 7 dans builder Free → blocage
- test: création 2ème portfolio Free → blocage
- test: re-upgrade → portfolios suspendus réactivés
```

---

## Checklist de validation Epic

- [ ] Checkout Stripe fonctionne (test mode)
- [ ] Tous les webhooks testés avec Stripe CLI
- [ ] Downgrade graceful : portfolios suspendus, pas supprimés
- [ ] Limites Free bloquées côté serveur (pas uniquement frontend)
- [ ] Customer Portal accessible depuis settings
- [ ] Aucune donnée CB stockée côté Blooprint (PCI compliance via Stripe)
