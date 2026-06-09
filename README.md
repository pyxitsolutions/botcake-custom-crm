# WaterTech PH — Lead Management System

A production-ready CRM dashboard for managing water treatment leads synced from Google Sheets.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Auth + Database)
- **React Hook Form** + **Zod**
- **TanStack Table**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Create a user in **Authentication → Users** for your sales team
4. Copy `.env.local.example` to `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Google Sheets Integration

### Sheet format (Row 1 = headers) — "Website Leads"

| Messenger ID | Date Submitted | Name | Phone | Location | Issue | Property |
|--------------|----------------|------|-------|----------|-------|----------|
| 27756163207356997 | 20:26:32 07-06-2026 | rio | 09123456789 | iligan | bas odor | residential |

### Setup

1. Create a Google Cloud service account and enable **Google Sheets API**
2. Download the service account JSON key
3. Share your Google Sheet with the service account email (Editor access)
4. Add env vars to `.env.local` (see `.env.local.example`)
5. Run the SQL migration if you already created tables:
   ```sql
   ALTER TABLE customers ADD COLUMN IF NOT EXISTS messenger_id TEXT UNIQUE;
   ALTER TABLE leads ADD COLUMN IF NOT EXISTS sheet_row_id INTEGER UNIQUE;
   ALTER TABLE leads ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
   ```
6. Click **Sync from Google Sheet** on the Dashboard

### Automated sync (optional)

```bash
POST /api/sync/sheets
Authorization: Bearer YOUR_CRON_SECRET
```

## Features

- **Authentication** — Supabase Auth with protected routes
- **Dashboard** — Lead pipeline stats and recent activity
- **Lead Management** — Search, filter by status, update status
- **Customer Management** — Customer list and detail views
- **Notes** — Add and view notes per lead
- **API** — Botcake webhook endpoint with Zod validation

## Project Structure

```
src/
├── app/           # Pages and API routes
├── components/    # UI and feature components
├── hooks/         # Custom React hooks
├── lib/           # Supabase, actions, validations
└── types/         # TypeScript types
```

## Deployment

Deploy to Vercel and set the same environment variables. Point your Botcake webhook to `https://your-domain.com/api/leads`.
