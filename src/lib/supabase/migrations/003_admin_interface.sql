-- ============================================================
-- Migration EPIC-12 : Admin Interface
-- Ajouter role, app_config, admin_audit_log
-- ============================================================

-- 1. Nouveau champ role dans profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 2. Table de configuration
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- Valeurs par défaut
INSERT INTO app_config (key, value) VALUES
  ('trial_duration_days', '7'),
  ('max_portfolios_free', '1'),
  ('max_portfolios_premium', '5'),
  ('max_blocks_free', '6'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- 3. Audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4. RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_audit_log: admin only"
  ON admin_audit_log FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config: admin only"
  ON app_config FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Promouvoir le premier admin (remplacer l'email par celui de TOM$)
-- UPDATE profiles SET role = 'admin' WHERE email = 'tom@blooprint.fr';
