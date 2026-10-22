# 🇧🇩 Fintech Receipts BD — Payment Tracking & Receipt Verification PWA

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Self--Hosted-emerald?style=flat&logo=supabase)](https://supabase.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2_Storage-orange?style=flat&logo=cloudflare)](https://developers.cloudflare.com/r2/)

A premium, Apple & Stripe-grade Payment Tracking & Receipt Verification Progressive Web App (PWA) tailored specifically for Bangladesh's multi-channel payment ecosystem (**bKash**, **Nagad**, **Rocket**, and **Bank BEFTN/NPSB**).

---

## ✨ Features

- **Luxury Mobile-First UI/UX:** Refined 8pt spacing system, deep forest green (`#0B2B1F`) and emerald highlights, warm ivory canvas (`#F5F7F3`), and crisp card elevations.
- **Privacy Mode:** Instant eye-toggle to mask sensitive balances in public spaces (`••••••••`).
- **Bangladesh MFS Support:** Native categorization and badges for bKash, Nagad, Rocket, and Bank transfers.
- **Duplicate TrxID Shield:** Database-level uniqueness constraints and API checks reject double payments (`HTTP 409 Conflict`).
- **Real-Time Financial Dashboard:** Live verified BDT volume, pending review tally, inflow vs. outflow analytics, and interactive donut distributions.
- **Cloudflare R2 Encrypted Storage:** Payment receipts and bank slips are isolated in a private bucket (`fintech-receipts-secure`) and delivered via secure short-lived AWS S3 presigned URLs.
- **Audit Trail:** Immutable append-only audit trail logging every payment creation, status shift, and OCR verification step.
- **100% PWA Ready:** Installable on iOS Safari and Android Chrome with custom maskable icons and standalone window mode.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Library:** React 19
- **Styling:** Tailwind CSS v4 + PostCSS
- **Database:** PostgreSQL / PostgREST (Self-Hosted VPS Supabase via Kong Gateway)
- **Object Storage:** Cloudflare R2 (S3 SigV4 Client + Presigner)
- **Icons:** Lucide React
- **Packaging:** pnpm

---

## 🚀 Vercel Deployment Guide

### 1. One-Click Deploy to Vercel
Import this repository (`Shakhwat-93/financeapp`) directly in your [Vercel Dashboard](https://vercel.com/new).

### 2. Configure Environment Variables in Vercel
Add the following variables in **Project Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Self-hosted Supabase Kong API Gateway URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon JWT Token |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Master Key (Server-side only) |
| `R2_ACCOUNT_ID` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` | Dedicated private bucket (`fintech-receipts-secure`) |
| `R2_PUBLIC_URL` | Cloudflare R2 Public URL (if public preview is needed) |

### 3. Build & Development Commands
- **Build Command:** `next build`
- **Install Command:** `pnpm install`
- **Output Directory:** `.next`

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/Shakhwat-93/financeapp.git
cd financeapp

# Install dependencies
pnpm install

# Setup local environment
cp .env.example .env.local
# (Fill in your Supabase & R2 credentials in .env.local)

# Run development server
pnpm dev --port 3005
```

Open [http://localhost:3005](http://localhost:3005) to view the app in your browser.

---

## 🗄️ Database Schema

The database migration is located at [`supabase/migrations/001_initial_fintech_schema.sql`](supabase/migrations/001_initial_fintech_schema.sql):
- `public.ft_payments` (Ledger of all BDT transactions)
- `public.ft_receipts` (Cloudflare R2 keys & OCR match data)
- `public.ft_merchants` (Directory of verified recipients)
- `public.ft_audit_trail` (Immutable audit event log)

---

## 🔒 Security & Privacy

- All credentials and API keys are strictly excluded via `.gitignore` (`.env.local` is never committed).
- Receipts are stored in a private bucket with signed URL access to protect customer PII.
- Zero data collision with external tables (`cb_*`, `csd_*`).
