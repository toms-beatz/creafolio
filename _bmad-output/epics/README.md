# Blooprint MVP — Epics Stories

**Version:** 1.0.0
**Date:** 2026-02-20
**Status:** Ready for implementation

---

## Ordre d'implémentation

| Priorité | Epic    | Titre                        | Status  |
| -------- | ------- | ---------------------------- | ------- |
| 1        | EPIC-09 | Infrastructure & Performance | Terminé |
| 2        | EPIC-01 | Auth & Onboarding            | Terminé |
| 2.5      | EPIC-10 | Landing Page                 | A faire |
| 3        | EPIC-02 | Builder (Craft.js)           | A faire |
| 4        | EPIC-03 | Templates & Composants       | A faire |
| 5        | EPIC-04 | Publication                  | A faire |
| 6        | EPIC-05 | Freemium & Billing (Stripe)  | A faire |
| 7        | EPIC-07 | SEO                          | A faire |
| 8        | EPIC-06 | Analytics                    | A faire |
| 9        | EPIC-08 | RGPD & Settings              | A faire |

---

## Règles globales appliquées

Toutes les Epics respectent le contexte projet défini dans `project-context.yaml` :

- Stack : Next.js 14 + Craft.js + Supabase + Stripe + Tailwind CSS + Vercel
- Timeline : MVP 3-4 mois, 20h/semaine, solo dev (TOM$)
- Budget : 0€
- Mantras BMAD actifs : #7 KISS, #37 Ockham, #18 TDD, #20 Perf, #39 Conséquences, IA-3 Explain, IA-16 Challenge

---

## Format des User Stories

```
US-XXX: [Titre]
En tant que [acteur]
Je veux [action]
Afin de [bénéfice]

Critères d'acceptance :
- [ ] CA-1
- [ ] CA-2
Règles : RG-XXX
Priorité : Critical / High / Medium / Low
```

---

## Notes

- Les Epics sont appliquées **one by one** sur demande explicite de TOM$
- Chaque Epic peut être découpée en sprints selon disponibilité
- Les features V0.2+ sont documentées mais hors scope MVP
