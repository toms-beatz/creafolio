# EPIC-06 — Analytics

**Priorité d'implémentation :** 8
**Statut :** A faire
**Mantras actifs :** #7 KISS, #37 Ockham, #39 Conséquences
**Dépendances :** EPIC-04 (pages publiques), EPIC-05 (plan Free/Premium)

---

## Objectif

Fournir aux créateurs des statistiques sur la performance de leurs portfolios. Free = vues basiques. Premium = analytics avancées (visiteurs uniques, taux de clic, sources de trafic).

**Scope (Mantra #37 Ockham) :** Éviter over-engineering — commencer simple avec Supabase (pas d'outil analytics tiers payant). L'objectif MVP est de prouver la valeur, pas de construire un Google Analytics.

**Challenge (Mantra IA-16) :** Attention à la RGPD — le tracking doit être consenti (cookie consent). Ne pas stocker d'IP sans consentement.

---

## User Stories

---

### US-601 : Comptage des vues (Free)

**En tant que** créateur Free
**Je veux** voir combien de fois mon portfolio a été visité
**Afin de** savoir si mon portfolio attire des visiteurs

**Critères d'acceptance :**

- [ ] CA-1 : Chaque visite d'une page portfolio publié incrémente un compteur
- [ ] CA-2 : Stockage dans `portfolio_analytics` : `portfolio_id`, `viewed_at` (timestamp), `session_id` (hash anonyme)
- [ ] CA-3 : Dashboard affiche : "X vues totales" par portfolio
- [ ] CA-4 : Auto-vues du créateur NOT comptées (détecter si userId = propriétaire)
- [ ] CA-5 : Bot protection basique : User-Agent filtering (exclure Googlebot, etc.)
- [ ] CA-6 : Rate limit : max 1 vue par session (hash = IP + user-agent, pas d'IP stockée — RGPD)
- [ ] CA-7 : Comptage asynchrone (ne pas ralentir le chargement de la page — fire and forget)

**Priorité :** High
**Effort estimé :** 3-4h

---

### US-602 : Dashboard analytics basiques (Free)

**En tant que** créateur Free
**Je veux** voir un aperçu simple de mes statistiques
**Afin de** mesurer l'intérêt pour mon portfolio

**Critères d'acceptance :**

- [ ] CA-1 : Section "Analytics" dans le dashboard (tab ou section dédiée)
- [ ] CA-2 : Métriques affichées : vues totales (all time), vues 7 derniers jours, vues 30 derniers jours
- [ ] CA-3 : Graphique simple linéaire des vues sur 30 jours (date → count)
- [ ] CA-4 : Si 0 vue : message encourageant "Partage ton lien pour obtenir tes premières visites !"
- [ ] CA-5 : Sélecteur de portfolio si plusieurs portfolios

**Priorité :** High
**Effort estimé :** 3-4h

---

### US-603 : Analytics avancées (Premium)

**En tant que** créateur Premium
**Je veux** des analytics détaillées sur mes visiteurs
**Afin de** comprendre d'où viennent mes visites et quels liens intéressent les marques

**Critères d'acceptance :**

- [ ] CA-1 : Visiteurs uniques (basé sur session hash) sur 7j, 30j, all time
- [ ] CA-2 : Sources de trafic : `document.referrer` capturé lors de la visite, catégorisé (Direct, LinkedIn, TikTok, Google, Autre)
- [ ] CA-3 : Clics sur liens de contact (email, TikTok, Instagram) trackés via onClick events
- [ ] CA-4 : Tableau sources : source → vues → % du total
- [ ] CA-5 : Export CSV des données analytics (bouton "Exporter")
- [ ] CA-6 : Si accès Premium expiré → données analytics conservées mais interface locked "Upgrade pour voir"

**Priorité :** Medium
**Effort estimé :** 5-6h

---

### US-604 : Accès verrouillé pour Free (upsell)

**En tant que** créateur Free
**Je veux** voir un aperçu flou des analytics Premium
**Afin de** comprendre la valeur de l'upgrade

**Critères d'acceptance :**

- [ ] CA-1 : Section analytics avancées visible mais locked (blur overlay) pour les Free
- [ ] CA-2 : Message : "Sources de trafic, visiteurs uniques... disponibles en Premium"
- [ ] CA-3 : CTA "Upgrade Premium" cliquable depuis la section locked
- [ ] CA-4 : Les vraies données ne sont PAS chargées pour les Free (pas de calcul inutile côté serveur)

**Priorité :** Medium
**Effort estimé :** 1-2h

---

## Schema BDD

```sql
portfolio_analytics (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios(id) not null,
  session_hash text not null,     -- hash(ip + user_agent) — pas d'IP directe
  referrer text,                   -- source de trafic
  viewed_at timestamptz default now(),
  is_bot boolean default false
)

portfolio_link_clicks (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid references portfolios(id) not null,
  link_type text,                  -- 'email' | 'tiktok' | 'instagram' | 'youtube' | 'other'
  clicked_at timestamptz default now()
)
```

---

## Notes RGPD

- Aucune IP stockée directement (hash one-way = anonymisation)
- Cookie consent requis avant tracking (voir EPIC-08)
- Si pas de consentement → tracking désactivé
- Export données analytics inclus dans "Export mes données" (voir EPIC-08)

---

## Hors scope MVP (V0.2+)

- Heatmaps (clics sur zones de la page)
- Temps de session moyen
- Taux de rebond
- Intégration Google Analytics, Plausible, Fathom
- Alertes email (ex: "Tu as eu 10 visites aujourd'hui !")
- Analytics par composant (quel bloc attire le plus l'attention)

---

## Checklist de validation Epic

- [ ] Vues comptées correctement (exclure auto-vues, exclure bots)
- [ ] Dashboard analytics Free fonctionnel
- [ ] Analytics Premium mockées correctement (blur pour Free)
- [ ] RGPD : pas d'IP stockée, respect du cookie consent
- [ ] Tracking asynchrone (pas d'impact LCP)
