-- Migration 006: Portfolio landing showcase (consent + admin featured)
-- User opts in with allow_landing, admin selects with admin_featured.

ALTER TABLE portfolios
  ADD COLUMN allow_landing boolean NOT NULL DEFAULT false,
  ADD COLUMN admin_featured boolean NOT NULL DEFAULT false;

-- Index for landing page query (admin_featured + published + allow_landing)
CREATE INDEX idx_portfolios_landing
  ON portfolios (admin_featured, status, allow_landing)
  WHERE admin_featured = true AND status = 'published' AND allow_landing = true;
