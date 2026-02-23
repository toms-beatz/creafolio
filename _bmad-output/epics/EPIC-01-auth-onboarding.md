# EPIC-01 — Auth & Onboarding

**Priorité d'implémentation :** 2
**Statut :** Terminé
**Mantras actifs :** #4 Fail Fast Fail Visible, #7 KISS, #18 TDD, IA-16 Challenge
**Dépendances :** EPIC-09 (Supabase configuré, schema BDD existant)

---

## Objectif

Permettre à un créateur UGC de s'inscrire, se connecter, confirmer son email, choisir un username unique, et bénéficier automatiquement d'un trial Premium 7 jours. Gérer également la session persistante et la déconnexion.

**Pourquoi en second (Mantra #37 Ockham) :** Sans auth, aucune autre feature n'a de sens. C'est la porte d'entrée de tout le SaaS.

---

## User Stories

---

### US-101 : Inscription créateur

**En tant que** créateur UGC
**Je veux** créer un compte Blooprint avec mon email et un mot de passe
**Afin de** accéder au builder et créer mon portfolio

**Critères d'acceptance :**

- [ ] CA-1 : Formulaire signup : champs `email`, `password`, `confirmPassword`
- [ ] CA-2 : Validation frontend : email format valide, password >= 8 caractères, passwords identiques
- [ ] CA-3 : Supabase Auth crée le compte → email de confirmation envoyé automatiquement
- [ ] CA-4 : Si email déjà utilisé → erreur explicite "Un compte existe déjà avec cet email" + lien vers login
- [ ] CA-5 : Compte non confirmé ne peut pas accéder au builder (middleware guard)
- [ ] CA-6 : Profil `profiles` créé automatiquement via Supabase trigger (sans username encore)
- [ ] CA-7 : Redirect vers page "Vérifie ton email" après signup

**Règles :** RG-002
**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-102 : Confirmation email

**En tant que** créateur UGC
**Je veux** confirmer mon adresse email via le lien reçu
**Afin de** activer mon compte et accéder au builder

**Critères d'acceptance :**

- [ ] CA-1 : Email de confirmation envoyé depuis Supabase Auth (template personnalisable)
- [ ] CA-2 : Clic sur lien → validation token → redirect vers setup username
- [ ] CA-3 : Token expiré (> 24h) → message clair + bouton "Renvoyer l'email"
- [ ] CA-4 : Ne peut pas accéder à `/dashboard` sans email confirmé
- [ ] CA-5 : Pas de resend spam : max 3 renvois par heure par email

**Règles :** RG-002
**Priorité :** Critical
**Effort estimé :** 1-2h

---

### US-103 : Choix username

**En tant que** créateur UGC
**Je veux** choisir un username unique pour mon profil
**Afin que** mon portfolio soit accessible à `blooprint.fr/[username]`

**Critères d'acceptance :**

- [ ] CA-1 : Page `/setup/username` après confirmation email (étape obligatoire)
- [ ] CA-2 : Validation format : `/^[a-z0-9-]{3,30}$/` (lowercase, chiffres, tirets uniquement)
- [ ] CA-3 : Vérification unicité en temps réel (debounce 500ms → API check)
- [ ] CA-4 : Username déjà pris → message "Ce username est déjà utilisé" + 3 suggestions automatiques
- [ ] CA-5 : Race condition protégée : transaction SQL avec contrainte `UNIQUE` sur colonne
- [ ] CA-6 : Username sauvegardé dans `profiles.username` → redirect vers `/dashboard`
- [ ] CA-7 : Username displayed as `blooprint.fr/[username]` en preview sous le champ

**Règles :** RG-001
**Priorité :** Critical
**Effort estimé :** 2-3h

---

### US-104 : Activation trial Premium 7 jours

**En tant que** créateur UGC
**Je veux** bénéficier automatiquement d'un trial Premium 7 jours à l'inscription
**Afin de** découvrir toutes les features Premium sans engagement

**Critères d'acceptance :**

- [ ] CA-1 : À la fin du setup username → trial activé automatiquement (sans CB requise)
- [ ] CA-2 : `profiles.plan` = `'trial'`, `profiles.trial_ends_at` = `now() + 7 days`
- [ ] CA-3 : Banner dans le dashboard : "Trial Premium actif — X jours restants"
- [ ] CA-4 : Si même email utilisé sur ancien compte → pas de nouveau trial (RG-003)
- [ ] CA-5 : À l'expiration du trial → downgrade automatique vers `'free'` (cron job ou check au login)
- [ ] CA-6 : Email de rappel J-2 avant expiration (optionnel MVP, peut être manuel)
- [ ] CA-7 : Comportement correct si trial expire pendant une session active (refresh abilities)

**Règles :** RG-003
**Priorité :** High
**Effort estimé :** 2-3h

---

### US-105 : Connexion créateur

**En tant que** créateur UGC
**Je veux** me connecter avec mon email et mot de passe
**Afin de** retrouver mon portfolio et continuer à travailler dessus

**Critères d'acceptance :**

- [ ] CA-1 : Formulaire login : champs `email`, `password`
- [ ] CA-2 : Connexion via Supabase Auth (`signInWithPassword`)
- [ ] CA-3 : Échec login → message générique "Email ou mot de passe incorrect" (pas de leak info)
- [ ] CA-4 : Compte non confirmé → message spécifique + lien renvoi email
- [ ] CA-5 : Session persistante : cookie httpOnly géré par `@supabase/ssr`
- [ ] CA-6 : Redirect post-login vers `/dashboard` (ou page demandée avant redirect)
- [ ] CA-7 : Après 5 tentatives échouées → message "Attends X secondes" (Supabase rate limiting)

**Priorité :** Critical
**Effort estimé :** 2h

---

### US-106 : Mot de passe oublié

**En tant que** créateur UGC
**Je veux** réinitialiser mon mot de passe si je l'ai oublié
**Afin de** récupérer l'accès à mon compte

**Critères d'acceptance :**

- [ ] CA-1 : Lien "Mot de passe oublié ?" sur page login
- [ ] CA-2 : Formulaire reset : champ email → email de reset envoyé
- [ ] CA-3 : Si email non trouvé → message neutre "Si ce compte existe, un email a été envoyé" (pas de leak)
- [ ] CA-4 : Clic lien reset → page nouveau mot de passe (token valide 1h)
- [ ] CA-5 : Nouveau password respecte critères minimaux (>= 8 caractères)
- [ ] CA-6 : Reset réussi → redirect vers login avec message "Mot de passe mis à jour"

**Priorité :** High
**Effort estimé :** 1-2h

---

### US-107 : Déconnexion

**En tant que** créateur UGC
**Je veux** me déconnecter de mon compte
**Afin de** sécuriser mon accès sur un appareil partagé

**Critères d'acceptance :**

- [ ] CA-1 : Bouton déconnexion accessible depuis n'importe quelle page authentifiée
- [ ] CA-2 : `signOut()` Supabase → cookie session supprimé
- [ ] CA-3 : Redirect vers `/` (home/login) après déconnexion
- [ ] CA-4 : Accès aux routes protégées impossible après déconnexion (middleware guard)

**Priorité :** High
**Effort estimé :** 0.5h

---

### US-108 : Protection des routes (Middleware)

**En tant que** développeur (TOM$)
**Je veux** un middleware Next.js qui protège les routes authentifiées
**Afin que** les utilisateurs non connectés soient redirigés vers le login

**Critères d'acceptance :**

- [ ] CA-1 : `middleware.ts` à la racine du projet
- [ ] CA-2 : Routes protégées : `/dashboard/**`, `/builder/**`, `/settings/**`
- [ ] CA-3 : Routes publiques : `/`, `/login`, `/signup`, `/[username]` (portfolios publics)
- [ ] CA-4 : Utilisateur non auth sur route protégée → redirect `/login?redirectTo=[url]`
- [ ] CA-5 : Utilisateur auth sur `/login` ou `/signup` → redirect `/dashboard`
- [ ] CA-6 : Refresh token automatique via `@supabase/ssr` (session toujours fraîche)

**Priorité :** Critical
**Effort estimé :** 1-2h

---

## Hors scope MVP (V0.2+)

- OAuth (Google, GitHub login)
- Magic link (connexion sans mot de passe)
- Two-factor authentication (2FA)
- Gestion multi-sessions
- Onboarding interactif guidé (étapes progressives avec animations)
- Changement email (V0.2 — nécessite re-confirmation complexe)

---

## Tests critiques (Mantra #18 TDD)

```
- test: signup avec email valide → email confirmation envoyé
- test: signup avec email déjà utilisé → erreur explicite
- test: username déjà pris → suggestions + blocage
- test: username format invalide → erreur validation
- test: trial activé une seule fois par email
- test: middleware bloque routes protégées sans session
- test: login échoué → message générique (pas de leak)
```

---

## Checklist de validation Epic

- [ ] Signup complet fonctionnel (email → confirmation → username → trial)
- [ ] Login / logout fonctionnel
- [ ] Reset password fonctionnel
- [ ] Middleware protège toutes les routes correctement
- [ ] RLS Supabase : un user ne peut voir que ses propres données (`profiles`, `portfolios`)
- [ ] Aucun token/clé affiché dans les logs ou responses
