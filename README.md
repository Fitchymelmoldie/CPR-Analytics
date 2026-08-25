# CPR Analytics Bodyshop Dashboard

CPR Analytics is a React dashboard for collision-repair businesses and their consultants. It turns imported monthly operating data into a customer-scoped performance workspace, with a separate administration area for managing bodyshops, imports, users, reviews, benchmarks and leaderboard groups.

## Current product behavior

- Supabase authentication with `ADMIN` and `CUSTOMER` roles.
- Customer accounts see only their assigned bodyshop workspace.
- Administrators enter a customer's workspace from Customer Management and can return to the admin area without changing identity or permissions.
- Eight configurable operational KPI cards drive the Performance Pulse.
- A Metric Library drawer supports add, remove, reorder and reset, with bodyshop-level layout persistence.
- Performance Story provides 3M, 6M, 12M, Australian FYTD and custom date ranges with selectable data points.
- Business Snapshot presents Total Sales, Paint Sales, Daily actual and Daily budget in a compact financial summary.
- Reporting-period changes update the snapshot, KPI cards, movement, targets, rolling figures and story data together.
- Desktop and mobile use the same production component tree.

## Technology

- React 19 and Vite
- Tailwind CSS 4
- Supabase Auth, Postgres, Row Level Security and Edge Functions
- Chart.js and React Chart.js 2
- Papa Parse for CSV ingestion and `read-excel-file` for Excel `.xlsx` ingestion
- Vitest and Testing Library
- Playwright for browser smoke tests
- Vercel for protected Preview and production hosting

## Local setup

Prerequisite: a current Node.js LTS release. Python is not required.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with the browser-safe Supabase values:

   ```text
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

Vite embeds `VITE_*` variables in the browser bundle. Never place a Supabase service-role key or another server secret in a `VITE_*` variable.

## Commands

```bash
npm run dev          # local development server
npm test -- --run    # unit and integration suite
npm run test:e2e     # Playwright browser smoke tests
npm run lint         # static checks
npm run build        # production build
npm run preview      # serve the built app locally
```

## Safe visual Preview

The shared demo route is enabled only when `VITE_UI_PREVIEW=true` and the URL includes `?layout-preview=1`. It renders the production dashboard components with deterministic demo data for visual review. This flag must remain disabled in production.

Release work follows this order:

1. Run the local test, E2E, lint, build, audit and whitespace gates.
2. Deploy the current source to a protected Vercel Preview.
3. Verify desktop and mobile behavior.
4. Obtain explicit approval before any commit, push or production deployment.

See [CURRENT_HANDOFF.md](CURRENT_HANDOFF.md) for the authoritative current state and [CHANGELOG.md](CHANGELOG.md) for the historical record.
