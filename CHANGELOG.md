# Changelog

All notable changes to the CPR Analytics Dashboard prototype will be documented in this file.

## [Unreleased]

- **KPI Indicator Clarity (9 August 2026)**
  - Replaced ambiguous target-status dots with written `Target met`, `Target missed` and `No target set` states.
  - Added a visible target gap to configured KPI cards using plain wording such as `Ahead by`, `Short by`, `Over by` and `Under by`.
  - Added a responsive KPI card guide explaining movement colours, target colours, peer ranking and the selected-for-chart treatment.
  - Preserved the existing higher-is-better and lower-is-better calculations, benchmark values, rankings and Supabase persistence.
  - Added accessible card summaries and regression coverage for sales, booth-cycle and percentage target scenarios.
  - Verified 46 tests, the production build, lint, Git whitespace checks, dynamic target recalculation, and desktop/mobile layouts without application console errors or page overflow.
  - Published and browser-verified protected source Preview `dpl_95MxgAQbvh1QoxyS7fWx3xKhEp6m`; production remained on `dpl_BuJKH5jSBarFoMmrKuj71bncozdC`.

- **Target Editor and Preview Parity Repair (9 August 2026)**
  - Replaced the benchmark action's unsupported native browser prompt with an accessible in-app editor for creating, updating and removing KPI targets.
  - Added validation and correct currency, number and percentage conversions while preserving the existing Supabase save/delete services and permission boundaries.
  - Replaced the native reporting-period prompt and remaining native alerts with in-app UI.
  - Added a lint error that blocks future use of `alert`, `prompt` and `confirm` in application code.
  - Removed the design drift between the demonstration preview and authenticated application by introducing one shared `DashboardWorkspace` component; the demo now swaps only its data adapter and is clearly labelled `Demo`.
  - Added regression coverage for target create/update/remove, validation, keyboard closing, reporting-period creation and shared preview parity.
  - Verified 43 tests, the production build, lint, dependency audit, Git whitespace checks, desktop and mobile browser layouts, target interactions and drawer navigation.
  - Published and browser-verified protected source Preview `dpl_HnqWfk4BQG9vgsSFAmpWqZWc2mLy`, including the deployed target update/removal flow and real login boundary.
  - Kept production deployment `dpl_BuJKH5jSBarFoMmrKuj71bncozdC` unchanged while the corrected preview awaits approval.

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
