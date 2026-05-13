# Textbook Marketplace

A campus textbook marketplace built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase client helpers with typed database access
- Supabase CLI migrations in `supabase/migrations`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Supabase locally:

   ```bash
   npm run supabase:start
   npm run supabase:reset
   ```

3. Copy the API values printed by Supabase into `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

The app runs at `http://localhost:3000`. Supabase Studio runs at `http://localhost:54323`.

## Database Workflow

Create new migrations with the Supabase CLI:

```bash
supabase migration new descriptive_name
```

Apply local migrations:

```bash
npm run supabase:reset
```

Push migrations to a linked remote Supabase project:

```bash
supabase link --project-ref your-project-ref
npm run supabase:push
```

Regenerate TypeScript database types after schema changes:

```bash
npm run supabase:types
```

## Current Schema

- `locations`: location filter data. The user-facing app currently labels these as campuses, but the table can also support cities or other regions later.
- `marketplace_items`: active marketplace items. The user-facing app currently treats them as textbook listings, but the table name leaves room for future item categories.

Row-level security is enabled. Anonymous users can read locations and active listings, and authenticated users can create owned listings that satisfy basic validation checks.
