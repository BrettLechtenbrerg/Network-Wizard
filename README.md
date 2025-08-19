# Cardless Networking - Vapi MVP

A voice-powered networking application that captures contact details through natural conversations and syncs them to GoHighLevel CRM.

## Features

- **Magic Link Authentication** - Passwordless sign-in via email
- **Voice Capture** - Natural voice conversations to collect contact info
- **GHL Integration** - Automatic sync to GoHighLevel CRM
- **Unique Voice Pages** - Custom URLs for different events/contexts
- **Real-time Dashboard** - View captured contacts and usage stats
- **JWT Security** - Secure voice page access with short-lived tokens

## Quick Start

1. **Environment Setup**
   
   Configure your environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `JWT_SECRET` - A secure random string for JWT signing
   - `NEXT_PUBLIC_BASE_URL` - Your app's base URL (http://localhost:3000 for dev)

2. **Database Setup**
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in your Supabase SQL editor
   - This creates the `tenants` and `intakes` tables with proper RLS policies

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Usage Flow

1. **Sign Up** - User signs in with email magic link
2. **Setup** - Configure unique slug and GHL webhook URL
3. **Share** - Share the voice page URL `/v/{slug}` with attendees
4. **Capture** - Attendees speak their details (name, email, phone, business, fun fact)
5. **Sync** - Contacts automatically sync to GHL CRM
6. **Monitor** - View captured contacts in the dashboard

## API Endpoints

- `POST /api/issue-voice-token` - Generate JWT token for voice page
- `POST /api/voice-intake` - Process voice capture data
- `POST /api/send-test` - Send test contact to GHL webhook

## Voice Page Integration

The voice page (`/v/[slug]`) currently includes a simulated Vapi integration. To integrate with real Vapi:

1. Set up your Vapi assistant with the following script:
   - Collect: full_name, email, phone, business_name, fun_fact
   - Confirm details with user
   - POST to `/api/voice-intake` with Bearer token

2. Replace the simulation in `src/app/v/[slug]/page.tsx` with actual Vapi widget initialization

## Security Features

- Row Level Security (RLS) on all database tables
- JWT tokens with 10-minute expiry for voice pages
- Server-side webhook URL validation
- Rate limiting on intake endpoints (recommended for production)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (Magic Links)
- **Voice**: Vapi (integration placeholder included)
- **Deployment**: Vercel-ready

## Deployment to Vercel

### Prerequisites
- GitHub repository
- Supabase project configured
- Vercel account

### Steps
1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project" and import your GitHub repository

2. **Configure Environment Variables**
   In Vercel project settings, add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_secure_jwt_secret
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   ```

3. **Update Supabase Settings**
   - Add your Vercel URL to Supabase Auth Settings:
     - Site URL: `https://your-app.vercel.app`
     - Redirect URLs: `https://your-app.vercel.app/auth/callback`

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - First deployment creates your production URL

## Production Checklist

- [ ] Configure all environment variables in Vercel
- [ ] Set up Supabase project and run schema
- [ ] Update Supabase Auth settings with production URLs
- [ ] Configure Vapi assistant and webhook
- [ ] Add rate limiting to intake endpoints
- [ ] Set up monitoring and error tracking
- [ ] Configure custom domain (optional)
- [ ] Test GHL webhook integration

## File Structure

```
src/
├── app/
│   ├── api/                    # API endpoints
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # User dashboard
│   ├── setup/                  # Initial setup page
│   ├── v/[slug]/              # Voice capture pages
│   └── page.tsx               # Landing page
├── lib/
│   ├── supabase/              # Supabase client/server setup
│   └── types/                 # TypeScript definitions
└── middleware.ts              # Auth middleware
```

This is a complete MVP implementation following the PRD specifications, ready for deployment and testing.
