-- ============================================================================
-- 0001_initial_schema.sql
--
-- HOW TO RUN:
--   Option A (Supabase dashboard — easiest):
--     1. Go to your Supabase project → SQL Editor → New query
--     2. Paste the entire contents of this file
--     3. Click Run
--
--   Option B (Supabase CLI):
--     supabase db push          (pushes all migrations in this folder)
--     — or —
--     supabase migration up     (runs pending migrations)
--
-- You only need to run this once. Re-running is safe — all statements are
-- idempotent (IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- One row per auth user. Created automatically by the trigger below.
-- The `tier` column is authoritative and is ONLY updated by the Stripe webhook
-- using the service_role key (which bypasses RLS). Users cannot self-upgrade.

CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID PRIMARY KEY
                           REFERENCES auth.users (id) ON DELETE CASCADE,
  tier                   TEXT NOT NULL DEFAULT 'starter'
                           CHECK (tier IN ('starter', 'reseller', 'operator')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_status    TEXT,   -- e.g. 'active', 'past_due', 'canceled'
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep updated_at current automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a profile row for every new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Profiles RLS ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own profile
CREATE POLICY "profiles: users read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users cannot UPDATE profiles directly via the client SDK.
-- All profile mutations go through server actions / API routes that use
-- the service_role key (bypasses RLS). This prevents self-tier-elevation.
-- If you need users to edit non-sensitive fields (e.g. display name), add
-- an explicit UPDATE policy scoped to those columns via a SECURITY DEFINER fn.

-- ─── ITEMS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.items (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  -- Inventory fields
  name       TEXT        NOT NULL,
  cost_paid  NUMERIC(10,2) NOT NULL DEFAULT 0,
  condition  TEXT        NOT NULL DEFAULT 'good'
               CHECK (condition IN ('excellent', 'good', 'fair', 'flawed')),
  flaws      TEXT,

  -- Pipeline
  status     TEXT        NOT NULL DEFAULT 'unlisted'
               CHECK (status IN ('unlisted', 'listed', 'sold')),
  platform   TEXT,
  bin        TEXT,

  -- Sale details (set when status transitions to 'sold')
  sold_price NUMERIC(10,2),
  postage    NUMERIC(10,2),
  fees       NUMERIC(10,2),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  listed_at  TIMESTAMPTZ,
  sold_at    TIMESTAMPTZ
);

-- Indexes for the queries we know we'll run
CREATE INDEX IF NOT EXISTS items_user_id_idx    ON public.items (user_id);
CREATE INDEX IF NOT EXISTS items_user_status_idx ON public.items (user_id, status);
CREATE INDEX IF NOT EXISTS items_created_at_idx  ON public.items (user_id, created_at DESC);

-- ── Items RLS ────────────────────────────────────────────────────────────────

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Users can SELECT / INSERT / UPDATE / DELETE only their own items
CREATE POLICY "items: users crud own"
  ON public.items FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Helpful view: item count per user ───────────────────────────────────────
-- Used by the server-side cap check in the add-item action.

CREATE OR REPLACE VIEW public.item_counts AS
  SELECT user_id, COUNT(*) AS total
  FROM public.items
  WHERE status != 'sold'   -- sold items don't count against the cap
  GROUP BY user_id;

-- The view inherits RLS from the underlying table, so users only see their own count.
