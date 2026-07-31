-- ============================================================================
-- Smart Shelf — Database Schema
-- Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Idempotent: safe to run multiple times
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. smart_shelves
-- ============================================================================
CREATE TABLE IF NOT EXISTS smart_shelves (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE
             CHECK (token ~ '^SHLF-\d{4}-\d{4}$'),
  category   TEXT NOT NULL
             CHECK (category IN ('mercearia', 'hortifruti', 'limpeza', 'frios_e_congelados')),
  status     TEXT NOT NULL DEFAULT 'offline'
             CHECK (status IN ('online', 'offline', 'reconnecting')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shelves_token    ON smart_shelves (token);
CREATE INDEX IF NOT EXISTS idx_shelves_category ON smart_shelves (category);

-- ============================================================================
-- 2. sensor_readings
-- ============================================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_token TEXT NOT NULL REFERENCES smart_shelves(token) ON DELETE CASCADE,
  temperature NUMERIC,
  light       NUMERIC,
  occupied    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_token ON sensor_readings (shelf_token);
CREATE INDEX IF NOT EXISTS idx_readings_time  ON sensor_readings (created_at DESC);

-- ============================================================================
-- 3. events
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_token TEXT NOT NULL REFERENCES smart_shelves(token) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_token ON events (shelf_token);
CREATE INDEX IF NOT EXISTS idx_events_time  ON events (created_at DESC);

-- ============================================================================
-- 4. alerts
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shelf_token TEXT NOT NULL REFERENCES smart_shelves(token) ON DELETE CASCADE,
  level       TEXT NOT NULL DEFAULT 'medium'
              CHECK (level IN ('low', 'medium', 'high')),
  message     TEXT NOT NULL,
  resolved    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_token    ON alerts (shelf_token);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts (resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_time     ON alerts (created_at DESC);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE smart_shelves   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts          ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Drop ALL existing policies on each table (handles legacy names with spaces
-- or any other naming variant) before recreating them cleanly.
-- This prevents error 42710 (duplicate_object) on re-runs.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('smart_shelves', 'sensor_readings', 'events', 'alerts')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END
$$;

-- smart_shelves: anon can read, service_role can do everything
CREATE POLICY "anon_read_shelves"
  ON smart_shelves FOR SELECT TO anon USING (true);

CREATE POLICY "service_all_shelves"
  ON smart_shelves FOR ALL TO service_role USING (true) WITH CHECK (true);

-- sensor_readings: anon can read, service_role can insert / manage
CREATE POLICY "anon_read_readings"
  ON sensor_readings FOR SELECT TO anon USING (true);

CREATE POLICY "service_insert_readings"
  ON sensor_readings FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "service_all_readings"
  ON sensor_readings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- events: anon can read, service_role can insert / manage
CREATE POLICY "anon_read_events"
  ON events FOR SELECT TO anon USING (true);

CREATE POLICY "service_insert_events"
  ON events FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "service_all_events"
  ON events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- alerts: anon can read and update (resolve), service_role can do everything
CREATE POLICY "anon_read_alerts"
  ON alerts FOR SELECT TO anon USING (true);

CREATE POLICY "anon_update_alerts"
  ON alerts FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "service_all_alerts"
  ON alerts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- Enable Realtime for all tables (idempotent via DO block)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'smart_shelves'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE smart_shelves;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'sensor_readings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sensor_readings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
  END IF;
END
$$;
