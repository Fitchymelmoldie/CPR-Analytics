# Changelog

All notable changes to the CPR Analytics Dashboard prototype will be documented in this file.

## [Unreleased]

### Added
- **Delete User Functionality**
  - Added a "Delete User" trash can button directly into the Customer Management UI table for Administrators.
  - Implemented a secure `delete-user` Supabase Edge Function to safely bypass Row Level Security and permanently delete credentials from `auth.users` using an Admin Key.
  - Users cannot accidentally delete their own accounts.
- **Customer Empty State Overlay**
  - Replaced the plain "Awaiting Data" block with a premium glassmorphic overlay for customers who log in without assigned data.
  - Allowed the background dashboard skeleton to remain visible underneath the overlay (soft blur and reduced opacity) for improved visual anticipation.
  - Secured the KPI hook calculations to gracefully fallback to `0` when data is missing to prevent React crashes.

### Fixed
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
