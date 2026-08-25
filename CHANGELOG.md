# Changelog

All notable changes to the CPR Analytics Dashboard prototype will be documented in this file.

## Production hotfix — 25 August 2026

- Promoted the clean `c6af943` source tree to `https://bodyshop-dashboard.vercel.app` as deployment `dpl_F1yS8XRoGQ8rLqHmLwdWqDCgHsaj` (`READY`, target `production`) after verifying protected Preview `dpl_4fUfPEKSXLpDKToywU9nhqBbCzhA`.
- Confirmed from live API evidence that the reported period deletions had already returned HTTP 204; the remaining disabled confirmation was a frontend-only stale loading state, not a database failure.
- Reset deletion state after every successful period removal and whenever a new confirmation opens, so deleting one month cannot leave the next month disabled on `Deleting...`.
- Kept the confirmation modal locked only while a request is genuinely active, added a clear success notice, and separated a successful deletion from a later refresh failure so the UI never reports an already-completed deletion as failed.
- Added a regression that completes one confirmed deletion, reopens the next confirmation and requires its delete action to be enabled without a stale loading label.
- Final gates: all 80 Vitest tests passed; the Vite production build passed; lint completed with no errors and one existing Fast Refresh advisory; all 8 Chromium journeys passed in 9.1 seconds; the protected Preview secure root, deployed bundle and Data & Imports geometry passed; and the live production confirmation opened enabled and was cancelled without deleting another period. Vercel error and HTTP 500 scans returned no entries.

## Production release — 24 August 2026

- Promoted the clean `fd80154` source tree to `https://bodyshop-dashboard.vercel.app` as deployment `dpl_J3NLqNJQXq5WBKWNmFEBqwENRqQn` (`READY`, target `production`) after publishing the release sequence `d00acfc`, `b0d9617` and `fd80154` to GitHub.
- Reframed the dashboard hero as a neutral monthly snapshot: the ring now communicates reported-data completeness, the selected month anchors the headline, multi-month Performance Story ranges are the primary analysis path, targets remain optional KPI context, and Latest Consultant Review provides a compact bridge from data to consultant interpretation.
- Deployed hardened Supabase Edge Functions using the current runtime pattern as `invite-user` version 16 and `delete-user` version 6, both `ACTIVE` with JWT verification. Allowed and untrusted-origin preflight checks returned `204`; unauthenticated and invalid-token POST checks returned the expected `401` without creating or deleting a user.
- Paused the first promotion after live verification found that the mobile Workspace drawer could retain `visibility: hidden` on its first tap. Removed `visibility` from the animated properties, added component and `390 x 844` browser regressions, rebuilt from a clean worktree and promoted only the corrected deployment.
- Final gates: all 80 Vitest tests passed; Vite production build passed; lint completed with one existing Fast Refresh warning and no errors; the production dependency audit found zero vulnerabilities; all 8 Chromium scenarios passed in 14.6 seconds; live desktop, customer-role, Data & Imports, Customer Management, KPI-story and mobile Workspace checks passed with zero horizontal overflow and no application warning/error logs.
- Supabase is `ACTIVE_HEALTHY`. Leaked-password protection remains disabled as an accepted Auth advisory, and three unused-index notices remain informational while representative traffic accumulates. Vercel error and HTTP 500 log scans found no post-release entries.

## Production release — 21 August 2026

- Promoted the verified release commit `7757e60` to `https://bodyshop-dashboard.vercel.app` as deployment `dpl_75WAHNYY2GR3BTUbygqBHE9vcoVk` (`READY`, target `production`).
- Final gates: 77 Vitest tests passed; Vite build passed; lint completed with one existing Fast Refresh warning and no errors; `npm audit --omit=dev --audit-level=high` found 0 vulnerabilities; Supabase project `ACTIVE_HEALTHY` with the three release migrations applied, RLS enabled on all public tables, authenticated-only grants, active JWT-protected edge functions and successful recent API/Auth requests; production desktop and 390 x 844 mobile smoke checks passed with no overflow, native month inputs or native KPI selects; no recent Vercel logs were present.
- Supabase security advisory remains open for leaked-password protection being disabled. It is a dashboard-level Auth setting and was not silently changed during this release.
- Published the verified release branch to GitHub as `origin/agent/bodyshop-audit-hardening` after explicit release authorization.

## [Unreleased]

- **Data-entry-only Full Month Editor (21 August 2026)**
  - Removed previous-month, movement and reporting-status columns from the visual Preview's Full Month Editor. Those comparisons belong in the dashboard and Performance Story, not beside raw import values.
  - The editor now presents only `Metric` and `Value`, matching the authenticated editor's direct input grid and keeping Data & Imports focused on entry, correction and saving.
  - All 77 Vitest tests, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed. Hosted desktop and 390 x 844 mobile checks confirmed only `Metric` and `Value` columns with no horizontal overflow.
  - Published protected Preview `dpl_FWkY7hXqSYk6A1ULd1y9qQgyjCXW` at `https://bodyshop-dashboard-il59n1e5d-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Production remains unchanged; no commit, push, promotion or alias change was performed.

- **Consistent in-app KPI selector (21 August 2026)**
  - Replaced the remaining native KPI `<select>` in Quick KPI Entry with the shared dark listbox control used by the dashboard context selectors.
  - Preserved the full KPI list while adding the same selected state, scroll behavior, keyboard navigation, Escape dismissal and outside-click behavior as the reporting-month picker.
  - Added a regression test that fails if the KPI field falls back to a native select menu. All 77 Vitest tests, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed.
  - Published protected Preview `dpl_EFFSTqHrTvA7Ue4bccUgzrT8a4fp` at `https://bodyshop-dashboard-dtcwie7vm-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Hosted desktop and 390 x 844 mobile checks confirmed the dark listbox, selected KPI behavior, zero native KPI selects and no horizontal overflow. Production remains unchanged; no commit, push, promotion or alias change was performed.

- **Dashboard content hierarchy reduction (21 August 2026)**
  - Audited the primary dashboard, Data & Imports, Customer Management, Shop Profile, Metric Library and KPI story surfaces for repeated explanatory copy.
  - Removed redundant header subtitles and action instructions, shortened import and editor guidance, reduced Quick KPI status copy, and kept only labels, meaningful states, validation and contextual help.
  - Kept the interaction model discoverable through clear controls, accessible names and the existing information popovers rather than permanent paragraphs.
  - All 76 Vitest tests, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed. Local and hosted desktop/mobile reviews confirmed the quieter Data & Imports hierarchy with no horizontal overflow.
  - Published protected Preview `dpl_286SRznyGJ9SmK4zLZnVwtAsArkT` at `https://bodyshop-dashboard-pwnb7ldhy-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Production remains unchanged; no commit, push, promotion or alias change was performed.

- **Codex-style reporting month picker (21 August 2026)**
  - Replaced the browser-native month input in Quick KPI Entry with an in-app dark month selector so the opened state stays inside the dashboard's visual system on desktop and mobile.
  - Added clear year navigation, a compact 12-month grid, selected-month emphasis, and Escape/outside-click dismissal without changing the underlying month value format or save flow.
  - Kept the picker keyboard-accessible with labelled controls and native month buttons, avoiding the inconsistent operating-system calendar surface that previously broke character from the UI.
  - Added a regression test that fails if an `input[type="month"]` returns and verifies the labelled dialog, open state and Escape dismissal. All 76 Vitest tests, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed.
  - Published the current dirty working tree as protected Preview `dpl_3XMCY4qJ8QRCckF515CZpHwhjy6c` at `https://bodyshop-dashboard-5l6sckc8w-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Hosted desktop and 390 x 844 mobile checks confirmed the dark picker, zero native month inputs and no horizontal overflow. Production remains unchanged; no commit, push, promotion or alias change was performed.

- **Quick monthly KPI entry and deferred leaderboards (21 August 2026)**
  - Reworked Data & Imports around two explicit consultant paths: a bulk CSV spreadsheet import and a shared Quick KPI Entry for adding or correcting one KPI in one selected reporting month.
  - Added a shared in-app month picker, complete raw KPI selector, metric-aware currency/percentage handling, current-value disclosure and explicit new-versus-update wording. Updating one KPI now writes only that analytics column and preserves every other value already stored for the bodyshop/month.
  - New single-value months are created as partial rows instead of zero-filled months. Missing dashboard inputs and dependent calculations now remain `Not entered`/`Building` rather than presenting invented zero performance or a false variance.
  - Kept the Full Month Editor for reviewing or adjusting an entire reporting period, and reused the new import actions in the visual Preview so the protected review surface reflects the real interaction design.
  - Removed Gamified Leaderboards from active navigation and direct app routing behind a disabled feature flag. The implementation remains intact for a later product phase.
  - Added integration coverage for a new single-KPI month, explicit replacement of an existing KPI and hidden leaderboard navigation. All 75 Vitest tests, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed.
  - Direct local browser verification passed at `1986 x 1272` and `390 x 844`: both entry paths fit without horizontal overflow, the existing-value safety copy is visible, the Full Month Editor remains available and Leaderboards is absent. This candidate remains uncommitted, unpushed and undeployed; production and the latest protected Preview are unchanged.

- **Continuous KPI graph hover and cursor behavior (15 August 2026)**
  - Replaced the mixed arrow/hand graph cursor with one deliberate crosshair across the complete SVG plot, including the area, line, month points and transparent interaction regions.
  - Expanded each available month's hover target to the midpoint between adjacent reporting months. Complete series now cover the plot continuously with no dead gaps, so scanning the trend keeps the cursor stable and always resolves to the nearest month value.
  - Audited every explicit cursor treatment in the shared application. Upload/select surfaces remain pointer-based, KPI and Metric Library drag affordances deliberately retain grab/grabbing, and disabled controls retain not-allowed; no other accidental adjacent cursor conflict was found.
  - Added component and hosted geometry checks for exact plot-edge coverage, zero month-zone gaps, non-overlapping targets within SVG rounding tolerance and a computed crosshair across the SVG, trend line, point groups and hit areas.
  - All 73 Vitest tests, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed. The Playwright runner surfaced and corrected a `0.01`-unit boundary-tolerance false positive, then its local wrapper stalled without another assertion result; this follow-up was therefore also verified directly in the supported hosted browser rather than being recorded as a Playwright pass.
  - Published protected Preview `dpl_C7Zow3v7edU2DaJWC445bwWL67ti` at `https://bodyshop-dashboard-3tv3qe7pp-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`, HTTP 200, `noindex`). At the hosted `782.296875 x 320` graph size, all eight month zones met with zero gaps and covered both plot edges; dense plot sampling returned only `crosshair`, and a real pointer sweep produced exactly one preview for Jan through Aug without clicking. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion, production deployment or Supabase mutation was performed.

- **Compact professional KPI point tooltip (15 August 2026)**
  - Replaced the `132 x 50` two-row mini-card with a restrained single-line tooltip. A typical month now renders at `104 x 30`, reducing its plotted area by roughly half while retaining the full month and formatted value.
  - Replaced the written goal-status label inside the tooltip with a small green or amber dot. Full target status remains in the point's accessible name and live-region announcement.
  - Tightened the connector, corner radius, border and type hierarchy to match the dashboard's compact Codex-native control language.
  - Extended all-KPI browser geometry coverage to require a `30px` tooltip height, maximum `140px` width, plot containment and target-line clearance at every one of the 64 point positions.
  - All 73 Vitest tests, all 8 Playwright Chromium scenarios, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed.
  - Published protected Preview `dpl_9DdBjYWmYgMXo2kNMXMeKeYRQ4wS` at `https://bodyshop-dashboard-188iyj40x-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`, HTTP 200, `noindex`). Hosted inspection measured the May tooltip at `104 x 30`, confirmed its amber outside-goal dot, target-line clearance, zero native SVG titles and zero overflow. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or production deployment was performed.

- **Single KPI hover-value surface (15 August 2026)**
  - Removed the SVG `<title>` from every plotted point because browsers rendered it as a second native tooltip on top of the designed month/value callout.
  - Preserved each point's complete accessible name, keyboard focus behavior, hover preview and click/tap pinning. The custom collision-aware callout is now the only visible value surface.
  - Added component and Chromium assertions requiring zero native SVG title elements across all eight KPI graphs while retaining exactly one custom readout.
  - All 73 Vitest tests, all 8 Playwright Chromium scenarios, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` passed.
  - Published protected Preview `dpl_G2DZf1bdQYvXmM6H3JA9DNHLviNj` at `https://bodyshop-dashboard-gnfm8ethg-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`, HTTP 200, `noindex`). Hosted inspection found zero native titles, one custom Jun 2026 readout, matched `782 x 320` SVG client/view-box geometry and zero overflow. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or production deployment was performed.

- **Hover and keyboard-focus KPI value previews (15 August 2026)**
  - Each graph point now opens its collision-aware month, value and goal-status callout on pointer hover or keyboard focus. Desktop users can scan the trend without clicking, while touch users retain the existing tap-to-pin interaction.
  - Hover and focus are temporary previews: leaving the point removes an unpinned callout, or restores the previously pinned month when one exists. `aria-pressed` continues to represent only a deliberate pinned selection.
  - Updated the visible guidance and point accessible names to state the interaction directly: hover or focus previews; selecting pins.
  - Added component and Chromium regressions for hover-in, hover-out, focus, blur, click-to-pin and pinned-value restoration across the shared graph used by all eight KPIs.
  - Final gates passed: 73 Vitest tests, all 8 Playwright Chromium scenarios, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` with only Windows line-ending notices.
  - Published protected Preview `dpl_FDRTqR5NPRDGcf5miEyZxmzyS6et` at `https://bodyshop-dashboard-45bnoxyrl-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`, HTTP 200, `noindex`). The hosted shared-component route exposes the new hover/focus guidance and point semantics; production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`. No commit, push, promotion or production deployment was performed.

- **Logical chart axes, goal lines and selected-month callouts (14 August 2026)**
  - Replaced raw fractional Y-axis intervals with adaptive `1 / 2 / 2.5 / 5 / 10` scale steps, four to six evenly spaced ticks and metric-aware number, currency and percentage labels. The legend explicitly identifies the adaptive Y value range and reporting-month X axis so a non-zero baseline is not misleading.
  - Added year context to the first X-axis label and every year transition, reduced label density at narrow widths, and made the invisible point targets share the available plot width without overlapping.
  - Moved the target value out of the plotting area into a directional goal key (`Goal ≥` for minimum targets and `Goal ≤` for maximum targets). The plot retains one restrained dashed reference line without an opaque badge covering the trend.
  - Rebuilt pinned-month callout placement to prefer the clearest side of the point, remain inside plot bounds and keep eight pixels of clearance from the target line. Each callout now states `Goal met` or `Outside goal` using the KPI's genuine target direction.
  - Added geometry regressions across all eight KPIs and all 64 selectable points, including equal Y steps, target direction, X-label spacing, hit-area spacing, callout containment, target-line clearance and `390 x 844` overflow.
  - Final gates passed: 72 Vitest tests, all 8 Playwright Chromium scenarios, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` with only Windows line-ending notices.
  - Published protected Preview `dpl_J7yV5FEkKjEzsSUSBAFUo2wov1Yx` at `https://bodyshop-dashboard-fh2a1cazk-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`, HTTP 200, `noindex`). Hosted checks confirmed clean `220-120` and `1.40%-0.90%` scales, correct `Goal ≥ 190` / `Goal ≤ 1.20%` rules, contained callouts, zero target-line crossings and zero horizontal overflow. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or production deployment was performed.

- **Precise KPI drag, drop and touch ordering (14 August 2026)**
  - Replaced ambiguous target-card drops with explicit half-card insertion zones. The left half inserts immediately before the chosen KPI and the right half inserts immediately after it, including forward and backward moves.
  - Added a bright but restrained teal insertion line that shows the exact landing edge before release. Dropping an existing card on empty grid space deliberately moves it to the end.
  - Restricted native dragging to the labelled `Drag` handle so selecting, scrolling or interacting with the rest of a KPI card cannot accidentally reorder it.
  - Added a compact ordered-card list inside the Metric Library with exact earlier, later and remove controls. This gives touch and keyboard users the same deterministic ordering at `390 x 844`, where the Metrics panel overlays the KPI grid.
  - Preserved the authenticated dirty/save flow: every reordered title sequence is normalized, marked unsaved and persisted through the existing bodyshop `dashboard_kpi_layouts` save operation.
  - Final verification passed 68 Vitest tests, all 7 Playwright Chromium scenarios, the Vite production build, lint with no errors and one existing Fast Refresh advisory, and `git diff --check`. The browser suite performs real native right/left drags plus mobile in-panel reordering and checks zero horizontal overflow.
  - Published protected Preview `dpl_3vRic3jj8eg5fkC3xtQcddsrLrzK` at `https://bodyshop-dashboard-og88zy4dy-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`, HTTP 200, `noindex`). Hosted inspection found eight deliberate drag handles, eight touch-order rows, zero overflow and no application-origin console diagnostics. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or production deployment was performed.

- **Full graph, interaction and Codex-polish audit (14 August 2026)**
  - Reproduced and fixed the inconsistent graph state that occurred when a Custom date range remained selected after changing the dashboard reporting period. Reporting-period changes now reset Performance Story to `12M` and clear the stale Custom range.
  - Treated missing monthly observations as gaps rather than false zero values, split SVG paths across those gaps and added an explicit active-range summary. Rechecked all eight KPI metrics across `12M`, `3M`, `6M`, `FYTD` and Custom ranges.
  - Corrected the Consultant Review month offset, limited selection to real available reporting periods and upgraded the dialog's focus trap, Escape handling, focus restoration, labels and tab semantics. The protected demo now opens the same shared review dialog as the authenticated application.
  - Refined Performance Story controls, dialogs and the Customize action toward the restrained Codex component language while preserving the existing responsive Workspace and Metrics behavior.
  - Hardened Edge Function source so only allowlisted application origins can be reused for CORS or invite redirects. No Supabase function or database mutation was performed during this Preview-only audit.
  - Live Supabase advisors reported one accepted leaked-password-protection warning and two informational unused-index notices; no RLS or policy finding was reported. The indexes remain because the relevant tables are new and current usage is not representative.
  - Final gates passed: 65 Vitest tests, 6 Playwright Chromium scenarios, Vite production build, dependency audit with zero vulnerabilities, lint with no errors and one existing Fast Refresh advisory, and `git diff --check` with only Windows line-ending notices.
  - Published protected Preview `dpl_4Y7c6JhtueppR8UM4jGg9jSR2Uzb` at `https://bodyshop-dashboard-ounb8kmst-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`, HTTP 200, `noindex`). Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion, production deployment or Supabase deployment was performed.

- **KPI graph edge and line-paint polish (14 August 2026)**
  - Replaced the SVG full-path dash animation that could leave a trend line visibly incomplete during Performance Story opening, resizing or capture. Lines now exist in their complete form from the first frame and use a short opacity settle only.
  - Converted the eight shared KPI trends from angular straight segments to bounded cubic curves. Their control points remain between adjacent data values, preventing smoothing overshoot while preserving exact monthly points and accessible pinned values.
  - Increased mobile and desktop plot insets so the latest-period halo, selected marker, target endpoint and line caps retain deliberate clearance from every chart edge.
  - Added unit and mobile-browser regressions for the undashed complete path and curved geometry. All 63 Vitest tests, all 5 Playwright Chromium tests, the Vite production build and `git diff --check` pass; lint has no errors and the same seven non-blocking warnings.
  - Direct local and hosted audits covered all eight KPI graph shapes, rising and falling trends, currency and percentage scales, target placement and first/latest point bounds. Published protected Preview `dpl_CohVHvcMfFoWWUnSTYxUYnn1zNBi` at `https://bodyshop-dashboard-8jgg0xzun-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or alias change was performed.

- **Whole-product Codex-native redesign (14 August 2026)**
  - Rebuilt the shared application shell around a compact `56px` top bar, `272px` Workspace drawer and `384px` Metrics inspector. Both persistent controls retain the required same-button open, close and reopen contract; desktop panels resize the workspace and mobile panels begin below the header.
  - Introduced a restrained product system for neutral graphite surfaces, compact controls, one-pixel borders, consistent fields, tables, dialogs, focus states and `160-220ms` motion. Decorative glows, oversized radii, hover lifting and inconsistent glass treatments were removed or reduced.
  - Applied the system to the KPI dashboard, Metric Library, Performance Story, Business Snapshot, authentication, password setup, Shop Profile, Data & Imports, manual editing, leaderboards, Consultant Reviews, targets, reporting periods, empty states, confirmations and notifications.
  - Rebuilt the live Customer Management surface as a denser administrative index with stable row actions and a right-side customer account inspector containing identity, assignment, workspace and existing destructive actions. Invitation, user deletion and company deletion behaviour remains connected to the existing services.
  - Updated the shared protected preview representations for Data & Imports, leaderboards and customer management and added regressions for whole-shell parity and the live customer inspector. All 63 Vitest tests, all 5 Playwright Chromium tests, the Vite production build and `git diff --check` pass; lint has no errors and the same seven non-blocking warnings.
  - Local and hosted desktop/mobile audits covered every primary workspace, exact panel geometry, repeated panel toggles, KPI story `12M`/`FYTD`, responsive SVG parity and zero horizontal overflow. Published protected Preview `dpl_GXozFM5D7L8a4UFfs8Fb7rJYgRba` at `https://bodyshop-dashboard-7en3yhjez-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or alias change was performed.

- **Persistent same-button Workspace and Metrics toggles (13 August 2026)**
  - Kept both top-bar controls mounted at every panel state. Repeated clicks on the same Workspace button now perform `Hide → Show → Hide`; repeated clicks on the same Metrics button perform `Show → Hide → Show → Hide`.
  - Removed the separate desktop panel hide controls. At mobile widths, both slide-over panels begin below the persistent `80px` header so the original toggle remains visible and performs the closing click.
  - Added explicit same-element toggle regressions for authenticated and shared demo flows. All 61 Vitest tests, all 5 Playwright Chromium tests, the Vite production build and `git diff --check` pass; lint has no errors and the same seven existing warnings.
  - Direct local and hosted checks passed at `1580 x 790` and `390 x 844`; panel state, accessible label and `aria-expanded` changed correctly after each click, with zero overflow, no browser diagnostics and no native JavaScript dialog.
  - Published protected Preview `dpl_EVsVy7gnCmcTHSXpkDXr6W2Aynaa` at `https://bodyshop-dashboard-r4822k265-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). The build completed without errors and emitted no runtime logs. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or alias change was performed.

- **Codex-style Workspace and Metrics panels (13 August 2026)**
  - Reworked both side panels around the Codex web-app model: show controls live in the top bar, hide controls live in the corresponding panel, and closing no longer depends on a control in the KPI canvas.
  - Removed the forced Workspace collapse when Metrics opens. At desktop widths, the `288px` Workspace and `400px` Metrics panels can remain open independently and Metrics pushes the application shell instead of covering it.
  - Kept mobile deliberate and touch-safe: only one panel is visible at a time, each has an explicit close control, and Metrics uses a dimmed canvas while remaining fully viewport-contained.
  - Updated shared demo/authenticated interaction regressions and isolated Playwright on `127.0.0.1:4173` with no existing-server reuse, preventing the normal local login app from masking the safe demo route. All 61 Vitest tests, all 5 Playwright Chromium tests, the Vite production build and `git diff --check` pass; lint has no errors and the same seven existing warnings.
  - Direct local and hosted browser checks passed at `1580 x 790` and `390 x 844` with stable panel geometry, ninth-card addition, panel close/reopen/search, Performance Story ranges, no horizontal overflow, no warning/error diagnostics and no native JavaScript dialog.
  - Published protected Preview `dpl_HNRPFeiwf1ESk8JmWRA3mSmu1Mxy` at `https://bodyshop-dashboard-932dy4aej-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). The build completed without errors, emitted no runtime logs and retained the secure root/login boundary. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or alias change was performed.

- **Protected Preview refresh for information controls and KPI story (13 August 2026)**
  - Published the current uncommitted source candidate as protected Preview `dpl_DDFfY6vgRPE2YVpxH4K3FEEAzDHn` at `https://bodyshop-dashboard-69ey9lfw3-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`).
  - Hosted desktop and `390 x 844` mobile checks passed for the KPI-guide-before-Export order, opaque viewport-contained Operational KPI/Daily actual/Daily budget popovers, independent daily explanations and invariant dashboard geometry.
  - Repeated the Metric Library ninth-card add and close/reopen flow and the Completed RO Performance Story `12M`, `FYTD` and February-May `Custom` ranges with a pinned March point. The chart remained proportional, its readout avoided the target annotation and neither viewport overflowed horizontally.
  - The Vercel build completed without errors and emitted no runtime logs. The root route retained the secure login boundary. Production was re-inspected afterward and remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`; no commit, push, promotion or alias change was performed.

- **Split Daily actual and Daily budget explanations (13 August 2026)**
  - Replaced the single combined Daily figures control with matching information icons immediately after Daily actual and Daily budget.
  - Daily actual now explains that it represents estimated working-day sales pace and shows the Paint Sales / `19.33` formula. Daily budget separately explains its planning-benchmark purpose and the Paint Labour Costs × `3.3` / `19.33` formula, including its three-month `Building` state.
  - Each icon opens only its own opaque floating popover on hover/focus, retains tap, Escape and outside-click support, and uses left/right alignment appropriate to its half of the Business Snapshot.
  - Added unit and permanent mobile-smoke coverage for both controls, their separate accessible names/content, exclusive visibility, opaque absolute positioning and invariant document-space layout geometry.
  - All 61 Vitest tests, the Vite production build and `git diff --check` pass; lint has no errors and the same seven existing warnings. Direct local browser checks at desktop and `390 x 844` confirmed both popovers remain inside the viewport, only one opens at a time and no dashboard geometry or horizontal overflow changes.
  - This follow-up is included in protected Preview `dpl_DDFfY6vgRPE2YVpxH4K3FEEAzDHn`; production remains unchanged.

- **Operational KPI guide overlay polish (13 August 2026)**
  - Re-anchored the guide surface to the complete sticky header instead of the 32px icon row, so it always opens beneath the normal header and any customer-view context bar.
  - Raised the header and popover above the reporting-period toolbar and removed the translucent opacity entrance. The `#171d26` surface is now fully opaque from its first visible frame, eliminating underlying labels and controls bleeding through.
  - Right-aligned the `320 x 172` popover to the header action edge with stronger border, ring and shadow treatment; hover, focus, tap, Escape and outside-click dismissal remain supported.
  - All 61 Vitest tests and the Vite production build pass; lint has no errors and the same seven existing warnings. Direct local browser checks at desktop and `390 x 844` confirmed below-header placement, opaque rendering, viewport containment and no horizontal overflow.
  - This follow-up is included in protected Preview `dpl_DDFfY6vgRPE2YVpxH4K3FEEAzDHn`; production remains unchanged.

- **Floating Daily figures guide (13 August 2026)**
  - Replaced the inline Daily figures expansion with a rounded, fully opaque floating popover matching the Operational KPI guide's visual and interaction language.
  - Desktop hover and keyboard focus now reveal the explanation without moving the Business Snapshot or cards; click/tap, Escape and outside-click behavior remain available for touch and keyboard users.
  - Separated decorative Performance Pulse clipping from its content layer and raised the Pulse stacking context so the popover can overlay downstream controls and KPI cards without allowing the ambient background glow to bleed outside the rounded panel.
  - Added unit coverage for hover visibility and absolute positioning, and extended the permanent mobile smoke check to compare document-space layout geometry before and after opening the guide.
  - All 61 Vitest tests, the Vite production build and `git diff --check` pass. Direct local browser checks at desktop and `390 x 844` confirmed a `320 x 196.625` opaque popover, stable Business Snapshot/card geometry and no horizontal overflow. The focused Playwright run passed its auth guard; its mobile scenario reused a separate localhost server that served Login and timed out before reaching the dashboard.
  - This follow-up is included in protected Preview `dpl_DDFfY6vgRPE2YVpxH4K3FEEAzDHn`; production remains unchanged.

- **Header action order refinement (13 August 2026)**
  - Moved the shared Operational KPI guide control to immediately before Export, keeping the guide visually outside the Export-to-Metrics gap while preserving its content, 32 x 32 target and interactions.
  - Updated the layout regression to require the order `KPI guide → Export → Metrics`.
  - The focused Layout Preview suite passes all 7 tests, the full Vitest suite passes all 61 tests, the Vite production build passes and `git diff --check` passes with only existing Windows line-ending notices. Direct local browser checks at desktop and `390 x 844` confirmed the requested left-to-right order with no horizontal overflow.
  - This follow-up is included in protected Preview `dpl_DDFfY6vgRPE2YVpxH4K3FEEAzDHn`; production remains unchanged.

- **Contextual information-control alignment (13 August 2026)**
  - Added a shared accessible `ContextInfoButton` so the header KPI guide and Daily budget explainer use the same circular glyph, 20px visible treatment, 32 x 32 pointer target, border/contrast, hover, active and focus-visible states.
  - Attached the header control immediately after Export and the calculation control immediately after the Daily budget label, keeping each control visually associated with the text it qualifies rather than floating beside a dynamic value.
  - Preserved the existing Operational KPI guide and Daily figures content and interaction. Keyboard focus remains supported; the Daily figures explanation still dismisses through Escape and outside click.
  - Local verification passed all 61 Vitest tests, the Vite production build and `git diff --check`; lint has no errors and the same seven existing warnings. Two Playwright reruns started the five-test suite but the local wrapper stalled before returning results and emitted no assertion failure, so the changed interactions were also verified directly in the supported browser.
  - Desktop (`1580 x 790`) and mobile (`390 x 844`) checks on the deployed shared route measured matching `32 x 32` controls and `14 x 14` glyphs, confirmed correct label adjacency, opaque popovers, Escape/outside dismissal and no horizontal overflow.
  - Published protected Preview `dpl_HEXPkZCPBzn7VVwZT4h88qRRn6Fr` at `https://bodyshop-dashboard-j8z5eff5c-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Approved Vercel CLI access returned the deployed shell, and production remained unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`.

- **KPI story and information-surface stability (13 August 2026)**
  - Removed the Performance Rhythm remount on every timeframe change and moved its first container measurement into the pre-paint layout phase, preventing the graph from briefly rendering at a desktop width before snapping to its real mobile width.
  - Replaced the layered 620ms blur/scale entrance with a restrained 160-180ms opacity/6px transition, removed filter animation, and disabled story/chart entrance animation below 480px so opening a KPI does not flicker on mobile hardware.
  - Tightened the mobile chart proportions and padding, used compact currency/large-number axis labels, and reduced month-label density only when more than eight points would collide. Interactive points and accessible month labels remain available.
  - Changed both the header KPI guide and Daily figures explanation to fully opaque themed surfaces with stronger stacking and shadows, preventing dashboard text from bleeding through while retaining the established dark visual language.
  - Added a permanent 390 x 844 Playwright regression covering exact SVG client/view-box geometry, maximum chart width, page overflow, opaque computed backgrounds and application-origin console diagnostics.
  - Local verification passes 61 Vitest tests, 5 Playwright Chromium tests, the Vite production build and `git diff --check`; lint has no errors and the same seven existing warnings. Desktop browser verification confirmed a stable opening, exact `755 x 320` chart geometry, opaque computed surfaces, no overflow, no application diagnostics and no JavaScript dialog.
  - Published protected Preview `dpl_GDmXFzYThVMtvB13gxiR2pKfnKLb` at `https://bodyshop-dashboard-6cnuourut-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Approved CLI access returned the deployed application shell and unauthenticated browser access redirected to Vercel SSO. Production remains unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`.

- **Final release-candidate consolidation (13 August 2026)**
  - Replaced the accumulated handoff log with a concise authoritative snapshot covering the current candidate, production boundary, calculations, security state, verification evidence, accepted limitations and remaining release steps. Historical Preview detail remains in this changelog.
  - Updated the README to describe the real Supabase `ADMIN`/`CUSTOMER` application, shared dashboard architecture, current KPI experience, local environment variables, test commands and safe protected-Preview workflow. It now states clearly that Node.js is required and Python is not.
  - Added explicit labels and input associations to the login form, plus a distinct friendly message for authentication-service or connection failures.
  - Made Playwright authentication checks deterministic by intercepting the Supabase token request. Coverage now distinguishes invalid credentials from service unavailability, and `npm run test:e2e` provides a documented browser-test command.
  - Expanded `.vercelignore` to exclude local attachments, Codex cache, environment files, test output, Supabase development sources/schema and log files from Preview upload context.
  - Local review passed 61 Vitest tests, 4 Playwright Chromium tests, production build, dependency audit and whitespace checks. Lint has no errors and the same seven existing non-blocking warnings.
  - Published protected Preview `dpl_DwBNkAmfJFb7tm4YYTEVdtoTX73F` at `https://bodyshop-dashboard-kn8apttdl-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, target `preview`). Approved CLI access returned the deployed application shell, unauthenticated browser access redirected to Vercel SSO, and the production alias remained on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`.
  - Repeated the shared-component desktop review: Metric Library close/reopen, 12M/FYTD/Custom graph ranges, pre-Apply stability, four-point February-May result, pinned readout, matching SVG client/view-box geometry, no overflow, no application warning/error and no JavaScript dialog. The previously completed 390 x 844 mobile review remains green; the consolidation did not change dashboard layout code.

- **Daily figures calculation explainer (13 August 2026)**
  - Added a compact circled `i` beside Daily budget in the Business Snapshot. Clicking it reveals what Daily actual and Daily budget mean, both formulas, the selected-period three-month averaging window and why `Building` can appear.
  - Kept the explanation hidden by default and styled it as a temporary ruled section rather than another permanent card or pill. It supports click, outside-click and Escape dismissal with accessible expanded state and labels.
  - Matched the header guide's muted surface styling and teal active state, kept the open explanation transparent with a zero-radius ruled treatment, and increased formula copy to 11px for mobile readability.
  - Passed 61 tests, production build and whitespace checks; lint has no errors and the same seven existing warnings. Desktop and 390x844 mobile browser checks confirmed readable formulas, working open/close behavior, no clipping or horizontal overflow and clean application diagnostics.
  - Published protected Preview `dpl_B35Ud3KHpnEq9X9xaYWD5XceLAKE` at `https://bodyshop-dashboard-qivf3v377-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, Preview target). Production remains unchanged.

- **Reporting-period KPI synchronization (13 August 2026)**
  - Fixed the shared visual Preview so changing the reporting period recalculates Business Snapshot values, every KPI card, movement, target status, rolling average, daily figures and Performance Story data from the chosen month instead of retaining August's fixed values.
  - Fixed the authenticated dashboard's Daily actual and Daily budget rolling window so it anchors to the customer's selected reporting month rather than the newest available month.
  - Added regressions for both the shared Preview and authenticated data path. The full gate passes with 61 tests, production build and whitespace checks; lint has no errors and the same seven existing warnings.
  - Browser checks changed August to May on desktop and February on mobile, confirmed different KPI/snapshot values at each selection, no horizontal overflow and clean application diagnostics.
  - Published protected Preview `dpl_G63RW49xU56AJSUsqoUGWnAxi5L3` at `https://bodyshop-dashboard-fzcksaxau-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, Preview target). Production remains unchanged.

- **Flat Business Snapshot financial summary (12 August 2026)**
  - Replaced the nested glass card, two rounded metric cards and rounded daily-pace card with a single flat financial summary inside the Performance Pulse.
  - Total Sales and Paint Sales now use typography, whitespace, directional movement labels and a fine active rule; Daily actual and Daily budget sit in a quiet secondary row separated by hairline dividers.
  - Preserved both trend-selection actions and the full Performance Story flow. Added regression coverage preventing the inner rounded-card treatment from returning.
  - Passed 60 tests, production build and whitespace checks; lint has no errors and the same seven existing non-blocking warnings. Local desktop (1580x790) and mobile (390x844) checks confirmed transparent inner surfaces, zero inner card radius, no horizontal overflow and clean browser diagnostics.
  - Published protected Preview `dpl_6a2uPYywpe6JPG6s9MnCLJFDUEpc` at `https://bodyshop-dashboard-74tcj4p6c-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, Preview target). The protected app shell was verified through Vercel CLI access; the current browser session correctly redirected to Vercel SSO. Production remains unchanged.

- **Remove confusing Performance Pulse subtitle (12 August 2026)**
  - Removed the sentence `Operational target coverage at a glance, with business activity kept clearly separate.` from the shared Performance Pulse so the headline is no longer followed by unclear explanatory copy.
  - Preserved the `6 of 8 tracked targets are currently met` headline, score, reporting period, Business Snapshot and KPI cards.
  - Published protected Preview `dpl_JDfauZYFU1fgUNgvuBQQAdzDChtW` at `https://bodyshop-dashboard-jox66mwve-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, Preview target). Production remains unchanged.

- **Remove duplicate Active bodyshop sidebar selector (12 August 2026)**
  - Removed the legacy `Active bodyshop` pill and sidebar Bodyshop combobox from both the authenticated admin shell and the shared visual Preview.
  - Customer switching now has one clear path: Customer Management → Open dashboard; customer-view mode and Return to Admin remain unchanged.
  - Added regression assertions confirming no Active bodyshop label or sidebar Bodyshop combobox appears at desktop or mobile widths. The suite remains at 60 passing tests; build and whitespace checks pass.
  - Published protected Preview `dpl_DDrS8eNHihjPH2nmtNW4E9ectVFW` at `https://bodyshop-dashboard-l176sx7a8-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, Preview target). Production remains unchanged.

- **Operational KPI guide moved to header info control (12 August 2026)**
  - Removed the always-visible Operational KPI guide strip from the dashboard canvas and added a compact circular `i` control beside the header actions near Export.
  - Hover, click and keyboard focus reveal an accessible explanation of the eight health KPIs, movement colours, target status and chart-selection marker; the popover is viewport-aligned on mobile.
  - Preserved the existing `Customize cards` entry point as a slim action below the Performance Pulse, without changing KPI calculations or drawer behavior.
  - Added regression coverage for the hidden/visible popover states; 60 tests, build and whitespace checks pass. Lint remains at the same seven existing non-blocking warnings.
  - Published protected Preview `dpl_C5FswMf3EJovrZwQH49RAFCATuUj` at `https://bodyshop-dashboard-6jekl7e5j-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, Preview target). Production remains unchanged.

- **Admin/customer workspace separation (12 August 2026)**
  - Made Customer Management the deliberate entry point for administrators to inspect a bodyshop workspace; each assigned customer now exposes an `Open dashboard` action.
  - Added a reversible customer-view mode that uses the same dashboard component tree and company-scoped data as the customer account, hides admin-only navigation and target controls, and keeps the administrator identity intact.
  - Added a restrained context bar with `Return to Admin`, restoring the previous admin company and Customer Management page without changing roles, permissions or database records.
  - Added shared visual-preview coverage plus authenticated navigation regressions for the enter/inspect/return flow; the suite now passes 60 tests and the build/whitespace checks pass.
  - Published protected Preview `dpl_CE9Wp2GUhVxpD89vvvT2aTZMUKft` at `https://bodyshop-dashboard-lmifqhoee-cpr-analytics.vercel.app/?layout-preview=1` (`READY`, Preview target; direct CLI metadata also reports `target: null`). Production remains unchanged.
  - Verified the shared preview at 1580x790 and 390x844: KPI drawer open/close/reopen, 12M/FYTD/Custom graph ranges, pinned point readout, label alignment, matching chart geometry, admin/customer mode separation and no horizontal overflow. The protected hosted URL correctly enforced Vercel SSO in the current browser session; no protection was disabled or bypassed.

- **Compact reporting-period toolbar (12 August 2026)**
  - Replaced the large nested reporting-period card with a single compact toolbar control matching the Export button's border, background and rounded-corner language.
  - Preserved the rounded glass option menu, keyboard behavior and period selection; desktop and 390x844 mobile verification confirmed May 2026 selection and no overflow.
  - Published protected Preview `dpl_G5oRmebrKzVVoxCBKBmXDJTihaFf` at `https://bodyshop-dashboard-k8172ptax-cpr-analytics.vercel.app/?layout-preview=1`; 58 tests, build and whitespace checks passed. Production remains unchanged.

- **Remove peer-group rank from KPI surfaces (12 August 2026)**
  - Removed the peer-group rank explanation from the Operational KPI guide and removed rank badges and rank wording from all KPI cards and accessible descriptions.
  - Preserved KPI values, variance, targets, target editing and Performance Pulse calculations; leaderboard functionality remains available in its dedicated workspace.
  - Published protected Preview `dpl_23eAfnoVw3KXBuWTiN8ZwW3A7jkJ` at `https://bodyshop-dashboard-atzzk80bc-cpr-analytics.vercel.app/?layout-preview=1`; 58 tests, build and whitespace checks passed, and desktop/390x844 browser verification found no rank surfaces, no overflow and clean diagnostics. Production remains unchanged.

- **Dashboard hierarchy simplification (12 August 2026)**
  - Replaced the generic dashboard header title with a bodyshop-specific welcome (`Welcome, {bodyshop}`) and a concise performance subtitle.
  - Removed the redundant Current bodyshop strip and Data status/metrics card from the dashboard canvas; the reporting-period selector remains as a compact context control.
  - Moved administrator bodyshop selection into the sidebar's Administration section as an Active bodyshop control, preserving customer company scoping and hiding the switcher on non-dashboard admin pages.
  - Published protected Preview `dpl_5v8m23A34k4kTeuiRx2maBLn3pcb` at `https://bodyshop-dashboard-52fp9cycu-cpr-analytics.vercel.app/?layout-preview=1`; 58 tests, build and whitespace checks passed, and desktop/390x844 browser verification found the new hierarchy, no overflow and clean diagnostics. Production remains unchanged.

- **Integrated sidebar account section (12 August 2026)**
  - Reworked the administrator identity block into an `Account` section that matches the sidebar's `Administration` hierarchy; removed the floating card background, border and pill radius while preserving account details and logout behavior.
  - Published protected Preview `dpl_3jc2N9QYtonS4jPieX725SeFPFss` at `https://bodyshop-dashboard-oofnu21ed-cpr-analytics.vercel.app/?layout-preview=1`; 58 tests, build and whitespace checks passed, and desktop/390x844 browser verification found the integrated row, no overflow and clean diagnostics. Production remains unchanged.

- **Pill-style context selectors (12 August 2026)**
  - Replaced the native Bodyshop, Reporting period and legacy filter `<select>` controls with a shared keyboard-accessible `PillSelect` and rounded glass listbox.
  - Raised the dashboard context stacking layer so long reporting-period menus remain fully clickable above the KPI content on desktop and mobile.
  - Published protected Preview `dpl_Fr6pGX4yWeAYBtc2QKzzf8pTYSSb` at `https://bodyshop-dashboard-e30xfnqsl-cpr-analytics.vercel.app/?layout-preview=1`; 58 tests, build and whitespace checks passed, and desktop/390x844 browser verification found working selection, no overflow and clean diagnostics. Production remains unchanged.

- **Pre-Production Security and Release Hardening (12 August 2026)**
  - Added least-privilege Data API grants and explicit `authenticated` ownership policies for companies, analytics, consultant reviews, benchmarks, profiles and leaderboard groups.
  - Added the missing profile/leaderboard foreign-key indexes and consolidated duplicate permissive policies; Supabase performance advisor now reports only informational unused-index notices on the small current dataset.
  - Applied migrations `20260812111203_security_hardening_least_privilege` and `20260812111302_policy_and_fk_performance_cleanup` to the active Supabase project. No application data was created, changed or deleted by the migrations.
  - Hardened `invite-user` and `delete-user`: platform JWT verification is enabled, CORS is origin-scoped, requests are POST-only, error responses use meaningful status codes, and success responses do not return full user objects.
  - Supabase leaked-password protection remains disabled because the current plan does not include it; this is the only remaining security advisor warning and is explicitly accepted for now.
  - Published protected Preview `dpl_5SvS7J8f4Kxjt4bpkixwQ9bPQykq` at `https://bodyshop-dashboard-ql6d6vckv-cpr-analytics.vercel.app/?layout-preview=1`; local tests (58), build, lint and whitespace checks passed, and hosted desktop/mobile drawer/graph smoke checks were clean. Production remains unchanged.

- **Customizable KPI Workspace Candidate (10 August 2026)**
  - Added a right-side Metric Library containing all imported dashboard metrics, with click-to-add, drag-and-drop placement, reorder, remove and reset controls capped at 12 cards.
  - Moved Performance Rhythm and Metric Detail into a full-screen Performance Story overlay that opens from a KPI card, while preserving existing KPI calculations, targets, rankings and reporting-period controls.
  - Made the desktop workspace navigation fully hideable so the KPI grid can expand into the recovered screen space.
  - Added bodyshop-level KPI layout persistence through `dashboard_kpi_layouts`; admins manage the selected bodyshop and customers can manage only their own bodyshop through explicit RLS policies and restricted Data API grants.
  - Applied and transaction-tested the non-destructive Supabase migration. Customer-own, customer-cross-company denial and administrator access all passed, and the verification transaction left no test data behind.
  - Added load/save and drawer-toggle regression coverage; all 53 tests, the production build, lint and Git whitespace checks pass. Local shared-component browser verification covered the drawer, ninth-card addition and full Performance Story overlay without application errors.
  - Published protected source Preview `dpl_xRWKkRNhzmX9Z2EeGHA1kUMdqV4n` at `https://bodyshop-dashboard-h2pl2m642-cpr-analytics.vercel.app/?layout-preview=1`. Desktop and 390x844 browser checks passed for the collapsible navigation, Metric Library, ninth-card addition and Performance Story overlay without horizontal overflow, application console warnings/errors or native dialogs; the root route exposes only the real Secure Login screen. Production remains unchanged.
  - Refined both drawer controls to follow the Codex top-bar pattern: the navigation hide action now sits in the sidebar header at the same height as its reveal action, and a persistent top-right `Metrics` launcher returns whenever the Metric Library closes. The matching drawer close control occupies the same top-right position. Desktop and 390x844 local browser checks passed without horizontal overflow or console errors.
  - Rebalanced the Performance Story into a 1280px analysis window, replaced the stretched SVG with container-aware 1:1 chart geometry, compacted the target into a collision-aware annotation, and arranged Metric Detail as a balanced 2x2 grid. The real shared overlay passed 1580x790 desktop and 390x844 mobile checks with proportional chart scaling, no target/latest-point overlap, no horizontal overflow and no console errors.
  - Published refreshed protected source Preview `dpl_69aJ3QY3vXhVrg219SrUbeR7GfRx` at `https://bodyshop-dashboard-p9ap265ry-cpr-analytics.vercel.app/?layout-preview=1`; Vercel reports `READY` with target `preview`.
  - Repeated the hosted navigation hide/show and Metric Library close/reopen flows. The Performance Story measured 782x320 against a matching desktop view box and 318x250 against a matching fresh-mobile view box; its target annotation avoided the latest point, all four Metric Detail cards stayed equal in height and neither viewport overflowed horizontally.
  - The Preview demo and root/login tabs reported no browser warnings/errors or native dialogs. The root exposed only Secure Login, and production remained unchanged on `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`.
  - Replaced the visible graph ranges with `3M`, `6M`, `12M`, `FYTD` and `Custom`, using `12M` as the default. `FYTD` follows Australia's July-June financial year through the selected reporting month; `Custom` provides an inclusive month-to-month picker with explicit Apply/Cancel actions. The authenticated dashboard and demonstration route share the same filtering utility and component path.
  - Made every plotted month a mouse/touch and keyboard-selectable target. Selecting a point pins a compact glass readout with the full month and formatted KPI value, and selecting another month moves the readout.
  - Added shared period-window utility coverage plus graph interaction regressions. The suite now passes all 58 tests; the production build, lint gate and Git whitespace check pass. Local desktop and 390x844 browser checks confirmed the 12M default, two-point August FYTD, four-point February-May custom range, visible May/July readouts, a fully contained mobile picker, proportional graph geometry, no target collision, no page overflow and clean diagnostics. This follow-up remains local and is not yet in the protected Preview above.

- **Production Release - Metric Detail Panel Alignment (10 August 2026)**
  - Deployed approved source commit `34dcb47` to `https://bodyshop-dashboard.vercel.app` as production deployment `dpl_3AQ3TRxHb4ECSfCq2JurybaWV3sr`.
  - Matched the Metric Detail panel height and outer alignment to the adjacent Performance Rhythm panel at desktop widths while preserving the stacked mobile layout.
  - Removed the redundant explanatory note from the bottom of Metric Detail; the selected KPI value, previous period, rolling average and target status remain intact.
  - Added regression coverage for the removed note and shared panel sizing classes; all 48 tests and the production build passed.
  - Lint passed with only existing non-blocking warnings, the production dependency audit found zero high-severity vulnerabilities and `git diff --check` passed.
  - Browser-verified authenticated production at desktop and 390 x 844 mobile widths: panels align or stack correctly, no horizontal overflow, no console errors/warnings and no native dialogs.
  - Vercel reported no production runtime errors; verification was read-only and did not mutate targets or customer data.

- **Production Release - Percentage-Aware Performance Rhythm (9 August 2026)**
  - Deployed approved source commit `1ee4927` to `https://bodyshop-dashboard.vercel.app` as production deployment `dpl_HzRBSLMmhkkJRZcr7dGMmTWX18Ua`.
  - Added an adaptive percentage chart mode for low-range ratio KPIs such as Paint Cost / Total Sales and Liquid Cost to Refinish.
  - Percentage values are now plotted in percentage points with readable axis labels, while the target line and accessible month tooltips retain the underlying values.
  - Kept the existing absolute-value bar treatment for sales, counts and currency KPIs so the chart remains familiar where it already works well.
  - Added regression coverage for the percentage scale and target line; verified the local desktop/mobile preview, full 48-test suite and production build.
  - Repeated the release gate: lint passed with only existing non-blocking warnings, the production dependency audit found zero high-severity vulnerabilities, the native-dialog scan was clean and `git diff --check` passed.
  - Browser-verified the authenticated production dashboard at desktop and 390 x 844 mobile widths: percentage scale, target line, Metric Detail rolling average, no horizontal overflow, no console errors/warnings and no native dialogs.
  - Vercel reported no production runtime errors; verification was read-only and did not mutate targets or customer data.

- **Performance Pulse Callout Cleanup (9 August 2026)**
  - Removed the `Strongest movement` and `Watch this period` callouts from the Performance Pulse because the new Metric Detail panel is now the single place for KPI movement and target context.
  - Rebalanced the pulse hero into a focused two-column layout while keeping the target score and Business Snapshot unchanged.
  - Added regression coverage confirming both obsolete callouts stay out of the shared authenticated/demo dashboard.
  - Verified the local preview at desktop and 390 x 844 mobile sizes; production remains unchanged pending approval.

- **Metric Detail Panel with Rolling Average (9 August 2026)**
  - Replaced the ambiguous `What changed` side panel with a selected-metric detail panel that shows the current period, previous period, rolling average, movement and target status in one place.
  - Added a selected-period three-month rolling average using the selected month and the two preceding available months; ratio KPIs use weighted underlying totals so the average remains mathematically meaningful.
  - Added plain-language target explanations such as `Ahead by`, `Short by`, `Over by` and `Under by`, plus an explicit `No target set` state for business metrics.
  - Kept the shared authenticated/demo `DashboardWorkspace` component tree intact and added regression coverage for the new detail panel and KPI selection.
  - Verified the local preview at desktop and 390 x 844 mobile sizes; the production alias remains unchanged pending release approval.

- **Production Release - Business Snapshot Labels (9 August 2026)**
  - Deployed source commit `bed17b8` to `https://bodyshop-dashboard.vercel.app` as production deployment `dpl_6TCVFrMDUDVqeqkwrLBrkCWVT1Ti`.
  - Released the clearer `Daily actual` and `Daily budget` wording while leaving both rolling-quarter calculations unchanged.
  - Re-ran the full 6-file, 48-test suite, production build, lint and whitespace checks before release; the authenticated live dashboard showed the new labels, expected values and no Vercel error logs.

- **Business Snapshot Labels (9 August 2026)**
  - Renamed the rolling-quarter `Daily sales pace` and `3.3x reference` labels to `Daily actual` and `Daily budget` so the customer-facing snapshot matches the source spreadsheet's budget-versus-actual terminology.
  - Kept both calculations and their rolling-quarter data source unchanged.

- **Production Release - Business Snapshot and Operational KPI Hierarchy (9 August 2026)**
  - Deployed approved source commit `2d6e55a` to `https://bodyshop-dashboard.vercel.app` as production deployment `dpl_2HGdoxTGysR91weLUPn54nKVJpUf`.
  - Released the title-only Business Snapshot, two non-targetable sales trend controls, and the balanced eight-card operational KPI grid.
  - Limited Performance Pulse scoring and insights to operational KPIs and corrected the no-target fallback to report `8/8` rather than the former ten-card denominator.
  - Repeated the complete release gate immediately before deployment: 6 test files and 48 tests, production build, lint, dependency audit, native-dialog scan and Git whitespace checks all passed.
  - Verified the authenticated live `boylesmash` workspace, real Supabase-backed KPI/target values, both sales trends, the Completed RO target-editor open/cancel flow, the 3M timeframe and every drawer destination.
  - Confirmed desktop and 390 x 844 mobile layouts have no horizontal overflow, the mobile drawer and target editor work, and the application console contains no warnings/errors or native JavaScript dialogs.
  - Confirmed the production `?layout-preview=1` query continues to show the real authenticated workspace rather than demonstration data; the public URL returns HTTP 200 and Vercel reported no production runtime errors.
  - Production verification was read-only: no target save/removal, upload, invitation, review edit, deletion or other live customer-data mutation was performed.

- **Business Snapshot and Operational KPI Hierarchy Preview (9 August 2026)**
  - Moved Total Sales and Paint Sales out of the health KPI grid and into a compact, neutral Business Snapshot inside the existing Performance Pulse hero.
  - Kept both sales figures clickable for the Performance Rhythm chart while removing their target controls, target states and target-line treatment.
  - Preserved the existing daily sales pace and 3.3x figure as a clearly labelled informational rolling-quarter reference rather than a health target.
  - Simplified the customer-facing Business Snapshot to show only its title and business figures, removing the internal score explanation, `Not scored` badge and informational footer copy.
  - Limited the Performance Pulse score, strongest/watch signals and missed-target insights to genuine operational KPIs.
  - Corrected the no-target fallback ring so a fully reporting shop shows `8/8` operational KPIs rather than retaining the former ten-card denominator.
  - Rebalanced the eight operational KPIs into a four-by-two desktop grid and retained the two-column mobile layout.
  - Left any previously stored Total Sales or Paint Sales benchmark records untouched; the preview simply ignores them in the interface and score.
  - Added regression coverage for business/health separation, sales trend selection, operational target editing and the no-target fallback; all 48 tests, build and lint checks pass.
  - Browser-verified the local full application at 1440 x 1000 and 390 x 844 with no horizontal overflow, console warnings/errors or native dialogs.
  - Published and browser-verified protected source Preview `dpl_9vXkoGzRcTkKgyGSwVJbMg3oEP1v` at `https://bodyshop-dashboard-6fhx4afi9-cpr-analytics.vercel.app/?layout-preview=1`; Vercel reports `READY` with preview target `null`.
  - Repeated the desktop/mobile layout, business/operational trend selection, Completed RO target-editor open/cancel and mobile drawer checks on the hosted preview with no browser warnings/errors, native dialogs or Vercel runtime errors. The approved work was subsequently released to production as `dpl_2HGdoxTGysR91weLUPn54nKVJpUf`.

- **Production Release - Target Editor, Preview Parity and KPI Indicator Clarity (9 August 2026)**
  - Deployed approved source commit `6b18e3c` to `https://bodyshop-dashboard.vercel.app` as production deployment `dpl_HM7ox6Z57AxNK8d6kXqCwZV28RkH`.
  - Released the in-app target editor, shared authenticated/demo dashboard component, explicit KPI target labels and gaps, and responsive KPI card guide.
  - Repeated the complete release gate immediately before deployment: 6 test files and 46 tests, production build, lint, dependency audit and Git whitespace checks all passed.
  - Verified the authenticated live `boylesmash` workspace, real Supabase-backed KPI/target values, target-editor open/cancel flow, KPI and timeframe controls, Shop Profile round trip and mobile drawer.
  - Confirmed desktop and 390 x 844 mobile layouts have no horizontal overflow, the application console is clean, and no native JavaScript dialog appears.
  - Confirmed the production `?layout-preview=1` query cannot expose demonstration mode and Vercel reported no production runtime errors.
  - Production verification was read-only: no target save/removal, upload, invitation, deletion or other live customer-data mutation was performed.

- **KPI Indicator Clarity (9 August 2026)**
  - Replaced ambiguous target-status dots with written `Target met`, `Target missed` and `No target set` states.
  - Added a visible target gap to configured KPI cards using plain wording such as `Ahead by`, `Short by`, `Over by` and `Under by`.
  - Added a responsive KPI card guide explaining movement colours, target colours, peer ranking and the selected-for-chart treatment.
  - Preserved the existing higher-is-better and lower-is-better calculations, benchmark values, rankings and Supabase persistence.
  - Added accessible card summaries and regression coverage for sales, booth-cycle and percentage target scenarios.
  - Verified 46 tests, the production build, lint, Git whitespace checks, dynamic target recalculation, and desktop/mobile layouts without application console errors or page overflow.
  - Published and browser-verified protected source Preview `dpl_95MxgAQbvh1QoxyS7fWx3xKhEp6m`; the approved work was subsequently released to production as `dpl_HM7ox6Z57AxNK8d6kXqCwZV28RkH`.

- **Target Editor and Preview Parity Repair (9 August 2026)**
  - Replaced the benchmark action's unsupported native browser prompt with an accessible in-app editor for creating, updating and removing KPI targets.
  - Added validation and correct currency, number and percentage conversions while preserving the existing Supabase save/delete services and permission boundaries.
  - Replaced the native reporting-period prompt and remaining native alerts with in-app UI.
  - Added a lint error that blocks future use of `alert`, `prompt` and `confirm` in application code.
  - Removed the design drift between the demonstration preview and authenticated application by introducing one shared `DashboardWorkspace` component; the demo now swaps only its data adapter and is clearly labelled `Demo`.
  - Added regression coverage for target create/update/remove, validation, keyboard closing, reporting-period creation and shared preview parity.
  - Verified 43 tests, the production build, lint, dependency audit, Git whitespace checks, desktop and mobile browser layouts, target interactions and drawer navigation.
  - Published and browser-verified protected source Preview `dpl_HnqWfk4BQG9vgsSFAmpWqZWc2mLy`, including the deployed target update/removal flow and real login boundary.
  - Kept production deployment `dpl_BuJKH5jSBarFoMmrKuj71bncozdC` unchanged during review; the corrected preview was subsequently approved and released as `dpl_HM7ox6Z57AxNK8d6kXqCwZV28RkH`.

- **Production Release - Workspace and Performance Pulse Redesign (9 August 2026)**
  - Deployed the fully audited source release from commit `e0b4823` to `https://bodyshop-dashboard.vercel.app`.
  - Recorded production deployment `dpl_BuJKH5jSBarFoMmrKuj71bncozdC`, built remotely by Vercel with production-scoped environment variables.
  - Repeated all 38 automated tests, the production build, lint, dependency audit and Git whitespace checks immediately before release; every blocking check passed.
  - Verified the authenticated administrator dashboard, real Supabase data, all drawer destinations, Consultant Reviews, KPI/timeframe controls, sidebar collapse/expand and the live production alias after deployment.
  - Confirmed the production URL returns HTTP 200, Vercel reported no runtime errors or HTTP 500 responses, and the preview-only demonstration switch is disabled in production.
  - No live save, upload, invitation, deletion or other customer-data mutation was performed during production verification.
- **Pre-Production Regression Audit**
  - Expanded automated coverage from 20 to 38 tests across login, administrator and bodyshop permissions, every drawer destination, responsive navigation, KPI/chart controls, imports, manual edits, reporting periods, profile editing, consultant reviews, benchmarks, leaderboards, exports, invitations and confirmed deletion flows.
  - Fixed bodyshop profile and consultant-review workspaces so they remain usable before the first analytics upload.
  - Removed zero-value KPI and chart widgets from true no-data states while keeping the drawer and intentional awaiting-data guidance available.
  - Fixed new reporting periods so they immediately show as unsaved and can be persisted with the existing Save Changes action.
  - Fixed the customer invitation form so a single click cannot submit the same invitation twice.
  - Corrected the real application footer separator and released temporary export object URLs after CSV downloads.
  - Updated vulnerable transitive build packages (`postcss` and `nanoid`) to patched lockfile versions; `npm audit` now reports zero vulnerabilities.
  - Verified all pages at desktop and mobile widths, live Supabase RLS and Edge Function boundaries, preview-only environment scoping, and the final protected Vercel Preview with no application console errors.
  - Published protected Preview deployment `dpl_FGU22rGnyM9QYGythN7fLnxmRoTq`; the audited candidate was subsequently approved and released to production on 9 August 2026.
- **Performance Pulse Dashboard Redesign**
  - Replaced the oversized summary and square KPI presentation with a compact, rounded performance workspace inspired by modern health and performance products.
  - Added an honest target pulse that summarizes configured KPI benchmarks without inventing a proprietary score, alongside daily actual and 3.3x target context.
  - Replaced the legacy line graph with an interactive performance rhythm chart, clearer target markers, timeframe controls, and a factual "What Changed" insight panel.
  - Added responsive entrance, hover, selection, chart, and drawer motion with reduced-motion support for accessibility.
  - Preserved all existing calculations, filters, benchmark editing, ranking, imports, customer management, and administrator-only functionality.
  - Verified the redesign across desktop and mobile, including the mobile drawer, KPI selection, chart animation, overflow, and browser diagnostics.
  - Published a protected non-production Vercel preview for design review before the approved production release on 9 August 2026.
- **Workspace Navigation Redesign**
  - Replaced the crowded top tab bar with a persistent left-hand workspace sidebar inspired by modern productivity tools.
  - Added a collapsible desktop sidebar and responsive mobile drawer while preserving the existing dashboard, imports, leaderboards, reviews, customer management, and profile functionality.
  - Grouped administrator-only tools into a clearly labelled Administration section and kept them hidden from bodyshop customer accounts.
  - Expanded Shop Profile into a dedicated workspace page without removing the compact profile summary from the visual dashboard.
  - Added contextual page headings, export/import actions, and clearer empty-state guidance for administrators with no uploaded data.
- **Reliability and Security Hardening**
  - Fixed CSV upload refreshes so they use the current authenticated user's company scope instead of a stale login snapshot.
  - Persisted per-bodyshop KPI benchmarks in Supabase with customer read access and admin-only write access.
  - Moved the admin role helper into a private schema, fixed its search path, and limited execution to signed-in users.
  - Optimized the new benchmark and admin-profile RLS checks so authenticated identity lookups are evaluated once per query.
  - Verified the remaining Auth advisor warning: leaked-password protection cannot be enabled on the current Free plan because Supabase requires Pro or higher for that feature.
  - Updated upload test mocks and coverage; all automated tests pass.
- **Dashboard Summary Banner**
  - Rebalanced the Current Daily Actual and 3.3x Daily Target panels into a compact responsive layout that preserves both metrics and their explanatory text without a large central gap.
- **Return on Paint Labour Formatting**
  - Added a dedicated rounded whole-number percentage display for Return on Paint Labour (for example, `535%`) while leaving other percentage KPIs at two decimal places.
- **Supabase Auth Client Initialization**
  - Consolidated browser data and authentication calls onto the shared Supabase client to prevent duplicate GoTrueClient instances and related session-storage/login instability.
- **Manual Data Entry**
  - Added a "Save Changes" button to manually persist row edits to the database.
  - Implemented an "unsaved changes" visual state (button turns bright green and displays an asterisk) to prevent accidental data loss when modifying raw values.
- **Percentage KPI Formatting**
  - Updated the global formatting utility to enforce 2 decimal places for all percentage metrics, ensuring precision for derived values like Liquid Cost to Refinish (e.g. 25.21% instead of rounding to 25.0%).
  - Dynamically derived `Paint Cost / Total Sales` and `Liquid Cost to Refinish` from their underlying raw components (Paint Cost per RO, Completed RO, Paint Sales) rather than relying on stale hardcoded values from uploaded CSVs.
- **Daily Budget & Actual Revenue**
  - Updated the "Current Daily Actual" and "3.3x Daily Target" banners to explicitly state they are based on a "rolling quarterly average" calculation rather than a dynamic "X-month rolling" label, improving client clarity.
  - Refactored the math inside the KPI hook to explicitly calculate the average monthly paint sales and labor costs first before dividing by standard working days, solidifying the calculation as a true quarterly average.
  - Locked the calculation for the top banner metrics to always anchor to the *latest available quarter* for the selected company, ensuring that the company's "Current Velocity" Target doesn't wildly fluctuate or degrade when reviewing historical months that lack 3 months of preceding historical data.
  - Added conditional logic to the target side of the banner: if a shop has less than 3 total months of historical data uploaded to the platform, the target amount is gracefully hidden and replaced with an italicized "Calculating Target..." placeholder, preventing misleading targets based on insufficient data.

### Changed
- **Shop Profile Redesign**
  - Completely redesigned the "Shop Profile" (Facility & Staff) widget into a compact, single-row glassmorphic toolbar sitting directly beneath the Company/Period filters.
  - Eliminated vertical dead space by aligning all 6 stats, the title, and the "Edit Profile" button onto a single horizontal axis with horizontal scroll overflow for smaller screens.
  - Improved aesthetics with pill-shaped metrics and distinct hover effects, matching the sleek look of the dashboard navigation without occupying excessive screen real estate.

### Added
- **Delete User Functionality**
  - Added a "Delete User" trash can button directly into the Customer Management UI table for Administrators.
  - Implemented a secure `delete-user` Supabase Edge Function to safely bypass Row Level Security and permanently delete credentials from `auth.users` using an Admin Key.
  - Users cannot accidentally delete their own accounts.
- **Customer Empty State Overlay**
  - Replaced the plain "Awaiting Data" block with a premium glassmorphic overlay for customers who log in without assigned data.
  - Allowed the background dashboard skeleton to remain visible underneath the overlay (soft blur and reduced opacity) for improved visual anticipation.
  - Secured the KPI hook calculations to gracefully fallback to `0` when data is missing to prevent React crashes.

### Added
- **Customer Empty State**
  - Designed a premium "Awaiting Data Upload" empty state for customers so their dashboard feels intentional rather than broken when data is missing.
- **Customer Management Search**
  - Added a real-time search and filter input to the Customer Management UI for instantly finding bodyshops by email, role, or company name.

### Fixed
- **KPI Variance Color Logic**
  - Fixed a logic bug where KPI variance pills were naively treating all negative percentage changes as "bad/red". The UI now correctly cross-references the benchmark type (min vs max) so that metrics where a lower number is better (e.g. Paint Cost / RO) will correctly display negative drops as a positive, green indicator.
- **Trend Graph Independence**
  - Decoupled the Trend Visualization chart from the globally selected month. The trend graph will now always calculate its timeframe (YTD, 3M, 6M, etc.) backwards from the *latest* available data month, allowing users to view full historical trends without changing the month currently being analyzed by the KPI cards above it.
- **Empty State Period Indicator**
  - Updated the top right period indicator to correctly display "No data loaded" with a static grey dot when a company is selected but has zero historical uploads, rather than incorrectly stating "Single month loaded".
- **KPI Empty State Consistency**
  - Fixed a bug where KPI cards would display completely blank (instead of $0 or 0%) when a month period was selected but no data had been uploaded for that specific metric yet. All cards will now consistently fallback to zero.
- **UI Layout Stability**
  - Added strict `whitespace-nowrap` rules to navigation tab buttons to prevent text wrapping on smaller screens or tight flex layouts, ensuring uniform tab sizing across all views.
  - Ensured the "Shop Profile" banner remains visible across all navigation tabs (including Gamified Leaderboards and Customer Management). This prevents the entire UI and navigation tabs from jumping/shifting layout when switching between views.
- **Production Readiness**
  - Removed the "Load Mock Historical Data" button from the empty trend visualization state, preparing the platform for live customer use.
- **Pre-Launch UX Polish**
  - Formatted the "Joined" date in the Customer Management table to a more readable `DD MMM YYYY` format (e.g., 03 Jul 2026).
  - Implemented smart UUID truncation for the User ID column to prevent awkward CSS cut-offs and improve table readability.
  - Updated the "Invite Customer" modal help text to accurately reflect the ability to add new companies manually without a data upload.
  - Decoupled the Shop Profile Summary banner from raw CSV data. It now connects directly to the master company registry, allowing administrators to edit a company's profile (number of painters, booths, etc.) even before the first data upload.
- **Dashboard KPI Consistency**
  - Fixed a bug where some KPI cards showed `$0` while others were entirely blank when no analytics data was loaded. All cards now consistently display a zero state.
- **Login Error UX**
  - Mapped raw Supabase database error codes (like `Invalid login credentials`) into friendly, human-readable error messages on the login screen.
- **Dashboard Navigation Aesthetics**
  - Upgraded the main dashboard tab navigation with modern SVG icons for a more premium enterprise feel.
- **Global Customer Count Metric UX**
  - Updated the global dashboard header so the "Customers" counter reads directly from the Supabase database (reflecting total onboarded bodyshops) rather than only counting customers who have uploaded CSV data.
  - Ensured this metric is exclusively visible to Administrators to provide a business pulse-check, hiding it from standard customers.
- **HTML Title Encoding Bug**
  - Replaced a garbled em-dash character (`â€"`) in the `index.html` `<title>` tag with a standard hyphen to ensure correct rendering across all browsers.
- **Customer Management Table Alignment & Email Column**
  - Fixed a CSS bug where the `flex` property was applied directly to a table cell, causing the "Company" and "Joined" columns to misalign and collapse.
  - Added a new `email` column to the `profiles` table and updated the Customer Management UI to proudly display customer email addresses alongside their roles.
  - Updated the Admin "Unassigned" placeholder to proudly display "System Administrator".
- **Customer Management Profile Visibility**
  - Fixed a bug where administrators could not see invited users in the Customer Management table due to overly restrictive Row Level Security (RLS) on the `profiles` table.
- **Invite Email Delivery**
  - Updated the `invite-user` Edge Function to use `inviteUserByEmail` instead of `generateLink`, ensuring customers actually receive an email invitation to set their password.
- **Supabase Auth Routing Bug**
  - Fixed a critical issue where customers clicking an email invite link were not being directed to the "Set Password" screen.
  - Enhanced URL hash detection (`#access_token=` and `?code=`) to strictly identify email-based invites before Supabase aggressively strips the URL parameters.
- **Consultant Review Notification System**
  - Interactive Bell Notification icon added to the global Header.
  - Interactive Modal for Consultant Reviews.
  - "Historical Log" tab added to the modal to view an infinite vertical timeline of past reviews.
  - Text cards in Historical Log automatically scale to fit long paragraphs without truncation.
- **Login / Authentication Screen**
  - Created a mock login screen with "Admin" and "Customer" role selection.
  - Admin users have full edit access to Consultant Reviews.
  - Customer users have read-only access to Consultant Reviews.
- **Bodyshop Selector & History**
  - Added ability to reset dashboard and re-upload files.
  - Unified color scheme dynamically driving metrics based on target vs. actuals.

### Changed
- **Logo Update**
  - Completely replaced the buggy 3D WebGL (Three.js) interactive logo.
  - Implemented a clean, crisp, native SVG heartbeat logo matching the Login screen.
  - Drastically reduced JavaScript bundle size by uninstalling `three.js`.
- **Layout Adjustments**
  - Removed the bulky inline Consultant Review section from the bottom of the dashboard.
  - Freed up significant screen real estate.
  - Improved color consistency across Daily Target vs Actual Daily Revenue cards.

### Removed
- `three.js` dependency uninstalled.
