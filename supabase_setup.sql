-- Run this in your Supabase project → SQL Editor
-- Drops and recreates tables cleanly with TEXT ids (safe to re-run)
-- ============================================================

-- Drop everything in the right order (tasks first due to FK)
DROP TABLE IF EXISTS tasks   CASCADE;
DROP TABLE IF EXISTS columns CASCADE;

-- 1. Columns table — id is TEXT (we use 'todo', 'in-progress', custom ids)
CREATE TABLE columns (
  id       TEXT PRIMARY KEY,
  title    TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

-- 2. Tasks table
CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  column_id   TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  deadline    BIGINT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  BIGINT
);

-- 3. Row Level Security
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_columns" ON columns;
DROP POLICY IF EXISTS "public_all_tasks"   ON tasks;

CREATE POLICY "public_all_columns" ON columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_tasks"   ON tasks   FOR ALL USING (true) WITH CHECK (true);
