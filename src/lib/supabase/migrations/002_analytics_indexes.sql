-- ============================================================
-- Migration: 002_analytics_insert_policy.sql
-- Permet l'insertion dans portfolio_analytics et portfolio_link_clicks
-- via le service role (API routes tracking).
-- Note: Les API routes utilisent createAdminClient() qui bypass RLS,
-- donc pas de policy INSERT supplémentaire nécessaire pour le tracking.
-- Ce fichier ajoute des policies pour le cas où on voudrait
-- permettre l'insertion publique via le client anon (futur).
-- ============================================================

-- Index composite pour la déduplication (rate limiting session)
CREATE INDEX IF NOT EXISTS idx_analytics_session_portfolio
  ON public.portfolio_analytics(portfolio_id, session_hash, viewed_at DESC);
