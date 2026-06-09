-- Run this if you already have the old WaterTech tables

ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company TEXT;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_goal TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'botcake';

-- Migrate old data if columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'property_type') THEN
    UPDATE leads SET project_type = property_type WHERE project_type IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'issue') THEN
    UPDATE leads SET project_goal = issue WHERE project_goal IS NULL;
  END IF;
END $$;

UPDATE leads SET status = 'Qualified Lead' WHERE status = 'New Lead';
UPDATE leads SET source = 'botcake' WHERE source IS NULL;

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
