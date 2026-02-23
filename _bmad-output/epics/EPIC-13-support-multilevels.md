# EPIC-13 — Support Multi-niveaux & Messagerie Admin

**Priorité d'implémentation :** Post-MVP / Opérations
**Statut :** A faire
**Mantras actifs :** #4 Fail Fast, #7 KISS, #39 Conséquences, IA-3 Explain Reasoning
**Dépendances :** EPIC-01 (auth), EPIC-12 (admin interface), Supabase (emails transactionnels ou Resend/Postmark)

---

## Objectif

Permettre à 3 niveaux d'utilisateurs (visiteur non-connecté, utilisateur connecté, admin TOM$) d'interagir via un système de tickets de support. Les visiteurs et users envoient des demandes, l'admin y répond depuis une interface de chat intégrée au panel admin. Chaque réponse admin déclenche un email au demandeur.

**Valeur (Mantra IA-3) :** Un SaaS sans support = churn silencieux. Les visiteurs bloqués à l'inscription partent sans signal. Les users premium sans réponse annulent. Ce système donne à TOM$ un canal direct, centralisé, et traçable — sans dépendre d'un outil tiers type Intercom/Zendesk.

---

## Architecture

```
src/app/
├── support/
│   └── page.tsx              # Formulaire public (visiteur non-connecté)
├── dashboard/
│   └── support/
│       └── page.tsx           # Mes tickets (user connecté)
├── admin/
│   └── support/
│       ├── page.tsx           # Liste tickets (admin)
│       └── [id]/page.tsx      # Détail ticket + interface chat (admin)
├── api/
│   └── support/
│       └── route.ts           # API création ticket (visiteur)

src/features/support/
├── actions.ts                 # Server actions (create, reply, update status/priority)
└── email.ts                   # Envoi email réponse (Resend ou Supabase SMTP)

src/components/support/
├── ticket-form.tsx            # Formulaire de création ticket (client component)
├── ticket-list.tsx            # Liste tickets réutilisable
└── chat-thread.tsx            # Interface chat (messages admin + user)
```

**Tables BDD :**

```sql
-- Tickets de support
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Demandeur : user_id si connecté, sinon email+name pour visiteur
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  -- Contenu
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
    -- 'general' | 'inscription' | 'technique' | 'billing' | 'autre'
  status TEXT NOT NULL DEFAULT 'open',
    -- 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
  priority TEXT NOT NULL DEFAULT 'normal',
    -- 'low' | 'normal' | 'high' | 'urgent'
  -- Meta
  admin_note TEXT,              -- Note interne admin (pas visible user)
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages dans un ticket (thread)
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,    -- 'user' | 'guest' | 'admin'
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,  -- Note interne admin (pas envoyée par email)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users voient uniquement leurs propres tickets
CREATE POLICY "Users see own tickets"
  ON support_tickets FOR SELECT
  USING (user_id = auth.uid());

-- Admins voient tout
CREATE POLICY "Admin full access tickets"
  ON support_tickets FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Users voient messages de leurs tickets (sauf internes)
CREATE POLICY "Users see own ticket messages"
  ON support_messages FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
    AND is_internal = false
  );

-- Admins voient tout
CREATE POLICY "Admin full access messages"
  ON support_messages FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Insert pour visiteurs via API (anon key)
CREATE POLICY "Anon can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

CREATE POLICY "Anon can create messages"
  ON support_messages FOR INSERT
  WITH CHECK (sender_type = 'guest');
```

---

## User Stories

---

### US-1301 : Formulaire support visiteur (non-connecté)

**En tant que** visiteur non-connecté
**Je veux** envoyer une demande de support depuis une page publique
**Afin de** poser une question ou signaler un problème d'inscription

**Critères d'acceptance :**

- [ ] CA-1 : Page `/support` accessible sans authentification
- [ ] CA-2 : Formulaire : `name` (requis), `email` (requis, format valide), `subject` (requis), `category` (select : Inscription, Question générale, Autre), `message` (requis, min 10 chars)
- [ ] CA-3 : Rate limit : max 3 tickets par email par 24h (vérification côté API)
- [ ] CA-4 : Honeypot anti-spam : champ caché `website` — si rempli → rejet silencieux
- [ ] CA-5 : Après envoi → message de confirmation "Votre demande a été envoyée. Nous vous répondrons par email sous 24-48h."
- [ ] CA-6 : Ticket créé avec `user_id = NULL`, `guest_email` et `guest_name` renseignés
- [ ] CA-7 : Premier message du ticket créé dans `support_messages` (sender_type = 'guest')
- [ ] CA-8 : Design blueprint cohérent avec le reste du site

**Catégories visiteur :** `inscription`, `general`, `autre`
**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-1302 : Formulaire support utilisateur connecté

**En tant que** utilisateur connecté
**Je veux** créer un ticket de support depuis mon dashboard
**Afin de** signaler un problème technique, une question billing, ou demander de l'aide

**Critères d'acceptance :**

- [ ] CA-1 : Page `/dashboard/support` accessible uniquement aux utilisateurs connectés
- [ ] CA-2 : Formulaire : `subject` (requis), `category` (select : Technique, Billing, Question générale, Autre), `message` (requis, min 10 chars)
- [ ] CA-3 : Email et nom pré-remplis depuis le profil (pas de saisie manuelle)
- [ ] CA-4 : Ticket créé avec `user_id = auth.uid()`, `guest_email = NULL`
- [ ] CA-5 : Après envoi → redirect vers la liste de ses tickets avec toast confirmation
- [ ] CA-6 : Rate limit : max 5 tickets ouverts simultanément par user
- [ ] CA-7 : Bouton "Nouveau ticket" + lien dans le header dashboard ou sidebar settings

**Catégories user :** `technique`, `billing`, `general`, `autre`
**Priorité :** Critical
**Effort estimé :** 2-3h

---

### US-1303 : Liste "Mes tickets" (côté user)

**En tant que** utilisateur connecté
**Je veux** voir l'historique de mes tickets de support
**Afin de** suivre l'avancement de mes demandes

**Critères d'acceptance :**

- [ ] CA-1 : Page `/dashboard/support` liste tous les tickets de l'utilisateur
- [ ] CA-2 : Colonnes : sujet, catégorie, statut (badge couleur), date création, dernière réponse
- [ ] CA-3 : Tri par défaut : plus récent en premier
- [ ] CA-4 : Clic sur un ticket → vue thread (messages échangés, pas les notes internes admin)
- [ ] CA-5 : User peut répondre à un ticket ouvert/en cours (ajout message dans le thread)
- [ ] CA-6 : User peut fermer un ticket résolu ("Marquer comme résolu")
- [ ] CA-7 : Statut affiché : Ouvert (orange), En cours (sky), En attente de réponse (amber), Résolu (emerald), Fermé (zinc)
- [ ] CA-8 : Pas de suppression possible (traçabilité)

**Priorité :** High
**Effort estimé :** 3-4h

---

### US-1304 : Queue support admin — Liste des tickets

**En tant que** admin
**Je veux** voir tous les tickets de support dans mon interface admin
**Afin de** traiter les demandes par priorité et ne rien oublier

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin/support` intégrée dans le layout admin (nouvel item sidebar : "Support" avec icône ✉ et badge count)
- [ ] CA-2 : Liste paginée (20/page) avec colonnes : statut, priorité, sujet, demandeur (username ou email guest), catégorie, date, dernière activité
- [ ] CA-3 : Filtres : par statut (open, in_progress, waiting_user, resolved, closed), par catégorie, par priorité
- [ ] CA-4 : Recherche textuelle sur sujet et contenu (ILIKE)
- [ ] CA-5 : Tri par défaut : priorité desc → date asc (urgent + ancien en premier)
- [ ] CA-6 : Badge rouge sur les tickets sans réponse admin depuis > 24h
- [ ] CA-7 : Compteur de tickets open + in_progress dans le badge sidebar
- [ ] CA-8 : Indicateur visuel distinguant visiteur (icône globe) vs user connecté (icône user)

**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-1305 : Interface chat admin — Détail ticket

**En tant que** admin
**Je veux** voir le thread complet d'un ticket et y répondre dans une interface de chat
**Afin de** communiquer efficacement avec le demandeur

**Critères d'acceptance :**

- [ ] CA-1 : Page `/admin/support/[id]` : layout en 2 colonnes (thread à gauche, infos ticket à droite)
- [ ] CA-2 : Thread style chat : bulles alignées gauche (demandeur) / droite (admin), timestamps, avatars/initiales
- [ ] CA-3 : Messages internes admin (notes) : affichés en fond différent (orange/dashed), marqués "Note interne — invisible pour l'utilisateur"
- [ ] CA-4 : Zone de saisie en bas avec 2 boutons : "Envoyer réponse" (→ email) et "Ajouter note interne" (→ pas d'email)
- [ ] CA-5 : Panneau droit — Infos ticket :
  - Statut (modifiable via select)
  - Priorité (modifiable : low/normal/high/urgent, couleurs distinctes)
  - Catégorie
  - Demandeur (lien vers profil admin si user connecté, sinon email)
  - Date création, dernière activité
  - Note admin persistante (textarea editable)
- [ ] CA-6 : Changement de statut/priorité logué dans `admin_audit_log`
- [ ] CA-7 : Bouton "Marquer résolu" met le statut à `resolved` et `resolved_at = now()`
- [ ] CA-8 : Scroll automatique vers le bas du thread au chargement
- [ ] CA-9 : Textarea avec raccourci Ctrl+Enter pour envoyer

**Priorité :** Critical
**Effort estimé :** 5-6h

---

### US-1306 : Envoi email sur réponse admin

**En tant que** admin
**Je veux** que mes réponses soient automatiquement envoyées par email au demandeur
**Afin que** le demandeur reçoive ma réponse sans devoir vérifier la plateforme

**Critères d'acceptance :**

- [ ] CA-1 : Quand admin envoie une réponse (pas note interne), un email est envoyé à :
  - `profiles.email` si user connecté
  - `support_tickets.guest_email` si visiteur
- [ ] CA-2 : Template email : objet "Re: [sujet du ticket] — Blooprint Support", corps : message admin + lien vers le ticket (si user connecté) ou texte "Répondez directement à cet email" (visiteur)
- [ ] CA-3 : Email envoyé via Resend API (ou Supabase SMTP si déjà configuré)
- [ ] CA-4 : Les notes internes (is_internal = true) ne déclenchent JAMAIS d'email
- [ ] CA-5 : Email reply-to configuré en `support@blooprint.fr`
- [ ] CA-6 : Si l'envoi email échoue → le message est quand même sauvegardé, toast erreur pour l'admin "Message sauvegardé mais email non envoyé"
- [ ] CA-7 : Rate limit envoi : max 20 emails/heure par ticket (anti-boucle)

**Priorité :** Critical
**Effort estimé :** 3-4h

---

### US-1307 : Priorité et notes internes

**En tant que** admin
**Je veux** attribuer une priorité et ajouter des notes internes sur un ticket
**Afin de** organiser mon travail et garder des traces techniques

**Critères d'acceptance :**

- [ ] CA-1 : Priorité : `low` (gris), `normal` (zinc), `high` (amber), `urgent` (red pulsant)
- [ ] CA-2 : Priorité modifiable à tout moment depuis le panneau droit du ticket
- [ ] CA-3 : Note admin (`admin_note`) : textarea persistante dans le panneau droit, sauvegardée au blur
- [ ] CA-4 : Notes internes dans le thread (`is_internal = true`) : visibles uniquement dans l'interface admin, jamais dans la vue user, jamais envoyées par email
- [ ] CA-5 : Exemple d'usage note interne : "Fix à faire côté Stripe, escalader si pas résolu d'ici vendredi"
- [ ] CA-6 : Changement de priorité logué dans `admin_audit_log` avec old/new value
- [ ] CA-7 : Filtre dans la liste admin par priorité (voir US-1304.CA-3)

**Priorité :** High
**Effort estimé :** 2-3h

---

### US-1308 : Notifications et accès rapide

**En tant que** admin
**Je veux** être notifié des nouveaux tickets et pouvoir y accéder rapidement
**Afin de** ne pas laisser de demandes sans réponse

**Critères d'acceptance :**

- [ ] CA-1 : Badge compteur dans la sidebar admin : tickets `open` + `in_progress` sans réponse admin
- [ ] CA-2 : Lien "Support" ajouté à la sidebar admin (entre "Signalements" et "Billing")
- [ ] CA-3 : Sur le dashboard admin (overview), card quick action "Support" avec compteur tickets en attente
- [ ] CA-4 : [MVP+] Email notification admin quand nouveau ticket créé (optionnel, via app_config `admin_email_notifications`)
- [ ] CA-5 : Les tickets > 48h sans réponse admin sont marqués visuellement en rouge dans la liste

**Priorité :** High
**Effort estimé :** 2h

---

### US-1309 : Lien support accessible partout

**En tant que** visiteur ou utilisateur
**Je veux** trouver facilement le lien vers le support
**Afin de** pouvoir demander de l'aide quand j'en ai besoin

**Critères d'acceptance :**

- [ ] CA-1 : Footer : lien "Support" → `/support` (visiteur) ou `/dashboard/support` (user connecté)
- [ ] CA-2 : Page `/support` : si user est connecté, redirect automatique vers `/dashboard/support`
- [ ] CA-3 : Settings sidebar : nouveau lien "Support" dans la navigation settings
- [ ] CA-4 : Dashboard header : lien discret "Aide" ou icône `?` vers le support
- [ ] CA-5 : Page 404 et pages d'erreur : lien "Besoin d'aide ? Contactez le support"

**Priorité :** Normal
**Effort estimé :** 1-2h

---

## Migration SQL

```sql
-- Migration 004_support_tickets.sql

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  admin_note TEXT,
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tickets"
  ON support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin full access tickets"
  ON support_tickets FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users see own ticket messages (non-internal)"
  ON support_messages FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
    AND is_internal = false
  );

CREATE POLICY "Users insert messages in own tickets"
  ON support_messages FOR INSERT
  WITH CHECK (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
    AND sender_type = 'user'
  );

CREATE POLICY "Admin full access messages"
  ON support_messages FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Anon can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

CREATE POLICY "Anon can create first message"
  ON support_messages FOR INSERT
  WITH CHECK (sender_type = 'guest');

-- Index pour performance
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority, created_at);
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
```

---

## Ordre d'implémentation recommandé

1. **Migration SQL** — Tables + RLS + index
2. **Types TypeScript** — `database.ts` : support_tickets, support_messages
3. **US-1301** — Formulaire visiteur (page publique + API route)
4. **US-1302** — Formulaire user connecté (server action)
5. **US-1303** — Liste "Mes tickets" côté user
6. **US-1304** — Queue admin — liste tickets
7. **US-1305** — Interface chat admin (cœur de l'EPIC)
8. **US-1306** — Envoi email sur réponse
9. **US-1307** — Priorité + notes internes
10. **US-1308** — Badge sidebar + notifications
11. **US-1309** — Liens support partout

---

## Métriques de succès

- Temps de réponse moyen < 24h
- 0% de tickets perdus (tout est tracé en BDD)
- Admin peut gérer le support sans quitter le panel admin
- Visiteurs bloqués à l'inscription ont un canal de communication

---

## Notes techniques

- **Email provider :** Resend (recommandé, Next.js friendly, 100 emails/jour gratuit) ou Supabase SMTP. À configurer via env vars `RESEND_API_KEY` et `SUPPORT_FROM_EMAIL`.
- **Pas de real-time pour MVP :** L'admin refresh manuellement la page. Le real-time (Supabase Realtime channels) peut être ajouté en v2.
- **Pas de pièces jointes pour MVP :** Text-only. Les screenshots peuvent être partagés via liens externes.
- **Thread vs ticket :** Un ticket = un thread de messages. Pas de sous-threads ou branches.
