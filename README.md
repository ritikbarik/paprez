# PAPrez

Smart Printing Simplified — a modern print order management platform connecting customers, print shop owners, delivery agents, and admins.

## What it is

PAPrez solves the chaotic WhatsApp-based print order workflow by digitizing order capture, print configuration, delivery coordination, and payment tracking.

## Built-in features

- Customer signup, login, forgot password
- Free demo OAuth sign-in flow for customer onboarding
- Upload PDF/documents with print options
- Upload validation for PDF, DOC, DOCX, and TXT files up to the configured size limit
- AI document editing by page/data range for print preparation
- Order queue, status updates, accept/reject flow
- Delivery assignment, OTP delivery confirmation
- OpenStreetMap-powered print hub map and directions
- Admin controls for users, shops, orders, revenue and complaints
- Real-time dashboard UI, order search, urgency tags, filters, analytics
- Responsive mobile-first design with dark/light styling

## Tech stack

- Next.js 14 (App Router)
- React + Tailwind CSS
- Prisma + SQLite for demo database
- REST API routes for auth, orders, shops, deliveries
- JWT authentication and role-based access
- OpenRouter-compatible AI editing endpoint
- OpenStreetMap embeds for map discovery

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create Prisma database:

   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`

## Backend roadmap

The frontend is complete enough for the main product flow. The next full-functionality milestone is to replace the demo backend pieces with Supabase:

- Use Supabase Storage for customer document uploads so files are retained until printouts are delivered.
- Use Supabase Auth for production signup, login, password recovery, and OAuth instead of the current demo JWT/OAuth bridge.
- Keep admin as the highest-permission role, with control over users, shops, orders, deliveries, revenue, complaints, and process status.
- Add storage retention cleanup after delivery completion so uploaded files are not kept longer than needed.

Suggested Supabase production variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=print-uploads
```

## Deployment

- Set `DATABASE_URL`, `JWT_SECRET`, `PLATFORM_FEE_PERCENT`, `UPLOAD_RETENTION_HOURS`, and `UPLOAD_MAX_BYTES` in production environment.
- For the Supabase milestone, also set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.
- Optional AI settings: set `OPENROUTER_API_KEY` to enable live AI document editing and `OPENROUTER_MODEL` to override the default free model.
- The default OpenRouter model is `poolside/laguna-xs-2.1:free`, selected because OpenRouter currently lists it as free with zero prompt/completion pricing and a long context window.
- The OAuth flow is currently a free demo bridge at `/api/auth/oauth/demo`; replace it with a production Google/GitHub OAuth provider before launch.
- Build with `npm run build` and run with `npm start`.

## Notes

- Uploaded files are stored locally in `public/uploads` for demo. The planned production path is Supabase Storage with delivery-based retention.
- Without an OpenRouter key, the AI editor falls back to local text cleanup so the flow remains usable.
- OpenStreetMap is used through public embeds and direction links, so no paid map key is required for the current implementation.
- Payment integration is scaffolded via `payments` schema and architecture, ready for Stripe or other providers.
