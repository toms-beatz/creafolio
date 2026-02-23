-- Migration 005_testimonials.sql
-- Testimonials système — avis créateurs pour la landing page

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  display_name TEXT, -- override du username si souhaité
  display_role TEXT DEFAULT 'Créateur UGC', -- ex: "Créateur TikTok"
  admin_note TEXT,
  featured BOOLEAN NOT NULL DEFAULT false, -- mis en avant sur la landing
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour la landing (approved + featured first)
CREATE INDEX idx_testimonials_landing ON testimonials(status, featured DESC, created_at DESC);

-- Index pour admin listing
CREATE INDEX idx_testimonials_status ON testimonials(status, created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER set_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Users can see approved testimonials (for landing)
CREATE POLICY "Anyone sees approved testimonials"
  ON testimonials FOR SELECT
  USING (status = 'approved');

-- Users can see and manage their own testimonials
CREATE POLICY "Users see own testimonials"
  ON testimonials FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own pending testimonials"
  ON testimonials FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own pending testimonials"
  ON testimonials FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');

-- Admin full access
CREATE POLICY "Admin full access testimonials"
  ON testimonials FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
