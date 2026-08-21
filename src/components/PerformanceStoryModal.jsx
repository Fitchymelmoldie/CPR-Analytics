import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { directionalVariance, targetIsMet } from '../utils/dashboardKpis';
import { fmt } from '../utils/metrics';
import PerformanceInsights from './PerformanceInsights';
import PerformanceRhythm from './PerformanceRhythm';

function metricStory(item, reportingPeriod) {
  if (!item) return '';
  const movement = directionalVariance(item);
  const period = reportingPeriod || 'This reporting period';
  const movementCopy = !Number.isFinite(movement)
    ? 'does not yet have an earlier period for comparison'
    : movement === 0
      ? 'held steady against the previous period'
      : `${movement > 0 ? 'improved' : 'moved unfavourably'} by ${Math.abs(movement).toFixed(1)}% against the previous period`;

  if (item.targetable === false) {
    return `${period}: ${item.title} ${movementCopy}. This is a reference metric, so it adds context without changing the Performance Pulse.`;
  }

  if (item.benchmark === undefined || item.benchmark === null) {
    return `${period}: ${item.title} ${movementCopy}. Add a target when you are ready to turn this trend into a clear performance signal.`;
  }

  const met = targetIsMet(item);
  return `${period}: ${item.title} ${movementCopy} and is ${met ? 'currently on the right side of its target' : 'still outside its target range'}.`;
}

function storyStatus(item) {
  const movement = directionalVariance(item);
  if (!Number.isFinite(movement)) return { label: 'Building history', tone: 'selected' };
  if (movement > 0) return { label: 'Favourable trend', tone: 'positive' };
  if (movement < 0) return { label: 'Needs attention', tone: 'attention' };
  return { label: 'Holding steady', tone: 'selected' };
}

export default function PerformanceStoryModal({
  isOpen,
  item,
  items,
  trendData,
  timeframe,
  onTimeframeChange,
  periodOptions,
  customRange,
  onCustomRangeChange,
  reportingPeriod,
  previousPeriod,
  comparisonLabel,
  onClose
}) {
  const closeRef = useRef(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const story = useMemo(() => metricStory(item, reportingPeriod), [item, reportingPeriod]);
  const status = item ? storyStatus(item) : { label: 'Building history', tone: 'selected' };

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 80);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item || typeof document === 'undefined') return null;

  return createPortal(
    <div className="performance-story-backdrop fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="performance-story-title" aria-describedby="performance-story-summary" className="performance-story-shell relative flex max-h-[96vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-t-2xl border border-white/[0.11] sm:max-h-[92vh] sm:rounded-2xl">
        <div className="story-ambient story-ambient-one" aria-hidden="true" />
        <div className="story-ambient story-ambient-two" aria-hidden="true" />

        <header className="relative flex shrink-0 items-start justify-between gap-5 border-b border-white/[0.07] px-5 py-5 sm:px-7 lg:px-9">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-300">Performance story</span>
              <span className={`story-status story-status-${status.tone}`}>{status.label}</span>
              {reportingPeriod ? <span className="text-[11px] font-medium text-surface-500">{reportingPeriod}</span> : null}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
              <h2 id="performance-story-title" className="truncate text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">{item.title}</h2>
              <strong className="story-current-value text-2xl font-bold tracking-[-0.045em] text-brand-200 sm:text-3xl">{fmt(item.value, item.format)}</strong>
            </div>
            <p id="performance-story-summary" className="mt-2 max-w-4xl text-xs leading-relaxed text-surface-400 sm:text-sm">{story}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close performance story" className="codex-icon-button grid h-9 w-9 shrink-0 place-items-center">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          {trendData ? (
            <div className="grid items-stretch gap-3.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.72fr)]">
              <PerformanceRhythm
                data={trendData}
                title={item.title}
                timeframe={timeframe}
                onTimeframeChange={onTimeframeChange}
                periodOptions={periodOptions}
                customRange={customRange}
                onCustomRangeChange={onCustomRangeChange}
                benchmark={item.targetable === false ? null : item.benchmark}
                benchmarkType={item.benchmarkType}
                comparisonLabel={comparisonLabel}
                reportingPeriod={reportingPeriod}
              />
              <PerformanceInsights items={items} selectedTitle={item.title} reportingPeriod={reportingPeriod} previousPeriod={previousPeriod} />
            </div>
          ) : (
            <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-dashed border-white/[0.09] bg-black/[0.12] p-8 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-500/10 text-brand-300">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 18.75 9 13.5l3.75 3.75 7.5-9M15.75 8.25h4.5v4.5" /></svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">The current snapshot is ready</h3>
                <p className="mt-2 max-w-md text-sm text-surface-400">Add another reporting period to turn this KPI into a movement story.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}
