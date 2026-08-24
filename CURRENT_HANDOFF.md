# Current Handoff

Last updated: 24 August 2026, 10:34 PM AEST

This document is the authoritative current-state snapshot. Historical implementation and Preview details belong in `CHANGELOG.md`.

## Release status

- Stage: production release complete. The verified source, Supabase Edge Functions and Vercel production deployment are live and have passed post-deployment browser checks.
- Working branch: `agent/bodyshop-audit-hardening`.
- Released source commit: `fd80154` (`fix: restore mobile workspace visibility`), following `d00acfc` and `b0d9617`; all three source commits are published on `origin/agent/bodyshop-audit-hardening`.
- Working-tree state: only generated Playwright output and user-owned Preview evidence remain outside the release commits by design.
- Production: `https://bodyshop-dashboard.vercel.app`, deployment `dpl_J3NLqNJQXq5WBKWNmFEBqwENRqQn`, `READY`, target `production`, deployed from the verified clean `fd80154` source tree.
- Latest protected Preview: `https://bodyshop-dashboard-9qbu58o3u-cpr-analytics.vercel.app/?layout-preview=1`, deployment `dpl_ASU5mMhHC7nStKEmYytvzKSQaCra`, `READY`, target `preview`, HTTP 200 and `X-Robots-Tag: noindex`.
- Current production release: the dashboard is now a neutral monthly snapshot rather than a target score. It reports KPI completeness, directs users into the existing multi-month Performance Story, keeps targets optional, adds a compact Latest Consultant Review entry point, and distinguishes loading from genuinely missing data or targets. Historical review creation opens the month being viewed, and the customer-view role boundary is consistent across authenticated and protected-demo routes.
- Production release baseline: Data & Imports offers bulk CSV import and Quick KPI Entry for one metric/month, missing values remain visibly incomplete, Gamified Leaderboards is deferred, and the site-wide content hierarchy avoids repeated instructional copy. These production features remain on the deployment above.
- Earlier review follow-up: the entire product uses one Codex-native visual and interaction system across Customer Management, Data & Imports, profile, reviews, authentication, dialogs and KPI reporting. KPI reordering is deterministic on pointer, touch and keyboard. KPI charts use clean adaptive Y scales, year-aware X labels, directional external goal keys and one compact target-aware tooltip that previews on hover/focus and pins on click/tap; browser-native duplicate tooltips have been removed. The plot uses one stable crosshair and continuous nearest-month hover regions, eliminating the arrow/hand flicker and dead zones between points.
- Production was promoted and aliased only after the local test/build/lint gates, Supabase audit, Vercel inspection, desktop/mobile smoke checks and hosted browser checks were green.

Do not make another production deployment without explicit approval.

## What is in the release candidate

### Dashboard and navigation

- The entire application uses a restrained Codex-native product system: near-black and graphite surfaces, compact controls, quiet one-pixel borders, consistent `10-14px` radii, accessible focus states and deliberate `160-220ms` motion. Decorative glows, oversized glass, large radii and hover lifting have been removed or reduced.
- The Workspace and Metrics panels follow the requested Codex-style toggle pattern: each persistent top-bar button changes its expanded state and direction, opens on the first click and closes on the second click. Desktop panels use `272px` / `384px` layout space and can remain open independently. Below the desktop breakpoint they become mutually exclusive slide-over panels beginning beneath the persistent `56px` header, so the same toggle remains visible and usable while its panel is open.
- The dashboard welcomes the selected bodyshop and removes the redundant current-bodyshop and data-status strips.
- Administrators open a bodyshop from Customer Management, inspect the same customer-facing workspace and return through a clear `Return to Admin` action.
- The duplicate `Active bodyshop` selector is removed from the sidebar.
- The account area is integrated into the sidebar hierarchy instead of appearing as a floating pill.
- Reporting period is a compact toolbar control, not a nested card.

### Administration and supporting workspaces

- Customer Management is a dense administrative index with search, result count, stable actions and a right-side customer account inspector. Technical identity, assignment, workspace access and the existing delete actions are progressively disclosed without depending on hover-only discovery.
- Data & Imports presents two primary monthly-update paths: bulk CSV import and Quick KPI Entry with a month picker, KPI selector, current-value disclosure and a one-field-only save. The Full Month Editor remains available underneath for broad review and correction.
- Gamified Leaderboards is deferred behind `FEATURE_FLAGS.leaderboards = false`; its code and data structures are preserved, but it is absent from active navigation and Preview journeys.
- Shop Profile, Consultant Reviews, login, password setup, target editing, reporting-period creation, confirmations, notifications and empty/error states share the same surface, form and dialog language.
- KPI calculations, CSV parsing, Supabase service interfaces, permissions, roles, saved layouts and persistence contracts are unchanged by the design pass.

### KPI experience

- Eight operational KPIs drive the monthly snapshot completeness ring; peer-group rank wording and card badges are removed. Targets remain optional context on individual KPIs and do not define the dashboard headline.
- The Operational KPI guide is available from a shared accessible information control immediately before Export; it uses the same glyph, visible circle, 32 x 32 pointer target and interaction states as the Daily budget help control. Its fully opaque surface is anchored to the full header rather than the icon row, opens below any customer-view context bar, and stacks above the reporting-period toolbar without a translucent entrance frame.
- Bodyshops can add, remove, reorder and reset KPI cards through the Metric Library drawer.
- Desktop dragging uses explicit before/after insertion zones on every KPI card; the teal line is the authoritative landing position. Dropping a current card on empty grid space moves it to the end.
- The card itself is no longer draggable. Native dragging starts only from its labelled handle, preventing accidental movement while selecting KPI content.
- The Metric Library includes a compact ordered list with earlier/later/remove controls so phone and keyboard users can achieve the same exact order without relying on native touch dragging.
- Card order persists by bodyshop through `dashboard_kpi_layouts`.
- Selecting a KPI opens Performance Story with `3M`, `6M`, `12M`, Australian `FYTD` and `Custom` ranges.
- Chart points are mouse, touch and keyboard targets and can pin a month/value readout. On desktop, each available month owns the plot region halfway to its neighbours, producing continuous nearest-month hover coverage without overlapping targets or dead gaps.
- KPI trend lines use bounded cubic curves that cannot overshoot their data envelope. The previous full-path dash animation is removed, so the line cannot appear partly painted or cut off while Performance Story opens or resizes; all plot edges include clearance for the latest-point halo and selected marker.
- Y axes use adaptive nice-number ranges with four to six equal steps; the legend explicitly identifies this as an adaptive value range so the deliberately non-zero baseline is clear. Percentage KPIs use percentage-point labels; other metrics retain their appropriate number or currency labels.
- X axes identify reporting months, include the year on the first label and every year transition, and reduce label density before labels can collide on narrow screens.
- Targets use a directional external key (`Goal ≥` for higher-is-better KPIs and `Goal ≤` for lower-is-better KPIs) plus one dashed plot line. The selected-month callout stays inside the plot, clears the target line and states whether that month met the goal.
- Every plotted month previews that same callout on pointer hover or keyboard focus. Moving away removes an unpinned preview or restores the previously pinned month; click/tap remains the deliberate pin action for desktop and touch users.
- Point values remain available through complete accessible names, but no longer use SVG `<title>` elements; this prevents the browser's native tooltip from appearing beside the designed callout.
- The complete SVG plot uses one crosshair cursor. The area, line, point markers and transparent month hit regions therefore cannot flicker between the browser arrow and hand while the user scans the graph.
- The point tooltip is a compact single-line surface: typically `104 x 30` instead of the previous `132 x 50`, with month, formatted value and a small green/amber goal-status dot. The full status wording remains accessible without consuming plot space.
- Missing observations create deliberate line gaps instead of falling to the chart floor, and the active graph range is stated beneath the timeframe control.
- Changing the dashboard reporting period resets Performance Story to `12M` and clears any stale Custom range, preventing an empty or inconsistent chart from carrying into the new reporting context.
- Metric Detail shows current, previous, rolling-average and target context without duplicate narrative panels.
- Performance Story now measures its chart before paint, keeps the chart mounted across timeframe changes and uses restrained non-blur motion. Mobile removes story/chart entrance animation, uses more compact proportions and abbreviates long axis values to avoid label collisions.

### Business Snapshot and reporting period

- Business Snapshot is a flat financial summary with Total Sales, Paint Sales, Daily actual and Daily budget; it avoids cards nested inside cards.
- Matching information controls immediately follow Daily actual and Daily budget. Daily actual explains its estimated working-day Paint Sales pace and `average monthly Paint Sales / 19.33`; Daily budget explains its planning-benchmark purpose and `average monthly Paint Labour Costs * 3.3 / 19.33`. Each rounded opaque popover opens independently through hover or keyboard focus, remains tap-accessible on mobile and does not change the Business Snapshot or downstream layout geometry.
- Both the Daily figures explanation and header KPI guide use fully opaque dark surfaces so underlying dashboard text cannot bleed through.
- Changing reporting period recalculates the snapshot, all KPI cards, comparison movement, targets, rolling figures and Performance Story series from the selected month.
- The authenticated daily calculation anchors its rolling window to the selected period, so later months cannot leak into an historical view.

### Authentication and error handling

- Login fields have explicit accessible label associations.
- Invalid credentials show customer-friendly wording.
- Network or authentication-service unavailability shows a separate connection message instead of presenting it as a password problem.
- Playwright intercepts the authentication request for deterministic error-path tests; the browser suite does not depend on live Supabase availability.

## Data calculations

Daily figures use up to three available monthly records ending at the selected reporting period:

- `Daily actual = average monthly Paint Sales / 19.33 working days`
- `Daily budget = average monthly Paint Labour Costs * 3.3 / 19.33 working days`

Both show `Building` until three months are available. Daily budget is a calculated estimate, not a bodyshop-entered budget. The constants `3.3` and `19.33` are currently fixed product assumptions and should become configurable if different bodyshops need different planning models.

## Database and security state

- Supabase project migrations in this candidate:
  - `20260810113702_dashboard_kpi_layouts.sql`
  - `20260812090000_security_hardening_least_privilege.sql`
  - `20260812092000_policy_and_fk_performance_cleanup.sql`
- Row Level Security and authenticated-only grants protect company-scoped analytics and KPI layouts.
- Customer layout policy tests confirmed own-company writes and rejected cross-company writes; administrators can manage the selected bodyshop.
- `invite-user` and `delete-user` Edge Functions use verified JWTs, origin-scoped CORS, POST-only handling and reduced response payloads.
- Edge Function source normalizes request origins against the application allowlist before using an origin for CORS or invite redirects. The current-runtime implementation uses `Deno.serve`, loads the Supabase client only after an authenticated POST enters the handler, and is live as `invite-user` version 16 and `delete-user` version 6 with JWT verification enabled.
- Accepted limitation: Supabase leaked-password protection remains disabled because it requires a paid plan.
- Live Supabase advisors report no RLS/security-policy findings. Three unused-index notices are informational only and the indexes remain in place while the new tables accumulate representative traffic.

## Verification evidence

Current production release gate:

- Vitest: all 8 files and 80 tests passed, including neutral snapshot completeness with configured targets, analytics loading, target loading, current/historical review routing and customer-view parity.
- Vite production build: passed.
- Lint: no errors; one existing Fast Refresh advisory remains in `AuthProvider.jsx`.
- `git diff --check`: passed with only Windows line-ending notices.
- Playwright: all 8 configured Chromium scenarios passed in 14.6 seconds against a separately managed local Vite server, including the mobile Workspace first-tap regression. The earlier managed-web-server runs stalled during Windows process teardown; isolating the server confirmed the dashboard journeys themselves complete cleanly.
- Dependency audit: `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities.
- Supabase: both live JWT-protected functions returned `204` for safe preflight requests and expected `401` responses for unauthenticated or invalid-token POST requests; no user record was created or deleted. Recent function logs contain no unexpected error response from the final versions.
- Live production supported-browser verification passed on desktop and `390 x 844` mobile: monthly snapshot, Latest Consultant Review, Completed RO `3M` story, Data & Imports, Customer Management, customer role boundary, first-tap Workspace open/close, eight KPI cards, zero horizontal overflow and no application warning/error logs.
- Vercel production deployment `dpl_J3NLqNJQXq5WBKWNmFEBqwENRqQn` is `READY`, target `production`, and serves both production aliases. Error and HTTP 500 log scans found no entries after the release.

Current cursor-continuity follow-up gate:

- Vitest: all 8 files and 73 tests passed, including exact continuous month-zone coverage in the chart component.
- Vite production build: passed.
- Lint: no errors; one existing Fast Refresh advisory remains in `AuthProvider.jsx`.
- `git diff --check`: passed with only Windows line-ending notices.
- Playwright: the first full run identified only a `0.01` SVG-unit rounding false positive in the new overlap assertion; the assertion was corrected to share the continuity tolerance. Subsequent isolated reruns stalled in the local Playwright wrapper without returning another assertion result, including with an explicit test timeout. This is recorded as a harness stall, not a pass.
- Direct hosted supported-browser verification: at `782.296875 x 320`, all eight Completed RO month regions meet with zero gaps and cover the plot exactly; the SVG, line, points, hit areas and dense samples across the plot all compute to `crosshair`. A real pointer sweep produced one designed preview for every Jan-Aug value without clicking.

Baseline consolidation gate before this cursor follow-up:

- Vitest: 8 files, 73 tests passed, including hover/focus preview and pinned-value restoration, adaptive scale generation, target-aware callout placement, year-aware X labels, exact before/after KPI insertion, touch-friendly ordering, missing-observation graph gaps, graph-range reset, whole-shell preview parity and the live Customer Management right-inspector path.
- Playwright Chromium: all 8 tests passed, including hover and keyboard-focus previews across all eight KPI types, every one of the 64 pinned callout positions, equal Y-axis steps, target-line clearance, non-overlapping X labels and point targets, native drag right/left insertion, `390 x 844` in-panel reordering, every graph range, Custom-to-reporting-period reset, correct Consultant Review month, primary workspace navigation, authentication paths and mobile chart/popover stability.
- Vite production build: passed.
- Lint: no errors; one existing Fast Refresh advisory remains in `AuthProvider.jsx`.
- Production dependency audit: zero vulnerabilities at high severity or above.
- Native-dialog and work-marker scan: no production `alert`, `prompt`, `confirm`, `TODO`, `FIXME`, `HACK` or `XXX` findings.
- `git diff --check`: passed; Git reports only Windows line-ending notices.

The final shared-component desktop review passed for a stable KPI story opening, matching `755 x 320` SVG client/view-box geometry, complete non-dashed curve paint, safe first/latest point bounds, no filter flash, no horizontal overflow, fully opaque KPI-guide and Daily-figures surfaces, no application warning/error and no JavaScript dialog. All eight operational KPI graph shapes passed the hosted geometry audit. The permanent 390 x 844 Playwright check passed for maximum chart width, exact responsive SVG geometry, a complete curved line, opaque computed backgrounds, no page overflow and clean application-origin diagnostics.

The latest information-control review measured all three controls at the same `32 x 32` pointer target with the same `14 x 14` SVG glyph. Hosted verification confirmed the header guide immediately precedes Export at desktop and `390 x 844`, with left-to-right order `KPI guide → Export → Metrics` and no horizontal overflow. Its revised `320 x 172` surface opens below the full header, remains inside the viewport, renders opaque from the first visible frame and uses header `z-index: 50` / popover `z-index: 70` above the reporting toolbar's `z-index: 30`; no reporting-period text bleeds through. The two Business Snapshot controls immediately follow their respective Daily actual and Daily budget labels. Their independent `320 x 178.75` and `320 x 160.875` popovers remain fully opaque and inside the viewport at desktop and `390 x 844`, only one renders at a time, and the Business Snapshot/downstream geometry remains unchanged; hover/focus, mobile tap, Escape and outside-click paths remain supported.

The final local and hosted reviews directly reused each header button for every transition. Desktop Workspace changed `272px → 0px → 272px`; Metrics opened at `384px`, closed through the same button and left document overflow at zero. At `390 x 844`, Workspace occupied `[0, 56, 272, 788]` and Metrics `[0, 56, 384, 788]`, leaving both persistent controls accessible above their panels. Every primary workspace—Dashboard, Shop Profile, Data & Imports, Gamified Leaderboards and Customer Management—retained the shared shell and zero horizontal overflow at desktop and mobile widths.

Protected Preview `dpl_9DdBjYWmYgMXo2kNMXMeKeYRQ4wS` returned HTTP 200 through approved Vercel CLI access with `X-Robots-Tag: noindex`. Vercel reports `READY`, `target: preview`. Hosted inspection confirmed the secure root/login boundary, a `104 x 30` May tooltip with the correct amber outside-goal dot, target-line clearance, zero native SVG title tooltips, zero horizontal overflow and no JavaScript dialog. Production was re-inspected afterward and remains deployment `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`.

Protected Preview `dpl_C7Zow3v7edU2DaJWC445bwWL67ti` returned HTTP 200 through approved Vercel CLI access with `X-Robots-Tag: noindex`. Vercel reports `READY`, `target: preview`. Hosted inspection confirmed continuous Jan-Aug hover coverage, one stable crosshair throughout the plot and one designed value preview per real pointer position. Production was re-inspected afterward and remains deployment `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`.

## Post-release state

1. The verified production source sequence through `fd80154` is published on `origin/agent/bodyshop-audit-hardening`; this handoff and the changelog are the final documentation sync.
2. Production is live at `https://bodyshop-dashboard.vercel.app` as `dpl_J3NLqNJQXq5WBKWNmFEBqwENRqQn` (`READY`, target `production`).
3. The earlier protected review candidate remains available at `https://bodyshop-dashboard-9qbu58o3u-cpr-analytics.vercel.app/?layout-preview=1` as `dpl_ASU5mMhHC7nStKEmYytvzKSQaCra` (`READY`, target `preview`); it is no longer the release source of truth.
4. Supabase is `ACTIVE_HEALTHY`; `invite-user` version 16 and `delete-user` version 6 are live with JWT verification. Safe production checks made no user-data changes.
5. The 80-test, build, lint, dependency-audit, 8-scenario browser, Vercel, Supabase, desktop and mobile checks are recorded in `CHANGELOG.md`.

## Release guardrails

- Never promote a Preview or use `--prod` without explicit approval.
- Deploy from source, not a locally prebuilt bundle assembled with pulled Vercel environment values.
- Keep `VITE_UI_PREVIEW` disabled in production.
- Treat `VITE_*` values as public browser configuration; never place service-role secrets in them.
- Preserve the user-owned preview PNGs and `.codex-remote-attachments` directory.

## Key files

- `src/App.jsx` - authenticated application, role navigation and data orchestration.
- `src/components/DashboardWorkspace.jsx` - shared authenticated/demo dashboard composition.
- `src/LayoutPreview.jsx` - deterministic visual-review route using shared components.
- `src/components/BusinessSnapshot.jsx` - financial summary and daily calculation explainer.
- `src/components/ContextInfoButton.jsx` - shared accessible circular information-control treatment.
- `src/components/MetricLibraryDrawer.jsx` - KPI selection and ordering.
- `src/components/PerformanceStoryModal.jsx` - full KPI analysis experience.
- `src/components/PerformanceRhythm.jsx` - responsive chart and period windows.
- `src/utils/dashboardKpis.js` - KPI configuration and formatting.
- `src/services/db.js` - Supabase data operations.
- `supabase/migrations/` - database/RLS changes.
- `e2e/` - deterministic Playwright smoke coverage.
