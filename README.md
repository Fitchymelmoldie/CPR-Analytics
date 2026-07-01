# CPR Analytics Dashboard

A modern, high-performance React prototype built for the CPR (Correct Protect Restore) Consultancy team.

## Overview
This application serves as a gamified data analytics dashboard specifically designed for the collision repair (bodyshop) industry. It enables consultants to load CSV datasets and instantly generate insights on key performance indicators (KPIs) such as `Completed RO`, `Paint Sales`, `Return on Paint Labour`, and `Booth Cycle Time`.

### Core Features
- **CSV Data Ingestion**: Parses proprietary Excel/CSV data dynamically using `papaparse`.
- **Role-Based Authentication**: Mock authentication separating `ADMIN` (consultants) from `CUSTOMER` (bodyshops).
- **Gamified Leaderboards**: Automatically compares metrics across cohorts and generates percent-rankings to drive engagement.
- **Consultant Reviews**: A localized notification bell system allowing admins to leave actionable feedback and historical reviews for specific bodyshops in specific months.
- **Dynamic Trend Visualization**: Charts and graphs powered by `chart.js` rendering multi-month performance trends.

## Tech Stack
- React 19 (via Vite)
- Tailwind CSS v4 (for rapid, glassmorphic styling)
- Chart.js & React-ChartJS-2 (for analytics)
- PapaParse (for CSV ingestion)

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Open a terminal in this directory.
2. Run `npm install` to install all dependencies.

### Running the App
To start the local development server:
```bash
npm run dev
```
Then, open the URL provided in the terminal (usually `http://localhost:5173`) in your web browser.

### Building for Production
To create a minified, production-ready build:
```bash
npm run build
```

## Backups
If you do not have Git installed, a PowerShell script (`backup.ps1`) is included. You can double-click it or run it from the terminal to instantly generate a zipped backup of the entire source code (excluding `node_modules`).
