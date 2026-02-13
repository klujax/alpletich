# Deployment Guide

This guide outlines the steps to deploy the application to a production environment (e.g., Vercel).

## 1. Environment Variables

You must set the following environment variables in your deployment platform settings:

| Variable Name | Description | Example Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://your-project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project Public/Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

> **Note:** These variables are required for the application to connect to your Supabase backend. Without them, the app might revert to mock data mode or fail to load data.

## 2. Database Setup

Ensure all database tables are created. Run the following migrations in your Supabase SQL Editor if you haven't already:

1.  `supabase/migrations/001_schema.sql` (Initial Setup)
2.  `supabase/migrations/002_storage.sql` (Storage Buckets)
3.  `supabase/migrations/003_missing_tables.sql` (Missing Tables)
4.  `supabase/migrations/004_add_ban_columns.sql` (Admin Users Functionality) **(New)**

## 3. Build & Deploy

This project uses Next.js and can be easily deployed to Vercel.

### Option A: Vercel (Recommended)

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Import the project in Vercel.
3.  In the "Environment Variables" section during import, add the variables listed in Step 1.
4.  Click "Deploy".

### Option B: Manual Build

To build the project locally for production:

```bash
npm run build
npm start
```

## 4. Post-Deployment Checks

1.  **Admin Access**: Ensure your user has the `admin` role in the `profiles` table. Run the SQL update command provided in the chat history if needed.
2.  **Images**: If using Supabase Storage, ensure your project URL is whitelisted in `next.config.ts` under `images.remotePatterns`. (Already configured for `pcmizxwhfmedklozehgl.supabase.co`).
