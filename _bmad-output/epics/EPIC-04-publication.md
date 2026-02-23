# EPIC-04 — Publication

**Priorité d'implémentation :** 5
**Statut :** A faire
**Mantras actifs :** #4 Fail Fast, #20 Performance, #37 Ockham, #39 Conséquences
**Dépendances :** EPIC-09 (infra), EPIC-01 (auth), EPIC-02 (builder), EPIC-03 (composants)

---

## Objectif

Permettre au créateur de publier son portfolio en ligne sur `blooprint.fr/[username]` et de le dépublier à tout moment. Le portfolio publié est accessible publiquement sans authentification pour les marques/visiteurs.

**Impact business (Mantra #39 Conséquences) :** La publication est le moment de vérité du produit — c'est ce que voient les marques. La performance, le SEO et le rendu doivent être impeccables. Un portfolio lent ou cassé = perte client pour le créateur.

---

## User Stories

---

### US-401 : Publier le portfolio

**En tant que** créateur UGC
**Je veux** publier mon portfolio en un clic
**Afin qu'** il soit accessible publiquement sur `blooprint.fr/[username]`

**Critères d'acceptance :**

- [ ] CA-1 : Bouton "Publier" dans le header du builder et dans le dashboard
- [ ] CA-2 : Validation avant publication : portfolio doit avoir minimum 1 composant (blocage si 0)
- [ ] CA-3 : Warning UX si < 3 composants : "Ton portfolio semble incomplet, es-tu sûr de vouloir publier ?" (confirmer ou annuler)
- [ ] CA-4 : `portfolios.status` passe de `'draft'` à `'published'`, `portfolios.published_at` = `now()`
- [ ] CA-5 : Portfolio immédiatement accessible sur `blooprint.fr/[username]` après publication
- [ ] CA-6 : Confirmation visuelle + lien direct vers le portfolio public
- [ ] CA-7 : Sauvegarde automatique avant publication (pas de publication d'état non sauvegardé)

**Règles :** RG-001, RG-008
**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-402 : Page portfolio public (rendu)

**En tant que** marque ou recruteur
**Je veux** consulter un portfolio Blooprint via son URL
**Afin de** découvrir le créateur UGC et décider de le contacter

**Critères d'acceptance :**

- [ ] CA-1 : Route dynamique `src/app/[username]/page.tsx` — SSG ou ISR (statique pour perf — Mantra #20)
- [ ] CA-2 : Fetch portfolio since Supabase avec `slug = username` + `status = 'published'`
- [ ] CA-3 : Rendu Craft.js en lecture seule (pas de toolbox, pas d'hover controls)
- [ ] CA-4 : Si portfolio `status !== 'published'` → page "Ce portfolio n'est pas disponible" (pas de 500)
- [ ] CA-5 : Si username inexistant → page 404 personnalisée
- [ ] CA-6 : Watermark "Built with Blooprint" affiché si créateur en Free (dans Footer)
- [ ] CA-7 : Aucun lien vers le builder ou dashboard sur la page publique
- [ ] CA-8 : Temps de chargement < 2.5s LCP (Mantra #20)

**Priorité :** Critical
**Effort estimé :** 4-6h

---

### US-403 : Dépublier le portfolio

**En tant que** créateur UGC
**Je veux** dépublier mon portfolio
**Afin de** le rendre privé pendant que je le modifie ou que je le retire

**Critères d'acceptance :**

- [ ] CA-1 : Bouton "Dépublier" accessible depuis le builder et le dashboard (quand status = published)
- [ ] CA-2 : Confirmation : "Ton portfolio ne sera plus accessible publiquement. Confirmer ?"
- [ ] CA-3 : `portfolios.status` passe à `'draft'`
- [ ] CA-4 : L'URL `blooprint.fr/[username]` affiche "Portfolio non disponible" après dépublication
- [ ] CA-5 : Le créateur peut re-publier à tout moment
- [ ] CA-6 : Pas de notification envoyée (silencieux)

**Priorité :** High
**Effort estimé :** 1-2h

---

### US-404 : Dashboard portfolio

**En tant que** créateur UGC
**Je veux** voir l'état de mon portfolio depuis le dashboard
**Afin de** savoir s'il est publié, avoir le lien public et gérer mes portfolios

**Critères d'acceptance :**

- [ ] CA-1 : Dashboard `/dashboard` liste les portfolios du créateur
- [ ] CA-2 : Chaque portfolio affiche : titre, status badge (Brouillon / Publié / Suspendu), date dernière modif
- [ ] CA-3 : Si publié : lien `blooprint.fr/[username]` clickable + bouton copier lien
- [ ] CA-4 : Actions par portfolio : "Modifier" → builder, "Publier/Dépublier", "Supprimer"
- [ ] CA-5 : Bouton "Créer un portfolio" (limité par RG-004 : 1 Free, 3 Premium)
- [ ] CA-6 : Si limite portfolios atteinte → bouton désactivé + message "Upgrade Premium" avec CTA

**Règles :** RG-004
**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-405 : Suppression portfolio (Soft Delete)

**En tant que** créateur UGC
**Je veux** supprimer un portfolio que je n'utilise plus
**Afin de** libérer mon quota ou supprimer du contenu obsolète

**Critères d'acceptance :**

- [ ] CA-1 : Confirmation modal : "Cette action est irréversible sous 30 jours. Supprimer ?"
- [ ] CA-2 : Soft delete : `portfolios.status = 'deleted'`, `portfolios.deleted_at = now()`
- [ ] CA-3 : Portfolio supprimé invisible pour le créateur dans le dashboard
- [ ] CA-4 : URL publique du portfolio → "Portfolio non disponible" après suppression
- [ ] CA-5 : Récupération possible dans les 30 jours via support uniquement
- [ ] CA-6 : Hard delete automatique après 30 jours (cron job Supabase ou Vercel Cron)
- [ ] CA-7 : Si portfolio publié et supprimé → dépublication automatique au moment du soft delete

**Règles :** RG-010
**Priorité :** High
**Effort estimé :** 2-3h

---

### US-406 : Performance page publique

**En tant que** marque visitant un portfolio
**Je veux** que la page charge rapidement
**Afin d'** avoir une bonne expérience et ne pas quitter avant de voir le contenu

**Critères d'acceptance :**

- [ ] CA-1 : ISR (Incremental Static Regeneration) : `revalidate: 60` sur la page portfolio public
- [ ] CA-2 : LCP < 2.5s mesuré Lighthouse
- [ ] CA-3 : CLS < 0.1 (pas de layout shift — images avec dimensions définies)
- [ ] CA-4 : FID/INP < 200ms
- [ ] CA-5 : Images servies via `next/image` avec format WebP automatique
- [ ] CA-6 : Code splitting : seuls les composants présents dans le portfolio sont chargés

**Priorité :** High
**Effort estimé :** 3-4h (optimisation)

---

### US-407 : Gestion username modifié

**En tant que** créateur UGC
**Je veux** pouvoir modifier mon username dans les settings
**Afin de** changer mon URL publique si nécessaire

**Critères d'acceptance :**

- [ ] CA-1 : Option "Modifier username" dans `/settings/profile`
- [ ] CA-2 : Warning clair : "Changer ton username cassera l'ancienne URL. Les marques qui ont ton lien ne pourront plus accéder à ton portfolio."
- [ ] CA-3 : Confirmation double : tape le nouveau username + confirme
- [ ] CA-4 : Pas de redirection automatique (MVP — V0.2+ avec 301 redirect)
- [ ] CA-5 : Mise à jour de `profiles.username` + `portfolios.slug` du portfolio publié
- [ ] CA-6 : Validation format username identique à l'inscription (RG-001)

**Règles :** RG-001
**Priorité :** Medium
**Effort estimé :** 2h

---

## Hors scope MVP (V0.2+)

- Custom domain (`monsite.com` → portfolio Blooprint)
- Redirection automatique ancien username → nouveau username (301)
- Portfolio password protégé (accès privé avec mot de passe)
- Multi-pages portfolio

---

## Tests critiques (Mantra #18 TDD)

```
- test: publication bloquée si 0 composants
- test: warning affiché si < 3 composants (pas de blocage)
- test: page publique 404 si username inexistant
- test: page publique "non disponible" si status !== 'published'
- test: soft delete → portfolio invisible dashboard + URL inaccessible
- test: hard delete exécuté après 30 jours
- test: limite portfolios Free (1) → blocage création deuxième portfolio
```

---

## Checklist de validation Epic

- [ ] Publication fonctionne → portfolio live sur `blooprint.fr/[username]`
- [ ] Dépublication fonctionne → page "non disponible"
- [ ] Soft delete correct (récupérable 30j)
- [ ] Dashboard affiche statuts corrects
- [ ] Watermark Free visible sur portefeuille public
- [ ] Lighthouse page publique : Perf > 85
