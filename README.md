# Calculators Point

Calculators Point is a React application served by a Node.js and Express server. Vite handles the client build and development middleware. The calculator formulas, calculator catalog, and shared UI remain in `src/`.

## Run locally

```bash
npm install
npm run dev
```

The development server listens on port 3000 by default. Set `PORT` to use another port.

## Production

```bash
npm run build
npm start
```

The production server serves the Vite output from `dist/`. Set `FORCE_HTTPS=false` only for local HTTP checks. For production behind a TLS-terminating proxy, forward `X-Forwarded-Proto: https`; HTTPS redirects are enabled by default.

The contact endpoint is `POST /api/contact`. It validates submissions, checks the honeypot field, limits repeated submissions, and stores accepted messages through Firestore REST when the server has `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` configured. Keep these values in server environment variables.

## Deploy to Vercel

Import the repository with its root set to this project directory. Vercel uses the Vite build in `vercel.json` and serves the generated `dist/` files; the API routes are handled by the function in `api/[...route].js`. Add the Firebase `VITE_FIREBASE_*` values from `.env.example` in the Vercel project settings if browser Firebase features are enabled. Add `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` as server environment variables to enable contact form storage. Do not commit a local `.env` file.

## Useful commands

```bash
npm run build
npm run validate:calculators
npm run test:unit
```

The previous Next.js App Router source is retained under `_archive/legacy-next-app/` for reference. It is not part of the build or runtime.
