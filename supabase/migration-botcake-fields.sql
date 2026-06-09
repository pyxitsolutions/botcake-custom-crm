-- Run this in Supabase SQL Editor if you have the old WaterTech schema

-- Customers: add new columns, remove old ones
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company TEXT;

ALTER TABLE customers DROP COLUMN IF EXISTS location;
ALTER TABLE customers DROP COLUMN IF EXISTS messenger_id;

-- Leads: add new Botcake columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_goal TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'botcake';

-- Migrate old lead data if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'property_type') THEN
    UPDATE leads SET project_type = property_type WHERE project_type IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'issue') THEN
    UPDATE leads SET project_goal = issue WHERE project_goal IS NULL;
  END IF;
END $$;

-- Remove old lead columns
ALTER TABLE leads DROP COLUMN IF EXISTS property_type;
ALTER TABLE leads DROP COLUMN IF EXISTS issue;

-- Update defaults
UPDATE leads SET status = 'Qualified Lead' WHERE status = 'New Lead';
UPDATE leads SET source = 'botcake' WHERE source IS NULL;

-- Backfill any nulls before NOT NULL constraints
UPDATE leads SET project_type = 'Unknown' WHERE project_type IS NULL;
UPDATE leads SET project_goal = 'Unknown' WHERE project_goal IS NULL;

ALTER TABLE leads ALTER COLUMN project_type SET NOT NULL;
ALTER TABLE leads ALTER COLUMN project_goal SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
