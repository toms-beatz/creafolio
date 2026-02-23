-- Migration 007: Portfolio theme + image storage quota
-- EPIC 15 (themes) + EPIC 16 (R2 image bucket)

-- Theme JSON stored per portfolio
ALTER TABLE portfolios
  ADD COLUMN IF NOT EXISTS theme jsonb DEFAULT null;

-- Storage usage tracking for R2 (EPIC 16)
CREATE TABLE IF NOT EXISTS storage_usage (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE SET NULL,
  file_key    text NOT NULL,          -- R2 object key
  file_size   bigint NOT NULL DEFAULT 0,  -- bytes
  mime_type   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast quota lookups
CREATE INDEX IF NOT EXISTS idx_storage_usage_user_id ON storage_usage(user_id);

-- RLS on storage_usage
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own storage"
  ON storage_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storage"
  ON storage_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storage"
  ON storage_usage FOR DELETE
  USING (auth.uid() = user_id);
