import React, { useCallback, useMemo, useState } from 'react';
import KpiCard from './KpiCard';
import MetricLibraryDrawer from './MetricLibraryDrawer';
import PerformancePulse from './PerformancePulse';
import PerformanceStoryModal from './PerformanceStoryModal';
import PillSelect from './PillSelect';
import { MAX_DASHBOARD_KPI_CARDS } from '../utils/dashboardKpis';
import { reorderMetricTitles } from '../utils/dashboardLayout';

function pointerPlacement(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX >= rect.left + (rect.width / 2) ? 'after' : 'before';
}

function ContextSelect({ id, label, value, options, onChange, formatLabel, readOnlyValue, className = '', compact = false }) {
  return (
    <div className={`${compact ? 'flex items-center gap-2' : 'dashboard-context-card min-w-0 rounded-2xl px-4 py-3.5'} ${className}`}>
      <label htmlFor={readOnlyValue ? undefined : id} className={`${compact ? 'text-[9px] font-bold uppercase tracking-[0.14em] text-surface-500' : 'block text-[9px] font-bold uppercase tracking-[0.17em] text-surface-600'}`}>
        {label}
      </label>
      {readOnlyValue ? (
        <p className="mt-1.5 truncate text-sm font-semibold text-surface-200">{readOnlyValue}</p>
      ) : (
        <PillSelect id={id} label={label} value={value} onChange={onChange} options={options} formatLabel={formatLabel} variant={compact ? 'toolbar' : 'context'} />
      )}
    </div>
  );
}

export function KpiCardGuide({ count, visibleCount, customizing, onCustomize }) {
  return (
    <aside className="dashboard-shop-strip rounded-2xl px-4 py-3" aria-labelledby="kpi-card-guide-title">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="shrink-0">
          <p id="kpi-card-guide-title" className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-400">Operational KPI guide</p>
          <p className="mt-1 text-[11px] text-surface-500">These {count} operational KPIs make up the monthly snapshot.</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 xl:max-w-4xl xl:grid-cols-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-black/10 px-3 py-2">
            <span aria-hidden="true" className="rounded-full bg-success-500/10 px-2 py-0.5 text-[9px] font-bold text-success-400">↗ 4.2%</span>
            <span aria-hidden="true" className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-400">↘ 3.6%</span>
            <span className="basis-full text-[10px] font-medium text-surface-400">Favourable or unfavourable change</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-black/10 px-3 py-2">
            <span aria-hidden="true" className="rounded-full bg-success-500/10 px-2 py-0.5 text-[9px] font-bold text-success-400">✓ Target met</span>
            <span aria-hidden="true" className="rounded-full bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">! Target missed</span>
            <span className="basis-full text-[10px] font-medium text-surface-400">Current result compared with target</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2">
            <span aria-hidden="true" className="h-0.5 w-8 shrink-0 rounded-full bg-brand-400" />
            <span className="text-[10px] font-medium text-surface-400">Selected for the chart</span>
          </div>
        </div>
        <button type="button" onClick={onCustomize} aria-expanded={customizing} className={`codex-button inline-flex shrink-0 items-center justify-center gap-2 px-3 py-2.5 text-xs ${customizing ? 'codex-button-primary' : 'codex-button-secondary text-brand-300'}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
          {customizing ? 'Done customizing' : `Customize cards · ${visibleCount}`}
        </button>
      </div>
    </aside>
  );
}

function ConsultantReviewStrip({ review, status, selectedPeriod, periodLabel, isAdmin, onOpen }) {
  if (!onOpen) return null;

  const summary = review?.improvements?.trim() || review?.trendAnalysis?.trim() || '';
  const reviewPeriodLabel = review?.periodLabel || periodLabel;
  const isLoading = status === 'loading' || status === 'idle';
  const message = isLoading
    ? 'Loading the latest consultant review…'
    : status === 'error'
      ? 'The review history could not be refreshed.'
      : summary || `No review has been added for ${periodLabel || 'this period'}.`;
  const actionLabel = review ? 'View review' : isAdmin ? 'Add review' : 'View reviews';

  return (
    <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3" aria-labelledby="latest-consultant-review-title">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-brand-400/15 bg-brand-400/[0.07] text-brand-300" aria-hidden="true">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h2 id="latest-consultant-review-title" className="text-xs font-semibold text-surface-100">Latest consultant review</h2>
            {reviewPeriodLabel ? <span className="text-[10px] font-medium text-surface-500">{reviewPeriodLabel}</span> : null}
          </div>
          <p className={`mt-1 truncate text-xs ${status === 'error' ? 'text-amber-300' : 'text-surface-400'}`} aria-live="polite">{message}</p>
        </div>
        <button type="button" onClick={() => onOpen(review?.period || selectedPeriod)} disabled={isLoading} aria-label={actionLabel} className="codex-button codex-button-secondary shrink-0 px-3 py-2 text-xs disabled:cursor-wait disabled:opacity-45">
          <span className="hidden sm:inline">{actionLabel}</span>
          <span className="sm:hidden">Open</span>
        </button>
      </div>
    </section>
  );
}

export default function DashboardWorkspace({
  isAdmin,
  periods = [],
  selectedPeriod,
  onPeriodChange,
  formatPeriodLabel,
  items,
  selectedKpi,
  onSelectKpi,
  onSetBenchmark,
  dailyActual,
  dailyTarget,
  rollingMonths,
  reportingPeriod,
  dataStatusTone = 'current',
  consultantReview = null,
  consultantReviewStatus = 'ready',
  onOpenConsultantReview,
  previousPeriod,
  trendData,
  timeframe,
  onTimeframeChange,
  periodOptions,
  customRange,
  onCustomRangeChange,
  comparisonLabel,
  demoMode = false,
  navigationHidden = false,
  metricLibraryOpen,
  onCustomizeChange,
  visibleTitles,
  onVisibleTitlesChange,
  layoutSaveStatus = 'idle',
  hasUnsavedLayout = false,
  layoutSaveError = null,
  onSaveLayout
}) {
  const defaultVisibleTitles = useMemo(() => items.filter(item => item.defaultVisible).map(item => item.title), [items]);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const drawerOpen = typeof metricLibraryOpen === 'boolean' ? metricLibraryOpen : internalDrawerOpen;
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('all');
  const [storyTitle, setStoryTitle] = useState(null);
  const [draggedTitle, setDraggedTitle] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const visibleItems = visibleTitles.map(title => items.find(item => item.title === title)).filter(Boolean);
  const storyItem = items.find(item => item.title === storyTitle) || null;

  const setCustomizationOpen = useCallback((open) => {
    if (typeof metricLibraryOpen !== 'boolean') setInternalDrawerOpen(open);
    onCustomizeChange?.(open);
  }, [metricLibraryOpen, onCustomizeChange]);

  const handleMetricSelect = useCallback((title) => {
    onSelectKpi(title);
    setStoryTitle(title);
  }, [onSelectKpi]);

  const handleAddMetric = useCallback((title, insertionIndex) => {
    if (visibleTitles.includes(title) || visibleTitles.length >= MAX_DASHBOARD_KPI_CARDS) return;
    const next = [...visibleTitles];
    if (Number.isInteger(insertionIndex)) next.splice(insertionIndex, 0, title);
    else next.push(title);
    onVisibleTitlesChange(next);
  }, [onVisibleTitlesChange, visibleTitles]);

  const handleRemoveMetric = useCallback((title) => {
    onVisibleTitlesChange(visibleTitles.filter(itemTitle => itemTitle !== title));
  }, [onVisibleTitlesChange, visibleTitles]);

  const handleMoveMetric = useCallback((title, offset) => {
    const index = visibleTitles.indexOf(title);
    const nextIndex = Math.max(0, Math.min(visibleTitles.length - 1, index + offset));
    if (index < 0 || index === nextIndex) return;
    const next = [...visibleTitles];
    next.splice(index, 1);
    next.splice(nextIndex, 0, title);
    onVisibleTitlesChange(next);
  }, [onVisibleTitlesChange, visibleTitles]);

  const handleCardDrop = useCallback((targetTitle, event) => {
    event.preventDefault();
    event.stopPropagation();
    const sourceTitle = event.dataTransfer.getData('application/x-cpr-metric') || event.dataTransfer.getData('text/plain') || draggedTitle;
    if (!sourceTitle || sourceTitle === targetTitle) {
      setDropTarget(null);
      return;
    }
    if (!items.some(item => item.title === sourceTitle)) return;
    const next = reorderMetricTitles(visibleTitles, sourceTitle, targetTitle, pointerPlacement(event));
    if (next !== visibleTitles) onVisibleTitlesChange(next);
    setDraggedTitle(null);
    setDropTarget(null);
  }, [draggedTitle, items, onVisibleTitlesChange, visibleTitles]);

  const handleGridDrop = useCallback((event) => {
    event.preventDefault();
    const title = event.dataTransfer.getData('application/x-cpr-metric') || event.dataTransfer.getData('text/plain') || draggedTitle;
    if (title && visibleTitles.includes(title)) {
      const next = visibleTitles.filter(itemTitle => itemTitle !== title);
      next.push(title);
      onVisibleTitlesChange(next);
    } else if (title) handleAddMetric(title);
    setDraggedTitle(null);
    setDropTarget(null);
  }, [draggedTitle, handleAddMetric, onVisibleTitlesChange, visibleTitles]);

  const finishDragging = useCallback(() => {
    setDraggedTitle(null);
    setDropTarget(null);
  }, []);

  const handleReportingPeriodChange = useCallback((nextPeriod) => {
    if (nextPeriod === selectedPeriod) return;
    onTimeframeChange?.('12M');
    onCustomRangeChange?.({ from: '', to: '' });
    onPeriodChange(nextPeriod);
  }, [onCustomRangeChange, onPeriodChange, onTimeframeChange, selectedPeriod]);

  return (
    <div className="space-y-4 pt-6" data-testid="dashboard-workspace">
      <section className="relative z-30 flex animate-float-in justify-end" aria-label="Dashboard context">
        <ContextSelect
          id="filter-period"
          label="Reporting period"
          value={selectedPeriod}
          options={periods}
          onChange={handleReportingPeriodChange}
          formatLabel={formatPeriodLabel}
          className="w-full sm:w-auto"
          compact
        />
      </section>

      <PerformancePulse
        items={items}
        selectedKpi={selectedKpi}
        onSelectKpi={handleMetricSelect}
        dailyActual={dailyActual}
        dailyTarget={dailyTarget}
        rollingMonths={rollingMonths}
        reportingPeriod={reportingPeriod}
        dataStatusTone={dataStatusTone}
      />

      <ConsultantReviewStrip
        review={consultantReview}
        status={consultantReviewStatus}
        selectedPeriod={selectedPeriod}
        periodLabel={reportingPeriod}
        isAdmin={isAdmin}
        onOpen={onOpenConsultantReview}
      />

      {!drawerOpen ? (
        <div className="flex justify-end">
          <button type="button" onClick={() => setCustomizationOpen(true)} aria-expanded="false" aria-controls="metric-library-drawer" className="codex-button codex-button-secondary inline-flex shrink-0 items-center justify-center gap-2 px-3 py-2 text-xs text-brand-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
            Customize cards · {visibleItems.length}
          </button>
        </div>
      ) : null}

      <section
        className={`kpi-builder-grid relative grid min-h-[190px] grid-cols-2 gap-2.5 rounded-xl transition-all lg:grid-cols-4 ${navigationHidden ? 'min-[1320px]:grid-cols-5 min-[1720px]:grid-cols-6' : ''} ${drawerOpen ? 'kpi-builder-grid-active p-2.5' : ''}`}
        aria-label="Dashboard KPI cards"
        onDragOver={(event) => {
          if (!drawerOpen) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = visibleTitles.includes(draggedTitle) ? 'move' : 'copy';
        }}
        onDrop={handleGridDrop}
      >
        {visibleItems.map((item, index) => (
          <KpiCard
            key={item.title}
            {...item}
            delayClass={`card-appear-${(index % 4) + 1}`}
            isActive={selectedKpi === item.title}
            onClick={() => handleMetricSelect(item.title)}
            onSetBenchmark={onSetBenchmark}
            isAdmin={isAdmin && item.targetable !== false}
            customizing={drawerOpen}
            position={index}
            totalCards={visibleItems.length}
            onMove={handleMoveMetric}
            onRemove={handleRemoveMetric}
            onDragStart={(title, event) => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('application/x-cpr-metric', title);
              event.dataTransfer.setData('text/plain', title);
              setDraggedTitle(title);
            }}
            onDragOver={(title, event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = visibleTitles.includes(draggedTitle) ? 'move' : 'copy';
              const placement = pointerPlacement(event);
              setDropTarget(current => current?.title === title && current?.placement === placement ? current : { title, placement });
            }}
            onDrop={handleCardDrop}
            onDragEnd={finishDragging}
            isDragging={draggedTitle === item.title}
            dropPlacement={dropTarget?.title === item.title && draggedTitle !== item.title ? dropTarget.placement : null}
          />
        ))}
        {visibleItems.length === 0 ? (
          <button type="button" onClick={() => setCustomizationOpen(true)} className="col-span-full grid min-h-[190px] place-items-center rounded-[24px] border border-dashed border-brand-400/20 bg-brand-400/[0.035] p-8 text-center text-sm font-semibold text-brand-300">
            Choose your first KPI card
          </button>
        ) : null}
      </section>


      <MetricLibraryDrawer
        isOpen={drawerOpen}
        items={items}
        visibleTitles={visibleTitles}
        search={librarySearch}
        onSearchChange={setLibrarySearch}
        category={libraryCategory}
        onCategoryChange={setLibraryCategory}
        onAdd={handleAddMetric}
        onMove={handleMoveMetric}
        onRemove={handleRemoveMetric}
        onReset={() => onVisibleTitlesChange([...defaultVisibleTitles])}
        onClose={() => setCustomizationOpen(false)}
        onDragStart={setDraggedTitle}
        onDragEnd={finishDragging}
        maxCards={MAX_DASHBOARD_KPI_CARDS}
        demoMode={demoMode}
        saveStatus={layoutSaveStatus}
        hasUnsavedChanges={hasUnsavedLayout}
        saveError={layoutSaveError}
        onSave={onSaveLayout}
      />

      <PerformanceStoryModal
        isOpen={Boolean(storyItem)}
        item={storyItem}
        items={items}
        trendData={trendData}
        timeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
        periodOptions={periodOptions}
        customRange={customRange}
        onCustomRangeChange={onCustomRangeChange}
        reportingPeriod={reportingPeriod}
        previousPeriod={previousPeriod}
        comparisonLabel={comparisonLabel}
        onClose={() => setStoryTitle(null)}
      />
    </div>
  );
}
