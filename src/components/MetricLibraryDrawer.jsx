import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fmt } from '../utils/metrics';

const CATEGORY_LABELS = {
  all: 'All metrics',
  business: 'Snapshot',
  revenue: 'Revenue',
  profitability: 'Profit',
  operations: 'Operations',
  efficiency: 'Efficiency',
  labour: 'Labour',
  paint: 'Paint'
};

function displayValue(item) {
  return Number.isFinite(item.value) ? fmt(item.value, item.format) : 'No data';
}

export default function MetricLibraryDrawer({
  isOpen,
  items,
  visibleTitles,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onAdd,
  onMove,
  onRemove,
  onReset,
  onClose,
  onDragStart,
  onDragEnd,
  maxCards = 12,
  demoMode = false,
  saveStatus = 'idle',
  hasUnsavedChanges = false,
  saveError = null,
  onSave
}) {
  const searchRef = useRef(null);
  const categories = useMemo(() => ['all', ...new Set(items.map(item => item.category).filter(Boolean))], [items]);
  const filteredItems = useMemo(() => items.filter(item => {
    const matchesCategory = category === 'all' || item.category === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || item.title.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }), [category, items, search]);
  const atLimit = visibleTitles.length >= maxCards;
  const selectedItems = visibleTitles.map(title => items.find(item => item.title === title)).filter(Boolean);
  const isSaving = saveStatus === 'saving';
  const isLoading = saveStatus === 'loading';
  const saveDisabled = demoMode || !onSave || !hasUnsavedChanges || isSaving || isLoading;
  const saveLabel = demoMode
    ? 'Preview only'
    : isSaving
      ? 'Saving...'
      : isLoading
        ? 'Loading...'
        : hasUnsavedChanges
          ? (saveStatus === 'error' ? 'Try save again' : 'Save layout')
          : 'Saved';

  useEffect(() => {
    if (!isOpen) return undefined;
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 180);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
    <div className="metric-library-scrim fixed inset-0 z-[64] bg-black/55 backdrop-blur-[2px] xl:hidden" aria-hidden="true" onMouseDown={onClose} />
    <aside id="metric-library-drawer" className="metric-library-drawer fixed bottom-0 right-0 top-14 z-[65] flex w-full max-w-96 flex-col border-l border-white/[0.09] px-4 pb-4 pt-3 shadow-[-20px_0_60px_rgba(0,0,0,0.32)] xl:inset-y-0 xl:shadow-none" aria-labelledby="metric-library-title">
      <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.07] pb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-500">Dashboard builder</span>
          <h2 id="metric-library-title" className="mt-1.5 text-base font-semibold tracking-[-0.02em] text-white">Metric library</h2>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-surface-400">Add or reorder dashboard metrics.</p>
        </div>
      </div>

      <div className="relative pt-4">
        <label htmlFor="metric-library-search" className="sr-only">Search metrics</label>
        <div className="relative">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="m21 21-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
          <input ref={searchRef} id="metric-library-search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search imported metrics" className="codex-input w-full py-2.5 pl-10 pr-4 text-sm" />
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" aria-label="Metric categories">
          {categories.map(option => (
            <button key={option} type="button" onClick={() => onCategoryChange(option)} aria-pressed={category === option} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${category === option ? 'bg-brand-500 text-white' : 'bg-white/[0.035] text-surface-500 hover:bg-white/[0.06] hover:text-surface-200'}`}>
              {CATEGORY_LABELS[option] || option}
            </button>
          ))}
        </div>

        <section className="mt-3 rounded-xl border border-white/[0.06] bg-black/10 p-2.5" aria-labelledby="dashboard-order-title">
          <div className="flex items-center justify-between gap-3 px-1 pb-2">
            <h3 id="dashboard-order-title" className="text-[10px] font-semibold text-surface-300">Dashboard order</h3>
          </div>
          <ol className="max-h-36 space-y-1 overflow-y-auto pr-1">
            {selectedItems.map((item, index) => (
              <li key={item.title} className="flex items-center gap-2 rounded-lg border border-white/[0.045] bg-white/[0.025] px-2 py-1.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-black/20 text-[9px] font-semibold text-surface-500">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-surface-300">{item.title}</span>
                <button type="button" disabled={index === 0} onClick={() => onMove?.(item.title, -1)} aria-label={`Move ${item.title} earlier in dashboard order`} className="codex-icon-button grid h-7 w-7 shrink-0 place-items-center text-surface-400 disabled:opacity-25">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="m15 18-6-6 6-6" /></svg>
                </button>
                <button type="button" disabled={index === selectedItems.length - 1} onClick={() => onMove?.(item.title, 1)} aria-label={`Move ${item.title} later in dashboard order`} className="codex-icon-button grid h-7 w-7 shrink-0 place-items-center text-surface-400 disabled:opacity-25">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="m9 18 6-6-6-6" /></svg>
                </button>
                <button type="button" onClick={() => onRemove?.(item.title)} aria-label={`Remove ${item.title} from dashboard order`} className="codex-icon-button grid h-7 w-7 shrink-0 place-items-center text-rose-300">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="relative mt-4 flex-1 space-y-2 overflow-y-auto pr-1" aria-live="polite">
        {filteredItems.map(item => {
          const isVisible = visibleTitles.includes(item.title);
          const canAdd = !isVisible && !atLimit;
          return (
            <article
              key={item.title}
              draggable={canAdd}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'copy';
                event.dataTransfer.setData('application/x-cpr-metric', item.title);
                event.dataTransfer.setData('text/plain', item.title);
                onDragStart?.(item.title);
              }}
              onDragEnd={() => onDragEnd?.()}
              className={`metric-library-item group flex items-center gap-3 rounded-xl border p-3 ${canAdd ? 'cursor-grab border-white/[0.055] active:cursor-grabbing' : 'border-white/[0.035] opacity-70'}`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/20 text-brand-300">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xs font-semibold text-surface-100">{item.title}</h3>
                <p className="mt-1 truncate text-[10px] text-surface-500">{displayValue(item)} · {CATEGORY_LABELS[item.category] || item.category}</p>
              </div>
              {isVisible ? (
                <span className="shrink-0 rounded-full bg-success-500/10 px-2.5 py-1 text-[9px] font-bold text-success-400">Showing</span>
              ) : (
                <button type="button" disabled={atLimit} onClick={() => onAdd(item.title)} aria-label={`Add ${item.title} to dashboard`} className="codex-icon-button grid h-8 w-8 shrink-0 place-items-center text-brand-300 disabled:cursor-not-allowed disabled:opacity-30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                </button>
              )}
            </article>
          );
        })}
        {filteredItems.length === 0 ? <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-surface-500">No imported metrics match that search.</div> : null}
      </div>

      <div className="relative mt-4 border-t border-white/[0.07] pt-4">
        <div>
          <p className="text-xs font-semibold text-surface-200">{visibleTitles.length} of {maxCards} card spaces used</p>
          <p className="mt-0.5 text-[10px] text-surface-600">{atLimit ? 'Remove a card before adding another.' : 'The teal line shows the exact landing position.'}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={onReset} className="codex-button codex-button-secondary px-3 py-2 text-[10px]">Reset layout</button>
          <button type="button" onClick={onSave} disabled={saveDisabled} className="codex-button codex-button-primary px-3 py-2 text-[10px] disabled:cursor-not-allowed disabled:opacity-45">
            {saveLabel}
          </button>
        </div>
        <div className="mt-3 min-h-8" aria-live="polite">
          {demoMode ? <p className="rounded-xl bg-amber-300/[0.06] px-3 py-2 text-[10px] leading-relaxed text-amber-200/80">Protected design preview · changes stay in this demo session.</p> : null}
          {!demoMode && saveError ? <p className="rounded-xl bg-danger-500/[0.08] px-3 py-2 text-[10px] leading-relaxed text-danger-300">Could not save this layout: {saveError}</p> : null}
          {!demoMode && !saveError && hasUnsavedChanges ? <p className="rounded-xl bg-brand-400/[0.06] px-3 py-2 text-[10px] leading-relaxed text-brand-200">Unsaved changes for this bodyshop.</p> : null}
          {!demoMode && !saveError && !hasUnsavedChanges && saveStatus === 'saved' ? <p className="rounded-xl bg-success-500/[0.06] px-3 py-2 text-[10px] leading-relaxed text-success-300">Layout saved for this bodyshop.</p> : null}
          {!demoMode && !saveError && isLoading ? <p className="rounded-xl bg-white/[0.035] px-3 py-2 text-[10px] leading-relaxed text-surface-400">Loading this bodyshop's saved layout...</p> : null}
        </div>
      </div>
    </aside>
    </>,
    document.body
  );
}
