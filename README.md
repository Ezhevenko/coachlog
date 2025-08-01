# CoachLog

A simple Next.js app for tracking workout programs.

Requires **Node.js 18** or **Node.js 20**.

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
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
  NEXT_PUBLIC_TELEGRAM_APP_NAME=
  BOT_TOKEN=
  TELEGRAM_BOT_TOKEN=
  WEBAPP_URL=
  ```

Replace the default `JWT_SECRET` value with a strong secret before deploying the application.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be provided for production builds.
`NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` should be the bot's username without the `@`.
`NEXT_PUBLIC_TELEGRAM_APP_NAME` should be the path segment of your mini app, if any.
`BOT_TOKEN` and `TELEGRAM_BOT_TOKEN` are Telegram API tokens for bot authentication.
`WEBAPP_URL` is the public URL where the app will be deployed.

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
