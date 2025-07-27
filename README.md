# CoachLog

A simple Next.js app for tracking workout programs.

## Setup

1. Install dependencies (this runs a postinstall script to create module aliases):
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure your credentials:
   ```env
   JWT_SECRET=changeme
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=service_role_key
   ```

## Development

Run the development server:
```bash
npx next dev
```
Open `http://localhost:3000` in your browser.

## Tests and Type Checking

Install dependencies first:
```bash
npm install
```

Then run the basic import tests and TypeScript compilation:
```bash
npm test
npx tsc -p tsconfig.json
```

## Deployment

Build using `next build` or your hosting provider's build step. Ensure `JWT_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are configured in the environment.
