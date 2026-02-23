-- ============================================================
-- Blooprint MVP — Schema initial
-- Migration: 001_initial_schema.sql
-- Date: 2026-02-20
-- ============================================================

-- Extension pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: profiles
-- Extension de auth.users (géré par Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username      text        UNIQUE NOT NULL,
  email         text        NOT NULL,
  plan          text        NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free', 'trial', 'premium')),
  trial_ends_at timestamptz,
  stripe_customer_id text   UNIQUE,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Validation format username: a-z, 0-9, tirets, 3-30 chars (RG-001)
ALTER TABLE public.profiles
  ADD CONSTRAINT username_format
  CHECK (username ~ '^[a-z0-9-]{3,30}$');

-- ============================================================
-- TABLE: portfolios
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolios (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        text        NOT NULL DEFAULT 'Mon Portfolio',
  slug         text        UNIQUE NOT NULL, -- = username au moment de création
  status       text        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'published', 'suspended', 'deleted')),
  craft_state  jsonb,      -- état Craft.js sérialisé
  deleted_at   timestamptz,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Index pour les lookups fréquents
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON public.portfolios(status);

-- ============================================================
-- TABLE: subscriptions
-- Synchronisée via webhooks Stripe
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text        UNIQUE,
  stripe_price_id        text,
  stripe_customer_id     text,
  status                 text        CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'unpaid')),
  current_period_end     timestamptz,
  cancel_at_period_end   boolean     NOT NULL DEFAULT false,
  canceled_at            timestamptz,
  stripe_event_ids       text[]      NOT NULL DEFAULT '{}', -- idempotence webhooks
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

-- ============================================================
-- TABLE: portfolio_analytics
-- Vues portfolios (RGPD: pas d'IP directe, session_hash anonymisé)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid        NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  session_hash text        NOT NULL, -- hash(ip + user_agent) — non réversible
  referrer     text,
  is_bot       boolean     NOT NULL DEFAULT false,
  viewed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_portfolio_id ON public.portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_analytics_viewed_at ON public.portfolio_analytics(viewed_at);

-- ============================================================
-- TABLE: portfolio_link_clicks
-- Clics sur liens de contact (Analytics Premium)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_link_clicks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid        NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  link_type    text        NOT NULL
                           CHECK (link_type IN ('email', 'tiktok', 'instagram', 'youtube', 'linkedin', 'other')),
  clicked_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_portfolio_id ON public.portfolio_link_clicks(portfolio_id);

-- ============================================================
-- TABLE: reports
-- Signalements contenu (RG-011)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id  uuid        NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  motif         text        NOT NULL
                            CHECK (motif IN ('nsfw', 'haineux', 'spam', 'autre')),
  description   text,
  reporter_hash text,       -- hash IP reporter (RGPD)
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports           ENABLE ROW LEVEL SECURITY;

-- profiles: un user ne voit que son propre profil
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- portfolios: un user ne voit que ses portfolios
CREATE POLICY "portfolios: select own"
  ON public.portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "portfolios: insert own"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolios: update own"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "portfolios: delete own"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- portfolios publics: accessibles sans auth si status = 'published'
CREATE POLICY "portfolios: select published (public)"
  ON public.portfolios FOR SELECT
  USING (status = 'published');

-- subscriptions: un user ne voit que ses propres subscriptions
CREATE POLICY "subscriptions: select own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- analytics: un user ne voit que les analytics de ses portfolios
CREATE POLICY "analytics: select own portfolios"
  ON public.portfolio_analytics FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM public.portfolios WHERE user_id = auth.uid()
    )
  );

-- link_clicks: idem
CREATE POLICY "link_clicks: select own portfolios"
  ON public.portfolio_link_clicks FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM public.portfolios WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGER: updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER: création profil automatique après signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
