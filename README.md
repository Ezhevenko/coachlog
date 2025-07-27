# CoachLog

A simple Next.js app for tracking workout programs.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust values. At minimum set:
   ```env
   JWT_SECRET=changeme
   ```

## Development

Run the development server:
```bash
npx next dev
```
Open `http://localhost:3000` in your browser.

## Tests and Type Checking

Run the basic import tests and TypeScript compilation:
```bash
npm test
npx tsc -p tsconfig.json
```

## Deployment

Build using `next build` or your hosting provider's build step. Ensure `JWT_SECRET` is configured in the environment.
