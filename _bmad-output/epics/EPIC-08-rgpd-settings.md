# EPIC-08 — RGPD & Settings

**Priorité d'implémentation :** 9 (dernier avant launch)
**Statut :** A faire
**Mantras actifs :** #4 Fail Fast, #39 Conséquences, IA-24 Clean Code
**Dépendances :** Toutes les autres Epics

---

## Objectif

Assurer la conformité RGPD de Blooprint et fournir aux créateurs les outils pour gérer leur compte (export données, suppression, paramètres profil) et à la plateforme un système de modération basique.

**Importance (Mantra #39 Conséquences) :** Non-conformité RGPD = risque légal réel pour TOM$ (amende CNIL). Budget 0€ mais la conformité est non-négociable, même pour un MVP. Les outils RGPD sont aussi une feature de confiance pour les utilisateurs.

---

## User Stories

---

### US-801 : Cookie Consent Banner

**En tant que** visiteur ou créateur
**Je veux** être informé de l'utilisation des cookies et pouvoir accepter/refuser
**Afin de** contrôler ma vie privée conforme au RGPD

**Critères d'acceptance :**

- [ ] CA-1 : Banner cookies affiché à la première visite (avant tout tracking)
- [ ] CA-2 : Options : "Accepter tout" / "Refuser tout" / "Personnaliser" (MVP = accept/refuse suffit)
- [ ] CA-3 : Si refus → aucun cookie de tracking déposé, analytics désactivées
- [ ] CA-4 : Choix persisté dans `localStorage` (pas de cookie ironique)
- [ ] CA-5 : Lien vers Politique de Confidentialité depuis le banner
- [ ] CA-6 : Pas de pré-cochage des cases non essentielles
- [ ] CA-7 : Cookies essentiels (session auth Supabase) exemptés du consentement, mentionnés clairement

**Règles :** RG-009
**Priorité :** Critical
**Effort estimé :** 2-3h

---

### US-802 : Politique de Confidentialité & CGU

**En tant que** créateur ou visiteur
**Je veux** accéder aux documents légaux de Blooprint
**Afin de** comprendre comment mes données sont utilisées

**Critères d'acceptance :**

- [ ] CA-1 : Page `/legal/privacy` : Politique de Confidentialité (RGPD compliant)
- [ ] CA-2 : Page `/legal/terms` : CGU (utilisation acceptable, contenu interdit, modération)
- [ ] CA-3 : Pages accessibles via footer public et footer dashboard
- [ ] CA-4 : CGU acceptées à l'inscription (checkbox obligatoire sur signup)
- [ ] CA-5 : Documents incluent : données collectées, finalités, durée conservation, droits utilisateur, DPO (TOM$), refund policy
- [ ] CA-6 : Documents rédigés en français (droit applicable : France)

**Règles :** RG-009, RG-011
**Priorité :** Critical
**Effort estimé :** 2h (rédaction) + 1h (intégration)

---

### US-803 : Export données RGPD (Right to Portability)

**En tant que** créateur
**Je veux** exporter toutes mes données personnelles
**Afin d'** exercer mon droit à la portabilité des données (RGPD Art. 20)

**Critères d'acceptance :**

- [ ] CA-1 : Bouton "Exporter mes données" dans `/settings/privacy`
- [ ] CA-2 : Export JSON incluant : profil (username, email, créé le), portfolios (states Craft.js, statuts), analytics (vues, clics), abonnement (plan, dates)
- [ ] CA-3 : Génération asynchrone + email avec lien de téléchargement (ou download direct si < 5MB)
- [ ] CA-4 : Lien de téléchargement valide 24h (sécurisé, signé)
- [ ] CA-5 : Rate limit : 1 export par 24h par utilisateur
- [ ] CA-6 : Données sensibles (Stripe) non exportées directement (lien vers Stripe portal pour factures)

**Règles :** RG-009
**Priorité :** High
**Effort estimé :** 3-4h

---

### US-804 : Suppression de compte (Right to Erasure)

**En tant que** créateur
**Je veux** supprimer définitivement mon compte et toutes mes données
**Afin d'** exercer mon droit à l'effacement (RGPD Art. 17)

**Critères d'acceptance :**

- [ ] CA-1 : Bouton "Supprimer mon compte" dans `/settings/account` (zone danger)
- [ ] CA-2 : Confirmation en 2 étapes : modal + "Tape ton email pour confirmer"
- [ ] CA-3 : Soft delete : `profiles.deleted_at = now()`, compte inaccessible immédiatement
- [ ] CA-4 : Portfolios → soft delete simultané (status = 'deleted')
- [ ] CA-5 : Hard delete après 30 jours : profil, portfolios, médias Supabase Storage, analytics
- [ ] CA-6 : Données Stripe : subscription annulée, pas supprimée (obligation légale conserver factures 10 ans)
- [ ] CA-7 : Email de confirmation de suppression envoyé
- [ ] CA-8 : Session invalidée immédiatement après suppression

**Règles :** RG-009, RG-010
**Priorité :** High
**Effort estimé :** 3-4h

---

### US-805 : Settings profil

**En tant que** créateur
**Je veux** gérer mes informations de profil
**Afin de** maintenir mes informations à jour

**Critères d'acceptance :**

- [ ] CA-1 : Page `/settings/profile` accessible depuis le dashboard
- [ ] CA-2 : Champs modifiables : username (avec warning RG-001), photo de profil (avatar global)
- [ ] CA-3 : Champ email : affiché en lecture seule (changement V0.2+)
- [ ] CA-4 : Changement password : "Ancien mot de passe" + "Nouveau" + "Confirmer"
- [ ] CA-5 : Sauvegarde avec feedback "Profil mis à jour" (toast notification)
- [ ] CA-6 : Validation formats identique à l'inscription (username RG-001)

**Priorité :** Medium
**Effort estimé :** 2-3h

---

### US-806 : Settings billing

**En tant que** créateur
**Je veux** voir et gérer mon abonnement depuis les settings
**Afin d'** avoir une vue claire de ma facturation

**Critères d'acceptance :**

- [ ] CA-1 : Page `/settings/billing` avec : plan actuel, date prochain renouvellement, statut abonnement
- [ ] CA-2 : Si Free : CTA "Passer Premium" → `/pricing`
- [ ] CA-3 : Si Premium : "Gérer mon abonnement" → Stripe Customer Portal
- [ ] CA-4 : Si trial : "Trial actif — X jours restants, passe Premium avant expiration"
- [ ] CA-5 : Historique factures accessible via lien Stripe portal (pas intégré nativement MVP)

**Priorité :** High
**Effort estimé :** 1-2h

---

### US-807 : Signalement contenu (Modération)

**En tant que** visiteur d'un portfolio
**Je veux** signaler un contenu inapproprié
**Afin de** contribuer à la sécurité de la plateforme

**Critères d'acceptance :**

- [ ] CA-1 : Petit lien "Signaler" discret en bas de chaque page portfolio public
- [ ] CA-2 : Modal signalement : sélection motif (Contenu NSFW, Haineux/Discriminant, Spam/Escroquerie, Autre) + champ texte optionnel
- [ ] CA-3 : Signalement stocké dans BDD : `reports` table (portfolio_id, motif, description, créé_at, IP hashée)
- [ ] CA-4 : Notification email à TOM$ (admin) à chaque signalement
- [ ] CA-5 : Pas d'interface d'administration en MVP (TOM$ gère manuellement depuis Supabase)
- [ ] CA-6 : Max 3 signalements par IP/24h (anti-abus)

**Règles :** RG-011
**Priorité :** Medium
**Effort estimé :** 2-3h

---

## Schema BDD complémentaire

```sql
reports (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios(id) not null,
  motif text not null, -- 'nsfw' | 'haineux' | 'spam' | 'autre'
  description text,
  reporter_hash text, -- hash IP reporter
  status text default 'pending', -- 'pending' | 'reviewed' | 'dismissed' | 'actioned'
  created_at timestamptz default now()
)
```

---

## Hors scope MVP (V0.2+)

- Changement email (notifications re-confirmation)
- Interface d'administration dédiée (dashboard admin)
- 2FA (Two-Factor Authentication)
- Multi-sessions management
- Historique connexions (IPs, dates)
- Audit log complet
- DPA (Data Processing Agreement) pour clients entreprise

---

## Checklist de validation Epic

- [ ] Cookie consent bloque tracking si refus
- [ ] Export JSON contient toutes les données du créateur
- [ ] Suppression compte → soft delete immédiat + hard delete 30j schedulé
- [ ] CGU/Privacy Policy accessible depuis footer
- [ ] Settings profil sauvegarde correctement
- [ ] Signalement reçu → email TOM$
- [ ] Audit RGPD baseline passé (checklist CNIL)
