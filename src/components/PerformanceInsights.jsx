import React from 'react';
import { fmt } from '../utils/metrics';
import { directionalVariance, targetIsMet } from '../utils/dashboardKpis';

function displayValue(value, format) {
  return Number.isFinite(value) ? fmt(value, format) : '—';
}

function movementValue(item) {
  return item ? directionalVariance(item) : null;
}

function movementCopy(item) {
  const movement = movementValue(item);
  if (!Number.isFinite(movement)) return 'No prior comparison';
  if (movement === 0) return 'No change vs previous';
  return `${movement > 0 ? '+' : ''}${movement.toFixed(1)}% ${movement > 0 ? 'favourable' : 'unfavourable'} vs previous`;
}

function targetGap(item) {
  if (!item || item.benchmark === undefined || item.benchmark === null || !Number.isFinite(item.value)) return null;
  const gap = Math.abs(item.value - item.benchmark);
  if (item.format === 'percent') return `${(gap * 100).toFixed(2)} pts`;
  if (item.format === 'percentWhole') return `${(gap * 100).toFixed(0)} pts`;
  return fmt(gap, item.format);
}

function targetDetail(item) {
  if (!item || item.targetable === false || item.benchmark === undefined || item.benchmark === null) {
    return { title: 'No target set', detail: 'Add a target to compare this metric with a health threshold.' };
  }

  const met = targetIsMet(item);
  const gap = targetGap(item);
  if (Math.abs(item.value - item.benchmark) < 0.0000001) return { title: 'Exactly on target', detail: `Target ${displayValue(item.benchmark, item.format)}` };

  if (item.benchmarkType === 'max') {
    return {
      title: met ? `Under by ${gap}` : `Over by ${gap}`,
      detail: `Target ${displayValue(item.benchmark, item.format)}`
    };
  }

  return {
    title: met ? `Ahead by ${gap}` : `Short by ${gap}`,
    detail: `Target ${displayValue(item.benchmark, item.format)}`
  };
}

export default function PerformanceInsights({ items, selectedTitle, reportingPeriod, previousPeriod }) {
  const selected = items.find(item => item.title === selectedTitle) || items[0];
  const movement = movementValue(selected);
  const target = targetDetail(selected);
  const targetTone = selected?.targetable !== false && selected?.benchmark !== undefined && selected?.benchmark !== null
    ? targetIsMet(selected) ? 'positive' : 'attention'
    : 'selected';
  const rollingMonths = Number.isFinite(selected?.rollingMonths) ? selected.rollingMonths : 0;
  const rollingLabel = rollingMonths ? `${rollingMonths}M rolling average` : 'Rolling average';
  const rollingDetail = rollingMonths
    ? `${rollingMonths} available month${rollingMonths === 1 ? '' : 's'} ending ${reportingPeriod || 'the selected period'}`
    : 'Waiting for enough reporting periods';

  return (
    <aside className="performance-insights h-full rounded-[28px] p-5 sm:p-6" aria-labelledby="performance-insights-title">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-500">Metric detail</span>
        <h3 id="performance-insights-title" className="mt-2 text-xl font-bold tracking-tight text-white">{selected?.title || 'Choose a KPI'}</h3>
        <p className="mt-1 text-xs leading-relaxed text-surface-500">{selected?.description || 'Select a KPI tile to explore its current position and trend context.'}</p>
      </div>

      {selected ? (
        <div className="mt-5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="insight-row insight-row-selected min-w-0" style={{ animationDelay: '120ms' }}>
              <span>Current period</span>
              <strong className="truncate">{displayValue(selected.value, selected.format)}</strong>
              <p className={movement > 0 ? 'text-success-400' : movement < 0 ? 'text-rose-300' : undefined}>{movementCopy(selected)}</p>
            </div>
            <div className="insight-row insight-row-selected min-w-0" style={{ animationDelay: '200ms' }}>
              <span>{previousPeriod || 'Previous period'}</span>
              <strong className="truncate">{displayValue(selected.previousValue, selected.format)}</strong>
              <p>{previousPeriod ? 'Prior reporting period' : 'No earlier period available'}</p>
            </div>
          </div>

          <div className="insight-row insight-row-selected" style={{ animationDelay: '280ms' }}>
            <span>{rollingLabel}</span>
            <strong>{displayValue(selected.rollingAverage, selected.format)}</strong>
            <p>{rollingDetail}</p>
          </div>

          <div className={`insight-row insight-row-${targetTone}`} style={{ animationDelay: '360ms' }}>
            <span>Target status</span>
            <strong>{target.title}</strong>
            <p>{target.detail}</p>
          </div>

        </div>
      ) : null}
    </aside>
  );
}
