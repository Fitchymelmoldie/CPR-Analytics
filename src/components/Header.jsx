import React, { useEffect, useRef, useState } from 'react';
import ContextInfoButton from './ContextInfoButton';

export default function Header({
  pageTitle,
  pageDescription,
  onMenuToggle,
  mobileNavOpen = false,
  desktopNavHidden = false,
  onDesktopNavToggle,
  showMetricLibraryToggle = false,
  metricLibraryOpen = false,
  onMetricLibraryToggle,
  onReset,
  showReset,
  onExport,
  showExport,
  showOperationalKpiInfo = false,
  operationalKpiCount = 0,
  viewingAsCompanyName,
  onExitCustomerView
}) {
  const [operationalKpiInfoOpen, setOperationalKpiInfoOpen] = useState(false);
  const operationalKpiInfoRef = useRef(null);

  useEffect(() => {
    if (!operationalKpiInfoOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!operationalKpiInfoRef.current?.contains(event.target)) setOperationalKpiInfoOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOperationalKpiInfoOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [operationalKpiInfoOpen]);

  return (
    <header className="cpr-topbar sticky top-0 z-[70] border-b border-white/[0.07] bg-[#111214]/95 backdrop-blur-xl">
      <div className="flex min-h-14 items-center justify-between gap-3 px-3 sm:px-4 lg:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="codex-icon-button flex h-9 w-9 shrink-0 items-center justify-center lg:hidden"
            aria-label={mobileNavOpen ? 'Close workspace' : 'Open workspace'}
            aria-controls="workspace-sidebar"
            aria-expanded={mobileNavOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDesktopNavToggle}
            className={`codex-icon-button hidden h-9 w-9 shrink-0 items-center justify-center lg:flex ${desktopNavHidden ? '' : 'codex-icon-button-active'}`}
            aria-label={desktopNavHidden ? 'Show workspace' : 'Hide workspace'}
            aria-controls="workspace-sidebar"
            aria-expanded={!desktopNavHidden}
            title={desktopNavHidden ? 'Show workspace' : 'Hide workspace'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d={desktopNavHidden ? 'M4.5 5.25h15v13.5h-15V5.25zm4.5 0v13.5m3.75-9-2.25 2.25 2.25 2.25' : 'M4.5 5.25h15v13.5h-15V5.25zm4.5 0v13.5m4.5-9-2.25 2.25 2.25 2.25'} />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-[-0.01em] text-surface-100 sm:text-[15px]">{pageTitle}</h1>
            {pageDescription ? <p className="hidden truncate text-[11px] text-surface-500 md:block">{pageDescription}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(showExport || showOperationalKpiInfo) && (
            <div className="flex items-center gap-0.5">
              {showOperationalKpiInfo ? (
                <div
                  ref={operationalKpiInfoRef}
                  className="group relative"
                  onMouseEnter={() => setOperationalKpiInfoOpen(true)}
                  onMouseLeave={() => setOperationalKpiInfoOpen(false)}
                >
                  <ContextInfoButton
                    label="Operational KPI guide"
                    expanded={operationalKpiInfoOpen}
                    describedBy="operational-kpi-guide-popover"
                    title="Operational KPI guide"
                    onClick={() => setOperationalKpiInfoOpen(true)}
                    onFocus={() => setOperationalKpiInfoOpen(true)}
                    onBlur={() => setOperationalKpiInfoOpen(false)}
                  />
                </div>
              ) : null}
              {showExport ? (
                <button
                  type="button"
                  onClick={onExport}
                  className="codex-button codex-button-secondary flex h-9 items-center gap-2 px-3 text-xs"
                  title="Export data"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Export</span>
                </button>
              ) : null}
            </div>
          )}
          {showReset && (
            <button
              type="button"
              onClick={onReset}
              className="codex-button codex-button-primary flex h-9 items-center gap-2 px-3 text-xs"
              title="Import new data"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0-12l-4 4m4-4l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
              </svg>
              <span className="hidden sm:inline">Import data</span>
            </button>
          )}
          {showMetricLibraryToggle && (
            <button
              type="button"
              onClick={onMetricLibraryToggle}
              aria-label={metricLibraryOpen ? 'Hide metric library' : 'Show metric library'}
              aria-controls="metric-library-drawer"
              aria-expanded={metricLibraryOpen}
              title={metricLibraryOpen ? 'Hide metric library' : 'Show metric library'}
              className={`codex-button flex h-9 shrink-0 items-center justify-center gap-2 px-2.5 xl:px-3 ${metricLibraryOpen ? 'codex-button-primary' : 'codex-button-secondary text-brand-300'}`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={metricLibraryOpen ? 'M4.5 5.25h15v13.5h-15V5.25zm10.5 0v13.5m-3.75-9L13.5 12l-2.25 2.25' : 'M4.5 5.25h15v13.5h-15V5.25zm10.5 0v13.5m-3.75-9L9 12l2.25 2.25'} />
              </svg>
              <span className="hidden text-xs font-semibold xl:inline">Metrics</span>
            </button>
          )}
        </div>
      </div>
      {viewingAsCompanyName && onExitCustomerView ? (
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-amber-300/10 bg-amber-300/[0.04] px-3 py-1.5 text-xs sm:px-4 lg:px-5">
          <p className="min-w-0 truncate text-amber-100/80">
            <span className="font-semibold text-amber-100">Customer view</span>
            <span className="mx-1.5 text-amber-200/40">·</span>
            Viewing {viewingAsCompanyName} as the customer sees it
          </p>
          <button type="button" onClick={onExitCustomerView} className="shrink-0 font-semibold text-amber-100 underline decoration-amber-200/40 underline-offset-4 transition-colors hover:text-white">
            Return to Admin
          </button>
        </div>
      ) : null}
      {showOperationalKpiInfo ? (
        <div
          id="operational-kpi-guide-popover"
          role="tooltip"
          aria-label="Operational KPI guide details"
          className={`pointer-events-none absolute right-4 top-full z-[70] mt-3 w-[calc(100vw-2rem)] max-w-80 origin-top-right rounded-2xl border border-white/[0.12] bg-[#171d26] p-4 text-left opacity-100 shadow-[0_24px_70px_rgba(0,0,0,0.72)] ring-1 ring-black/20 transition-transform duration-100 sm:right-6 sm:w-80 lg:right-8 ${operationalKpiInfoOpen ? 'visible translate-y-0' : 'invisible -translate-y-1'}`}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-400">Operational KPI guide</p>
          <p className="mt-1.5 text-xs leading-relaxed text-surface-300">These {operationalKpiCount} operational KPIs make up the monthly snapshot. Open a card to review its longer-term trend.</p>
          <p className="mt-2 text-[11px] leading-relaxed text-surface-500">Movement shows favourable or unfavourable change. Target status appears only when a target has been configured, and the teal marker identifies the KPI selected for the chart.</p>
        </div>
      ) : null}
    </header>
  );
}
