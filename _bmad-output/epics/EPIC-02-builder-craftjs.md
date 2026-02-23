# EPIC-02 — Builder (Craft.js)

**Priorité d'implémentation :** 3
**Statut :** A faire
**Mantras actifs :** #7 KISS, #20 Performance, #37 Ockham, #4 Fail Fast, IA-21 Self-Aware
**Dépendances :** EPIC-09 (infra), EPIC-01 (auth — user connecté), EPIC-03 (templates/composants)

---

## Objectif

Développer le builder drag & drop avec Craft.js permettant au créateur d'assembler son portfolio visuel. Inclut : chargement template, drag & drop composants, personnalisation, autosave robuste, preview temps réel, et gestion des limites Free/Premium.

**Challenge (Mantra IA-16) :** Craft.js est la partie la plus complexe et risquée du projet. Attention aux edge cases liés à la sérialisation du state JSON, aux composants custom, et aux performances React. Prévoir un spike technique avant d'implémenter.

---

## User Stories

---

### US-201 : Accès au builder

**En tant que** créateur UGC
**Je veux** accéder au builder depuis mon dashboard
**Afin de** commencer à construire ou modifier mon portfolio

**Critères d'acceptance :**

- [ ] CA-1 : Page `/builder/[portfolioId]` accessible uniquement au propriétaire du portfolio
- [ ] CA-2 : Craft.js chargé avec l'état sauvegardé (`portfolios.craft_state` depuis Supabase) ou état initial si vide
- [ ] CA-3 : Loading state élégant pendant chargement initial (skeleton ou spinner)
- [ ] CA-4 : Si portfolio n'appartient pas à l'user → 403 / redirect dashboard
- [ ] CA-5 : Craft.js rendu uniquement côté client (pas de SSR pour le builder) — `dynamic import` avec `ssr: false`

**Priorité :** Critical
**Effort estimé :** 2-3h

---

### US-202 : Interface builder

**En tant que** créateur UGC
**Je veux** une interface builder claire avec toolbox, canvas et panneau de propriétés
**Afin de** comprendre intuitivement comment assembler mon portfolio

**Critères d'acceptance :**

- [ ] CA-1 : Layout 3 zones : Toolbox (gauche), Canvas (centre), Properties Panel (droite)
- [ ] CA-2 : Toolbox liste les composants disponibles selon plan (Free = 6 max, Premium = illimité)
- [ ] CA-3 : Canvas = rendu live du portfolio pendant édition
- [ ] CA-4 : Clic sur composant dans canvas → Properties Panel affiche options de personnalisation
- [ ] CA-5 : Boutons header builder : "Preview", "Publier", "Sauvegarder", "Retour dashboard"
- [ ] CA-6 : Responsive : builder utilisable uniquement desktop (warning sur mobile/tablet)
- [ ] CA-7 : Indicateur "Sauvegardé" / "Modifications non sauvegardées" visible

**Priorité :** Critical
**Effort estimé :** 4-6h

---

### US-203 : Drag & drop composants

**En tant que** créateur UGC
**Je veux** glisser-déposer des composants depuis la toolbox vers le canvas
**Afin de** assembler visuellement les sections de mon portfolio

**Critères d'acceptance :**

- [ ] CA-1 : Drag depuis toolbox → drop dans canvas fonctionne (Craft.js native DnD)
- [ ] CA-2 : Réordonner composants existants par drag & drop dans le canvas
- [ ] CA-3 : Suppression composant : bouton delete au survol ou dans properties panel
- [ ] CA-4 : Limite Free (6 composants) : drag bloqué si limite atteinte + message "Upgrade Premium pour plus de composants" + CTA
- [ ] CA-5 : Feedback visuel clair pendant drag (ghost element, drop zone highlighting)
- [ ] CA-6 : Undo/Redo : `Ctrl+Z` / `Ctrl+Y` (Craft.js history)

**Règles :** RG-005
**Priorité :** Critical
**Effort estimé :** 4-6h

---

### US-204 : Personnalisation des composants

**En tant que** créateur UGC
**Je veux** personnaliser le contenu de chaque composant (textes, images, couleurs)
**Afin de** rendre mon portfolio unique et représentatif de mon travail

**Critères d'acceptance :**

- [ ] CA-1 : Clic sur composant → Properties Panel affiche ses props éditables
- [ ] CA-2 : Édition textes : inline editing ou champs dans Properties Panel (selon composant)
- [ ] CA-3 : Upload images : intégré directement dans le composant (drag image ou browse)
- [ ] CA-4 : Upload image : validation 5MB max, formats JPG/PNG/WebP/GIF, erreur explicite sinon
- [ ] CA-5 : Compression auto des images > 1MB avant upload Supabase Storage
- [ ] CA-6 : Modifications reflétées en temps réel dans le canvas (live preview)
- [ ] CA-7 : Champs typed correctement (TypeScript interfaces par composant)

**Règles :** RG-006
**Priorité :** Critical
**Effort estimé :** 6-8h

---

### US-205 : Autosave

**En tant que** créateur UGC
**Je veux** que mon travail soit sauvegardé automatiquement pendant que j'édite
**Afin de** ne jamais perdre mes modifications par accident

**Critères d'acceptance :**

- [ ] CA-1 : Autosave déclenché après 2 secondes d'inactivité (debounce) — Mantra #7 KISS
- [ ] CA-2 : Sérialisation : `editor.query.serialize()` → JSON → `portfolios.craft_state` Supabase
- [ ] CA-3 : Indicateur UI : "Sauvegardé" (vert) / "Sauvegarde..." (spinner) / "Erreur sauvegarde" (rouge)
- [ ] CA-4 : Si save Supabase échoue → backup localStorage (`blooprint_draft_[portfolioId]`)
- [ ] CA-5 : Au chargement : si localStorage plus récent que Supabase → proposer "Restaurer brouillon non sauvegardé ?"
- [ ] CA-6 : Rate limiting : max 10 saves par minute (anti-spam Supabase)
- [ ] CA-7 : Save manuel possible via bouton "Sauvegarder" (bypass debounce)

**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-206 : Preview temps réel

**En tant que** créateur UGC
**Je veux** voir une preview de mon portfolio tel qu'il apparaîtra publiquement
**Afin de** valider le rendu avant de publier

**Critères d'acceptance :**

- [ ] CA-1 : Bouton "Preview" dans le header builder
- [ ] CA-2 : Preview ouvre dans un nouvel onglet ou modal plein écran
- [ ] CA-3 : Preview = rendu exact du portfolio sans toolbox ni controls Craft.js
- [ ] CA-4 : Preview affiche le watermark "Built with Blooprint" si compte Free
- [ ] CA-5 : Preview responsive : toggle Desktop / Mobile / Tablet dans la preview
- [ ] CA-6 : Preview utilise le state actuel (même non sauvegardé)

**Priorité :** High
**Effort estimé :** 2-3h

---

### US-207 : Récupération après erreur Craft.js

**En tant que** créateur UGC
**Je veux** que le builder récupère gracieusement si Craft.js rencontre un bug
**Afin de** ne pas perdre mon travail lors d'une erreur technique

**Critères d'acceptance :**

- [ ] CA-1 : Error boundary React autour du composant Craft.js (Mantra #4 Fail Visible)
- [ ] CA-2 : Si crash Craft.js → message "Une erreur est survenue" + bouton "Recharger le builder"
- [ ] CA-3 : Si state JSON corrompu au chargement → reset vers template par défaut + message warning
- [ ] CA-4 : État incohérent Craft.js → log structuré avec context (user id, portfolio id, state snapshot)
- [ ] CA-5 : Backup localStorage used pour recovery si Supabase state corrompu

**Priorité :** High
**Effort estimé :** 2h

---

## Hors scope MVP (V0.2+)

- Multi-pages portfolio
- Collaboration temps réel (Supabase Realtime multi-user)
- Version history builder (rollback manuel)
- Custom CSS/HTML injection
- Composants conditionnels (si/sinon)
- Import template depuis fichier

---

## Tests critiques (Mantra #18 TDD)

```
- test: drag composant bloqué si limite Free 6 composants atteinte
- test: autosave écrit dans Supabase après 2s inactivité
- test: autosave fallback localStorage si Supabase down
- test: state JSON corrompu → reset template + warning (pas de crash)
- test: upload image > 5MB → erreur explicite
- test: preview affiche watermark Free
```

---

## Notes techniques Craft.js

- Tous les composants Craft.js sont des **User Components** avec `useNode` et `craft` config
- Le state global est sérialisé en JSON via `editor.query.serialize()`
- `<Editor>` = composant Craft.js principal, rendu côté client uniquement
- La toolbox utilise `useEditor()` pour accéder aux actions Craft.js
- RG-005 implémenté via `useEditor(state => Object.keys(state.nodes).length)` avant chaque drop

---

## Checklist de validation Epic

- [ ] Drag & drop fonctionne sur les 8-10 composants
- [ ] Autosave écrit en BDD sans régression
- [ ] Limite Free 6 composants respectée
- [ ] Recovery après state JSON corrompu
- [ ] Preview identique au rendu public
- [ ] Lighthouse score builder > 70 (acceptable vu complexité Craft.js)
