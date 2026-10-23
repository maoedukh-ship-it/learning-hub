# Learning Hub — Learn • Grow • Achieve

**Learning Hub** is an enterprise Learning Management System (LMS) and Corporate Training Platform built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## 1. Official Brand Identity

- **Platform Name:** Learning Hub
- **Tagline:** Learn • Grow • Achieve
- **Palette:**
  - Deep Navy Blue: `#0B1F3A`
  - White: `#FFFFFF`
  - Primary Blue Accent: `#2563EB`
  - Light Gray: `#F3F4F6`
  - Dark Text: `#111827`
  - Secondary Text: `#6B7280`

## 2. Security & Administrator Account Provisioning

- **Initial Super Admin Profile:**
  - **Full Name:** `System Admin`
  - **Login Identifier / Email:** `learning@wing-shop.com`
  - **Role:** `Super Admin` (`super_admin`)
- **Public Learner Registration Disabled:** Public self-registration is strictly disabled at both the UI and API levels (`/api/hub`). Only authorized Super Administrators can provision learner, instructor, or manager accounts.
- **Database Schema & RLS:** Full normalized PostgreSQL schema (29 tables) and Row-Level Security (RLS) policies are located in `supabase/migrations/0001_learning_hub_schema_and_rls.sql`.
- **Controlled Provisioning Script:** Run `INITIAL_ADMIN_PASSWORD="<secure-secret>" npx tsx scripts/provision-admin.ts` to provision the initial administrator idempotently against an external Supabase project without resetting existing passwords.

## 3. Google Sheets Live Integration

Learning Hub integrates with the **Google Sheets API v4** (`https://www.googleapis.com/auth/spreadsheets`) using client-side Google OAuth (`lib/google-workspace.ts`) with in-memory token caching and server-side API routes (`app/api/sheets/route.ts`):
- Dynamically discovers spreadsheet tab names before reading cell ranges.
- Exports Course Completion & Compliance reports and Corporate Training Needs Analysis (TNA) matrices directly to Google Sheets after explicit user confirmation.

## 4. Testing & Quality Assurance

Run the automated unit test suite (covering Authentication, RBAC Authorization, Course Progress Calculation, Server-Side Assessment Grading, Certificate Verification, and TNA Gap Calculation):

```bash
tsx --test lib/lms-logic.test.ts
```
