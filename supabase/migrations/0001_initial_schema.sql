-- ============================================================================
-- 0001_initial_schema.sql  — single source of truth for the database schema
--
-- HOW TO RUN (fresh project):
--   Supabase dashboard → SQL Editor → paste and run
--
-- This file reflects the CURRENT live schema. Do not edit column names or
-- types here without also updating the app code in app/dashboard/page.tsx
-- (DbItemRow, DbSaleRow interfaces and all insert/update calls).
-- ============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  tier                   TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_status    TEXT,
  current_period_end     TIMESTAMPTZ,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: users read own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

GRANT SELECT ON TABLE public.profiles TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- ─── ITEMS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.items (
  id          BIGSERIAL     PRIMARY KEY,
  user_id     UUID          NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  code        TEXT          NOT NULL DEFAULT '',
  name        TEXT          NOT NULL,
  cond        TEXT          NOT NULL DEFAULT 'good',
  paid        NUMERIC(10,2) NOT NULL DEFAULT 0,
  stage       TEXT          NOT NULL DEFAULT 'unlisted',
  bin         TEXT,
  platform    TEXT[],
  notes       TEXT,
  size        TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own items"
  ON public.items FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- IMPORTANT: these GRANTs are required — without them inserts return 42501
GRANT ALL ON TABLE public.items TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.items_id_seq TO anon, authenticated, service_role;

-- ─── SALE RECORDS ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sale_records (
  id               BIGSERIAL     PRIMARY KEY,
  user_id          UUID          NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id          BIGINT        REFERENCES public.items (id) ON DELETE SET NULL,
  item_name        TEXT          NOT NULL,
  paid             NUMERIC(10,2) NOT NULL DEFAULT 0,
  sold_for         NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit           NUMERIC(10,2) NOT NULL DEFAULT 0,
  month            TEXT          NOT NULL,
  platform         TEXT,
  ad_cost          NUMERIC(10,2),
  packaging_cost   NUMERIC(10,2),
  equipment_cost   NUMERIC(10,2),
  other_cost       NUMERIC(10,2),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sale_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own sale records"
  ON public.sale_records FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.sale_records TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.sale_records_id_seq TO anon, authenticated, service_role;

-- ─── STORAGE LOCATIONS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.storage_locations (
  id         BIGSERIAL   PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own storage locations"
  ON public.storage_locations FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON TABLE public.storage_locations TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.storage_locations_id_seq TO anon, authenticated, service_role;
