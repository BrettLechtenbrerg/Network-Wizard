# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture Overview

This is a Next.js 15 voice-powered networking application with Supabase backend that captures contact details through natural conversations and syncs to GoHighLevel CRM.

### Core Components

- **Authentication**: Supabase Auth with magic link passwordless sign-in
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Voice Integration**: Placeholder for Vapi integration (simulated in current implementation)
- **CRM Sync**: GoHighLevel webhook integration

### Key Directories

- `src/app/api/` - API endpoints for voice token generation, intake processing, and test sends
- `src/app/auth/` - Authentication flow pages (login, callback, error handling)
- `src/app/dashboard/` - User dashboard for viewing captured contacts
- `src/app/setup/` - Initial tenant configuration (slug and GHL webhook URL)
- `src/app/v/[slug]/` - Dynamic voice capture pages with JWT protection
- `src/lib/supabase/` - Supabase client/server configuration
- `src/middleware.ts` - Authentication middleware protecting routes

### Database Schema

Two main tables:
- `tenants` - User accounts with unique slugs and GHL webhook URLs
- `intakes` - Captured contact data (name, email, phone, business, fun_fact)

### Security Model

- JWT tokens with 10-minute expiry for voice page access
- RLS policies on all database tables
- Protected routes via middleware (dashboard, setup, voice pages)
- Server-side webhook URL validation

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_BASE_URL` - Application base URL

### Voice Integration Flow

1. Generate JWT token via `/api/issue-voice-token`
2. Voice page loads with token authentication
3. Vapi assistant collects: full_name, email, phone, business_name, fun_fact
4. Data submitted to `/api/voice-intake` with Bearer token
5. Automatic sync to configured GHL webhook

### Tech Stack

- Next.js 15 with TypeScript and Tailwind CSS
- Supabase for auth and database
- JWT for voice page security
- Vercel deployment ready