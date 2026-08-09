import React from 'react';
import { fmt } from '../utils/metrics';

function movementLabel(value) {
  if (!Number.isFinite(value)) return 'No prior comparison';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}% vs previous`;
}

export default function BusinessSnapshot({
  items,
  selectedKpi,
  onSelectKpi,
  dailyActual,
  dailyReference,
  rollingMonths
}) {
  const referenceReady = rollingMonths >= 3 && dailyReference > 0;

  return (
    <section className="business-snapshot rounded-[24px] p-3.5 sm:p-4" aria-labelledby="business-snapshot-title">
      <p id="business-snapshot-title" className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-300">Business snapshot</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map(item => {
          const displayValue = fmt(item.value, item.format);
          const isActive = selectedKpi === item.title;
          const hasMovement = Number.isFinite(item.variance);
          const movementTone = hasMovement && item.variance < 0 ? 'text-amber-300' : 'text-brand-300';
          const description = `View ${item.title} trend${isActive ? ', currently selected' : ''}. Business result: ${displayValue}. ${movementLabel(item.variance)}.`;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSelectKpi(item.title)}
              aria-pressed={isActive}
              aria-label={description}
              className={`business-metric relative min-w-0 rounded-2xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300/70 ${isActive ? 'business-metric-active' : ''}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[9px] font-bold uppercase tracking-[0.13em] text-surface-500">{item.title}</span>
                <svg className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-brand-300' : 'text-surface-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                </svg>
              </span>
              <strong className="mt-2 block truncate text-lg leading-none tracking-[-0.035em] text-white sm:text-xl">{displayValue}</strong>
              <span className={`mt-2 block truncate text-[9px] font-semibold ${hasMovement ? movementTone : 'text-surface-600'}`}>{movementLabel(item.variance)}</span>
              {isActive ? <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-400" /> : null}
            </button>
          );
        })}
      </div>

      <div className="business-pace mt-2.5 grid grid-cols-2 gap-x-3 rounded-2xl px-3 py-2.5">
        <div className="min-w-0">
          <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-surface-600">Daily sales pace</span>
          <strong className="mt-1 block truncate text-xs text-surface-200">{fmt(dailyActual, 'currency')}</strong>
        </div>
        <div className="min-w-0 border-l border-white/[0.05] pl-3">
          <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-surface-600">3.3x reference</span>
          <strong className="mt-1 block truncate text-xs text-surface-200">{referenceReady ? fmt(dailyReference, 'currency') : 'Building'}</strong>
        </div>
      </div>
    </section>
  );
}
