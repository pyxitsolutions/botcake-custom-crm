-- Lead Management System
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL,
  project_goal TEXT NOT NULL,
  budget TEXT,
  timeline TEXT,
  source TEXT NOT NULL DEFAULT 'botcake',
  status TEXT NOT NULL DEFAULT 'Qualified Lead',
  sheet_row_id INTEGER UNIQUE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_sheet_row_id ON leads(sheet_row_id);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Migration from old WaterTech schema:
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE customers ADD COLUMN IF NOT EXISTS company TEXT;
-- ALTER TABLE customers DROP COLUMN IF EXISTS location;
-- ALTER TABLE customers DROP COLUMN IF EXISTS messenger_id;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_type TEXT;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_goal TEXT;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget TEXT;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline TEXT;
-- ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'botcake';
-- UPDATE leads SET project_type = property_type WHERE project_type IS NULL AND property_type IS NOT NULL;
-- UPDATE leads SET project_goal = issue WHERE project_goal IS NULL AND issue IS NOT NULL;
-- ALTER TABLE leads DROP COLUMN IF EXISTS property_type;
-- ALTER TABLE leads DROP COLUMN IF EXISTS issue;

-- Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert leads"
  ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view notes"
  ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert notes"
  ON notes FOR INSERT TO authenticated WITH CHECK (true);
