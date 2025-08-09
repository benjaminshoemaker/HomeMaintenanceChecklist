# Seasonal Home Checklist (Starter)

A minimal MVP scaffold for the **Seasonal Home Checklist** app:
- Guest mode onboarding (ZIP + home features)
- Prompt to save with **Google** (Supabase Auth)
- Checklist generation from templates (client-side for now)
- **ICS export** API route (single calendar file)
- Ready for **GitHub → Render** deploy, with **Replit** dev

---

## Stack

- **Next.js 14** (App Router, JS)
- **Supabase** (Postgres + Google Auth)
- **Render** (web service hosting)
- **Replit** (dev), **GitHub** (source of truth)

## Quick Start (Local / Replit)

1. Create a **Supabase** project.
   - In **Authentication → Providers → Google**, enable Google.
   - Add redirect URLs: `http://localhost:3000` and your Render URL later.
   - Copy `Project URL` and `Anon Key`.

2. Set env vars
   - Copy `.env.example` → `.env.local` and fill:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SITE_URL` (local dev: `http://localhost:3000`)

3. Install & run
   ```bash
   npm install
   npm run dev
   ```

4. Visit `http://localhost:3000`

## Deploy to Render

1. Push this repo to **GitHub**.
2. In **Render → New → Web Service**, pick the repo.
3. Set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://<your-service>.onrender.com`
5. Deploy.

> Supabase OAuth callback will use `NEXT_PUBLIC_SITE_URL` so ensure it matches your Render URL.

## Database (future server persistence)

MVP uses client-side data to keep things simple. When you're ready:
- Run `supabase/schema.sql` in the Supabase SQL editor to create tables.
- Migrate checklist generation from client to server/API route.
- Use Row Level Security (RLS) to scope data by `auth.uid()`.

## Referral Links (post-MVP)

Add **link-out** buttons on task cards (Taskrabbit, Angi/HomeAdvisor). Keep it simple:
- Add an FTC disclosure on the page.
- Use affiliate deep links; no PII passed; tracking handled by the network.

## Project Layout

```
app/
  api/ics/route.js          # Generates an .ics file for tasks
  globals.css
  layout.js
  page.js                   # Onboarding + checklist + save prompt
components/
  Checklist.js
  OnboardingForm.js
  SavePromptModal.js
data/
  taskTemplates.js          # Seed tasks (client-side for MVP)
lib/
  supabaseClient.js
utils/
  generateTasks.js          # Rule engine (simple heuristics)
supabase/
  schema.sql                # DB schema for server persistence (later)
.env.example
next.config.js
package.json
README.md
```

## Notes

- This starter emphasizes speed. It's intentionally light on styling and server-side write logic.
- You can later:
  - Move generation to an API route using DB `task_templates`.
  - Persist `generated_tasks` and `completions` when signed in.
  - Add ICS spacing controls (weekend clustering).
  - Add a basic admin dashboard for metrics.
