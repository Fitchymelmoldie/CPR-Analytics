import React from 'react';

export default function Header({
  pageTitle,
  pageDescription,
  onMenuToggle,
  onReset,
  showReset,
  onExport,
  showExport
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-surface-900/85 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-surface-300 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Open navigation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">{pageTitle}</h1>
            <p className="hidden truncate text-xs text-surface-500 sm:block">{pageDescription}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 rounded-xl border border-surface-700/60 bg-surface-800/65 px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:border-surface-600 hover:bg-surface-700/60 hover:text-white sm:px-4"
              title="Export data"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {showReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/[0.12] px-3 py-2 text-sm font-semibold text-brand-200 transition-colors hover:bg-brand-500/20 hover:text-white sm:px-4"
              title="Import new data"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0-12l-4 4m4-4l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
              </svg>
              <span className="hidden sm:inline">Import data</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
