# Oravel Lifestyle 2.0 — separated client and server

This release is based on the previously delivered MongoDB edition. The storefront, styling, COD checkout, account flows, order tracking, admin dashboard, WhatsApp and optional assistant are retained. The source pages are JavaScript templates, not standalone HTML files. This is a lightweight Node build, not a React/Next.js migration.

## Folder layout

- `client/`: public storefront/admin UI, JavaScript page templates, CSS, images, local dev server and build configuration.
- `server/`: API-only Node backend, MongoDB driver, authentication/OTP, product catalog seed, DNS preload and Vercel function adapter.
- `client/dist/`: generated browser files, ignored by Git. Only generated output is deployed by the client project.
- `server/public/`: only a robots file, no server source.

## Local setup (PowerShell, Node.js 22+)

1. Extract the ZIP, open the new `Oravel-Lifestyle-Separated` folder in VS Code.
2. In the first terminal:

```powershell
cd server
npm install
Copy-Item .env.example .env
code .env
```

Instead of copying the example, you may copy your existing working MongoDB edition `.env` into `server/.env`. Do not copy it to the client. Keep `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, admin and SMTP credentials unchanged if they already work. Set `PORT=5000`, `PUBLIC_BASE_URL=http://localhost:5000`, `CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`. Keep OTP return flags false. Save, then run:

```powershell
npm run test:db
npm start
```

3. Open a second terminal at the project root:

```powershell
cd client
Copy-Item .env.example .env
npm run dev
```

The client has no npm dependencies. `npm run dev` builds and serves the frontend on port 5173; restart it after editing a source file or changing the API URL. It can load its UI with the backend stopped, but authentication, OTP, orders and admin data require the backend. Open `http://localhost:5173/`, admin `http://localhost:5173/admin`; API health is `http://localhost:5000/api/health`. Do not use Live Server or open the generated HTML directly. The Windows DNS preload from the previous edition is included in all server commands.

## Separate Vercel deployments

Use a **private GitHub repository**, with both folders committed (or two separate private repositories). Do not commit the real `.env`, `.env.local`, `node_modules`, `.vercel` or `dist`. Check `git status` before committing. If secrets were committed previously, rotate them. The examples contain placeholders only. Git ignores do not hide previously tracked files.

Create two Vercel projects from the repository, choosing the respective Root Directory in each project. For a real commercial storefront, Vercel's Hobby plan is not appropriate; use a plan that permits commercial use.

### Server first (Root Directory: `server`)

Framework preset: Other. The checked-in `vercel.json` configures an API function, route rewrites and a public output directory. Do not set `npm start` as a Vercel build command. Set actual `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, SMTP configuration, other needed variables from `server/.env`, and `NODE_ENV=production` (unless automatically provided) in server project Environment Variables. `PUBLIC_BASE_URL` should be the final server origin and `CLIENT_ORIGINS` should be the final client origin(s), comma-separated, without a trailing slash. Do not use wildcard CORS. Keep OTP debug flags false. Atlas must allow traffic from the backend hosting network. Prefer least-privilege credentials and network access; if dynamic egress requires 0.0.0.0/0, use strong credentials, TLS and restricted DB permissions. Turn off deployment protection for the intended public production API only as required, not private previews.

Example backend URL (not an actual deployment): `https://oravel-server.vercel.app`. Check `/api/health` after deploy. Do not expose database credentials in client variables.

### Client second (Root Directory: `client`)

Framework preset: Other. Build: `npm run build`. Output directory: `dist`. Set `PUBLIC_API_BASE_URL=https://YOUR-SERVER.vercel.app` in client Environment Variables, using the actual backend origin. The build will reject localhost on Vercel. Redeploy when changing the build-time URL. Copy the actual deployed client origin to `CLIENT_ORIGINS` in the server project, and redeploy the server. Access the storefront using the client URL and admin using `/admin`. No need to manually visit/wake the API URL before the client.

## Important security and operational limits

- Private GitHub protects repository source from unauthorized GitHub users. Public web browsers necessarily receive HTML, CSS and JS. Renaming HTML or building pages does not prevent inspection/copying of frontend code. Admin UI is public by URL but admin API routes require signed admin authorization. Removing the footer admin link and noindex are not authorization controls.
- Backend source, MongoDB/SMTP credentials and signing secret must remain server-side. The server does not serve frontend/static source files. The browser only receives the public API origin.
- The two copies of the catalog (`client/src/scripts/products.js` and `server/catalog.js`) must be kept in sync when changing prices or products. The server seeds MongoDB and validates order totals; no data migration or deletion is performed by this release.
- Existing rate limits use process memory and are not global across Vercel instances. Before real public sales, implement shared durable rate limiting and review OTP abuse controls. CORS is not a substitute for authentication.
- Real Atlas connection, SMTP delivery, checkout and Vercel deployment require your environment and are not verified by this package alone. Keep the same database name and URI to use existing data.

## Test checklist before GitHub / deployment

- `npm run test:db` succeeds; `/api/health` says MongoDB connected.
- Client loads at port 5173, products/categories display, cart works.
- Signup via real email OTP, login, forgot password; if phone OTP is used, configure SMS.
- Place a test COD order, check order success and history, verify data in Atlas.
- Admin login, data viewing, status changes and export.
- Test again on the two production URLs. Confirm secrets and source paths are not exposed on the API domain.
