-- Run this in Supabase SQL Editor
-- Adds authentication: each row is owned by a specific user
-- ============================================================

-- 1. Add user_id column to both tables
ALTER TABLE columns ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE tasks   ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2. Drop old open-access policies
DROP POLICY IF EXISTS "public_all_columns" ON columns;
DROP POLICY IF EXISTS "public_all_tasks"   ON tasks;
DROP POLICY IF EXISTS "auth_columns"       ON columns;
DROP POLICY IF EXISTS "auth_tasks"         ON tasks;

-- 3. New policies: only the owner can see/edit their rows.
--    user_id IS NULL covers rows created before auth was added
--    (the app will claim them automatically on first login).
CREATE POLICY "auth_columns" ON columns FOR ALL
  USING  (auth.uid()::text = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "auth_tasks" ON tasks FOR ALL
  USING  (auth.uid()::text = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);
