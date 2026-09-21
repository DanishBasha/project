# Supabase Online Setup Guide

Follow these simple steps to set up your online Supabase PostgreSQL database:

### 1. Create Free Supabase Project
1. Go to [https://supabase.com/](https://supabase.com/) and log in (or sign up with GitHub).
2. Click **"New Project"**.
3. Name your project: `ai-incident-response-soc` (or any name you like).
4. Set a strong database password (keep this noted).
5. Select the closest region (e.g. `ap-south-1` for Mumbai / India).
6. Click **"Create new project"** (takes ~1 minute to spin up).

### 2. Run Database Schema
1. Once your project is ready, click on the **SQL Editor** tab (icon `>_` on the left sidebar).
2. Click **"New Query"**.
3. Copy the entire contents of [`schema.sql`](./schema.sql) and paste it into the editor.
4. Click the green **Run** button.
5. You will see `Success. No rows returned`.
6. Open the **Table Editor** on the left sidebar to verify all 8 tables were created:
   - `security_incidents`
   - `incident_logs`
   - `indicators_of_compromise`
   - `threat_findings`
   - `mitre_techniques`
   - `risk_assessments`
   - `response_recommendations`
   - `agent_executions`

### 3. Retrieve API Credentials
1. In your Supabase dashboard, click the **Settings** gear icon at the bottom left.
2. Select **API** (under Project Settings).
3. Copy the two values:
   - **Project URL**: `https://xxxxxxxxxxxxxx.supabase.co`
   - **Project API Anon Key**: `eyJhbGciOi...`
4. Paste them into `server/.env`:
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

*Note: The platform is built with an automatic fallback mock layer, meaning if you run the platform locally before setting up Supabase, it will still function completely and seamlessly!*
