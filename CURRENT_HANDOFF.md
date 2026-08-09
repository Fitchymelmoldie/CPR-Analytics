# Current Handoff

Last updated: 9 August 2026, 8:12 PM AEST

## Current status

The approved Business Snapshot and operational KPI hierarchy is live and browser-verified in production. The customer-facing card now contains the `Business snapshot` title and business figures only, Total Sales and Paint Sales remain selectable trends without target controls, and the eight genuine operational KPIs drive the Performance Pulse. Release source commit `2d6e55a` is pushed to GitHub and Vercel production deployment `dpl_2HGdoxTGysR91weLUPn54nKVJpUf` is `READY` on the public domain.

## Live and review links

- Current production: https://bodyshop-dashboard.vercel.app
- Current production deployment ID: `dpl_2HGdoxTGysR91weLUPn54nKVJpUf`
- Current production source commit: `2d6e55a`
- Immutable production URL: https://bodyshop-dashboard-4bzn6cq2a-cpr-analytics.vercel.app
- Superseded Business Snapshot preview: https://bodyshop-dashboard-6fhx4afi9-cpr-analytics.vercel.app/?layout-preview=1
- Hosted Business Snapshot preview deployment ID: `dpl_9vXkoGzRcTkKgyGSwVJbMg3oEP1v` (`READY`, preview target `null`)
- Superseded target-editor preview: https://bodyshop-dashboard-5l6watss2-cpr-analytics.vercel.app/?layout-preview=1 (`dpl_HnqWfk4BQG9vgsSFAmpWqZWc2mLy`)
- Latest KPI-indicator visual review: https://bodyshop-dashboard-jo951am48-cpr-analytics.vercel.app/?layout-preview=1
- Latest real authentication preview: https://bodyshop-dashboard-jo951am48-cpr-analytics.vercel.app/
- Latest preview deployment ID: `dpl_95MxgAQbvh1QoxyS7fWx3xKhEp6m`

The protected preview was reviewed and explicitly approved before this production deployment. Future releases must follow the same approval boundary. The `?layout-preview=1` route is demonstration-only and is available only when the preview environment enables `VITE_UI_PREVIEW=true`; the switch is disabled on production.

## What went wrong

1. The benchmark button used the browser's built-in `window.prompt()` box. The Codex in-app browser does not support that interaction, so clicking the button appeared to do nothing and the Supabase save request was never reached.
2. The approved visual mock-up was implemented in a separate `LayoutPreview` dashboard instead of rendering the exact dashboard component used by the authenticated application. That allowed the mock-up and the real production interface to drift apart even though each one worked independently.
3. The previous release checks verified the mock-up's appearance and the real app's general navigation, but did not exercise this exact target-editing action in the supported in-app browser or compare the two dashboard component trees. The audit therefore missed both issues.

## Corrections implemented

- Replaced the native benchmark prompt with an accessible in-app target editor that supports create, update, validation, cancellation, Escape/backdrop closing and two-step removal.
- Preserved the existing Supabase benchmark upsert/delete service and permissions; only the broken browser interaction was replaced.
- Added correct currency, number and percentage input handling, including conversion between visible percentage values and stored ratios.
- Replaced the remaining native reporting-period prompt with a proper in-app modal.
- Replaced all remaining `window.alert()` calls with in-app notices.
- Added a lint error for native `alert`, `prompt` and `confirm`, preventing this browser-incompatible pattern from being reintroduced.
- Introduced one shared `DashboardWorkspace` component. Both the authenticated dashboard and `LayoutPreview` now render this exact component; the preview supplies demonstration data through an adapter instead of maintaining a separate design.
- Added a visible `Demo` label to the demonstration route so it cannot be mistaken for real customer data.
- Aligned the authenticated Visual Dashboard with the approved layout: context cards, current bodyshop strip, Performance Pulse, compact KPI grid, Performance Rhythm chart and What Changed panel.
- Preserved all other drawer destinations and administrator/bodyshop permission boundaries.
- Replaced the tiny green/amber target dots with explicit `Target met`, `Target missed` and `No target set` labels.
- Added a concise distance from target to every configured KPI, such as `Ahead by $80,528`, `Short by $3,971`, `Over by 0.1` and `Under by 2.50 pts`.
- Added a responsive KPI card guide that separately explains favourable/unfavourable movement, target result, peer-group rank and the teal selected-for-chart state.
- Kept the monthly movement colour independent from the current target result, so an improving KPI can still honestly show that its target is missed.
- Expanded each KPI card's accessible description to include the current result, target result, target distance and peer rank.

## Current Business Snapshot production behavior

- Total Sales and Paint Sales are now neutral business results inside the existing Performance Pulse hero instead of targetable KPI cards.
- Both sales results remain clickable and continue to drive the existing Performance Rhythm chart.
- Sales results no longer expose target buttons, target status, target gaps or target chart lines and do not contribute to the Performance Pulse score.
- Existing stored sales benchmark records are not deleted or changed; the interface simply ignores them.
- The daily sales pace and 3.3x amount remain visible, while the customer-facing card now shows no internal score explanation, `Not scored` badge or informational footer.
- Performance Pulse scoring, strongest/watch signals and missed-target insights now use only operational KPIs.
- The remaining eight KPI cards form a balanced four-by-two desktop grid and two-column mobile grid.
- Completed RO remains targetable because it can represent a genuine production-volume goal.

## Verification completed

- `npm.cmd test -- --run`: 6 test files and 46 tests passed.
- `npm.cmd run build`: passed.
- `npm.cmd run lint`: passed with no errors; only existing non-blocking warnings remain.
- `npm.cmd audit --omit=dev --audit-level=high`: zero vulnerabilities.
- `git diff --check`: passed; Git only reported expected LF-to-CRLF notices.
- Confirmed there are no production `window.prompt`, `window.alert` or `window.confirm` calls left under `src`.
- Desktop browser check at 1440 x 1000: shared dashboard rendered without horizontal overflow or application console errors.
- Mobile browser check at 390 x 844: dashboard, target editor, mobile drawer and automatic drawer close all passed without overflow or application console errors.
- Target flow checked end-to-end in the demonstration adapter: open, validate, update and confirmed removal all worked without a native browser dialog.
- Navigation from Visual Dashboard to Shop Profile and back continued to work on mobile.
- Protected source preview `dpl_HnqWfk4BQG9vgsSFAmpWqZWc2mLy` is `READY` with preview target `null`; it was not promoted to production.
- Repeated the target update and confirmed-removal flow on the deployed preview itself; both worked and the deployed browser console remained clean.
- The deployed preview's root route shows the real Secure Login screen, while demonstration data remains isolated behind `?layout-preview=1`.
- Rechecked the production alias after preview deployment: it still points to production deployment `dpl_BuJKH5jSBarFoMmrKuj71bncozdC`.
- New indicator tests cover higher-is-better, lower-is-better, favourable movement with a missed target, percentage-point gaps and unset targets.
- Desktop indicator review at 1440 x 1000: the guide and all target labels/gaps rendered clearly with no page overflow or application console errors.
- Mobile indicator review at 390 x 844: the guide uses a compact two-column layout, card target details stack for readability, and the page has no horizontal overflow or application console errors.
- Local target interaction check: moving Total Sales target from $1,000,000 to $1,100,000 changed its card to `Target missed` / `Short by $19,472` and changed the Performance Pulse from 7/10 to 6/10 immediately.
- Protected source preview `dpl_95MxgAQbvh1QoxyS7fWx3xKhEp6m` is `READY` with preview target `null`; it was not promoted to production.
- Deployed desktop preview confirmed seven `Target met` and three `Target missed` cards, the correct Paint Sales gap, the complete KPI guide, no page overflow and no application console errors.
- Deployed target interaction repeated successfully: the in-app target editor changed Total Sales to `Short by $19,472` and the Performance Pulse to 6/10 without invoking a native browser dialog.
- Deployed mobile preview at 390 x 844 retained the two-column guide/card layout, readable stacked target details, no page overflow and no application console errors.
- The latest preview root still shows the real Secure Login screen and does not expose demonstration data without `?layout-preview=1`.
- Production alias rechecked after the latest preview: it remains on `dpl_BuJKH5jSBarFoMmrKuj71bncozdC`.
- Final release gate repeated on the approved source: all 46 tests, production build, lint, dependency audit and Git whitespace checks passed.
- Release source commit `6b18e3c` was pushed to `origin/agent/bodyshop-audit-hardening` before deployment.
- Production deployment `dpl_HM7ox6Z57AxNK8d6kXqCwZV28RkH` is `READY`, owns `https://bodyshop-dashboard.vercel.app` and identifies source commit `6b18e3c` in Vercel metadata.
- Authenticated live production rendered the real `boylesmash` workspace and Supabase-backed values, including the saved Completed RO target of 180 and its written `Target met` / `Ahead by 20` state.
- Opened and cancelled the live Total Sales target editor without saving, confirming the in-app workflow works and does not invoke a native browser dialog.
- Verified KPI selection, the 3M timeframe control, Shop Profile navigation and the return to Visual Dashboard on production.
- Verified the live mobile layout at 390 x 844, including the open/close drawer flow and no horizontal page overflow.
- Confirmed `?layout-preview=1` is ignored on the production domain: it continued to show the authenticated real workspace and exposed neither the `Demo` label nor preview customer data.
- Live desktop, preview-query and mobile tabs reported no application console warnings/errors and no native JavaScript dialogs. Vercel reported no production runtime errors after deployment.
- No live target was saved or removed and no upload, invitation, deletion or other customer-data mutation was performed during production verification.
- Business Snapshot preview gate: 6 test files and 47 tests passed; production build passed; lint passed with only the pre-existing non-blocking warnings.
- Local desktop review at 1440 x 1000 confirmed two business-result controls, eight operational KPI cards, a 6/8 demonstration pulse, no sales target controls and no horizontal overflow.
- Local mobile review at 390 x 844 confirmed the compact Business Snapshot, readable two-column operational grid, functioning mobile drawer and no horizontal overflow.
- Verified Total Sales and Paint Sales still select the trend chart without showing target lines; Completed RO still selects the chart and opens/cancels its in-app target editor.
- The local preview reported no application console warnings/errors and no native JavaScript dialog.
- The dedicated `agent-browser` command was unavailable on this machine; the equivalent checks were completed through the integrated browser.
- The protected Business Snapshot source preview `dpl_9vXkoGzRcTkKgyGSwVJbMg3oEP1v` is `READY` with preview target `null`; it was not promoted to production.
- Hosted desktop verification at 1440 x 1000 confirmed two business-result controls, eight operational KPI cards, a 6/8 demonstration pulse, no sales target controls and no horizontal overflow.
- Hosted Paint Sales selection updated the trend chart without a target marker; hosted Completed RO selection displayed `Target 190` and its in-app target editor opened and cancelled correctly.
- Hosted mobile verification at 390 x 844 confirmed the compact Business Snapshot, all eight operational cards, no horizontal overflow and a working open/close drawer.
- The hosted preview reported no browser warnings/errors, no native JavaScript dialog and no Vercel preview runtime errors.
- Rechecked `https://bodyshop-dashboard.vercel.app` after the preview upload: it still resolves to production deployment `dpl_HM7ox6Z57AxNK8d6kXqCwZV28RkH`.
- Final title-only copy refinement: the focused Layout Preview tests passed, the production build passed and lint reported no errors (only the existing non-blocking warnings).
- Local desktop and 390 x 844 mobile checks confirmed the card retains its title, two business controls and business figures while removing the score explanation, badge and informational footer; both widths remained free of horizontal overflow and browser warnings/errors.
- Final production release gate: 6 test files and 48 tests passed; production build, lint, zero-vulnerability dependency audit, native-dialog scan and Git whitespace checks all passed.
- Release source commit `2d6e55a` was pushed to `origin/agent/bodyshop-audit-hardening` before deployment.
- Production deployment `dpl_2HGdoxTGysR91weLUPn54nKVJpUf` is `READY`, owns `https://bodyshop-dashboard.vercel.app` and identifies source commit `2d6e55a` in Vercel metadata.
- Authenticated live production rendered the real `boylesmash` workspace and Supabase-backed values, including the saved Completed RO target of 180 and `Target met` / `Ahead by 20` state.
- Verified two business trend controls, eight operational KPI cards, no Total Sales or Paint Sales target controls, title-only Business Snapshot copy, sales charts without target markers, Completed RO target marker/editor and the 3M timeframe.
- Verified Shop Profile, Consultant Reviews open/cancel, Data & Imports, Gamified Leaderboards, Customer Management and return to Visual Dashboard without mutating live data.
- Verified the 390 x 844 mobile layout, navigation selection/close flow, target-editor open/cancel and no horizontal page overflow.
- Confirmed `?layout-preview=1` remains disabled on production and continued to show the real authenticated workspace with no `Demo` label.
- The public production URL returned HTTP 200; browser diagnostics and Vercel runtime scans reported no warnings, errors, fatal logs or native JavaScript dialogs.
- No target, review, upload, invitation, deletion or other customer-data change was saved during production verification.

## Permanent release guardrails

1. Design approval must use the same production component tree as the authenticated application. Demonstration data may be substituted, but the interface component cannot be duplicated.
2. Do not use native browser `alert`, `prompt` or `confirm` for application workflows. The lint rule now enforces this automatically.
3. Every material button must be exercised in the actual supported browser, not inferred from rendering or unit tests alone.
4. Before release, compare the protected preview and authenticated application at the same desktop and mobile widths.
5. Continue the sequence: local checks -> protected source preview -> browser action audit -> explicit approval -> source-based production deployment.
6. A production deploy is not complete until the deployed DOM, console, core actions and Supabase-backed data have been verified.

## Source-control state

- Working branch: `agent/bodyshop-audit-hardening`
- Release source commit: `2d6e55a` (`feat: separate business snapshot from operational KPIs`), pushed to `origin/agent/bodyshop-audit-hardening`.
- The production alias now serves deployment `dpl_2HGdoxTGysR91weLUPn54nKVJpUf`, built from that exact source commit.
- `origin/main` was not changed; the production deployment was made directly from the approved working branch.
- Only the three user-owned preview PNG files remain untracked; they were not committed or uploaded.
- Preserve the three untracked preview PNG files; they are user-owned artifacts and are excluded from Vercel uploads by `.vercelignore`.

## Next steps

1. Trial the live production application across the normal administrator and bodyshop workflows.
2. Record any confusing wording, missing information or workflow friction found during real use.
3. Make future adjustments locally and through a protected preview before requesting another production release.
