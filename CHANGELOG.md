# Changelog

All notable changes to the CPR Analytics Dashboard prototype will be documented in this file.

## [Unreleased]

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
