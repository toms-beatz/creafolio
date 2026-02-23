-- Migration 004_support_tickets.sql
-- EPIC-13 : Support Multi-niveaux & Messagerie Admin

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

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users voient leurs propres tickets
CREATE POLICY "Users see own tickets"
  ON support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins accès total tickets
CREATE POLICY "Admin full access tickets"
  ON support_tickets FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Users voient messages de leurs tickets (sauf internes)
CREATE POLICY "Users see own ticket messages (non-internal)"
  ON support_messages FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
    AND is_internal = false
  );

-- Users ajoutent des messages dans leurs tickets
CREATE POLICY "Users insert messages in own tickets"
  ON support_messages FOR INSERT
  WITH CHECK (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
    AND sender_type = 'user'
  );

-- Admins accès total messages
CREATE POLICY "Admin full access messages"
  ON support_messages FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Visiteurs (anon) peuvent créer des tickets
CREATE POLICY "Anon can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

-- Visiteurs peuvent créer le premier message
CREATE POLICY "Anon can create first message"
  ON support_messages FOR INSERT
  WITH CHECK (sender_type = 'guest');

-- Index pour performance
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority, created_at);
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
