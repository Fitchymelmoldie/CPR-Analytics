import React, { useEffect, useRef, useState } from 'react';
import { fmt } from '../utils/metrics';
import ContextInfoButton from './ContextInfoButton';

function movementLabel(value) {
  if (!Number.isFinite(value)) return 'No prior comparison';
  return `${Math.abs(value).toFixed(1)}% vs previous`;
}

export default function BusinessSnapshot({
  items,
  selectedKpi,
  onSelectKpi,
  dailyActual,
  dailyReference,
  rollingMonths
}) {
  const referenceReady = rollingMonths >= 3 && Number.isFinite(dailyReference) && dailyReference > 0;
  const [dailyInfoOpen, setDailyInfoOpen] = useState(null);
  const dailyInfoRef = useRef(null);

  useEffect(() => {
    if (!dailyInfoOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!dailyInfoRef.current?.contains(event.target)) setDailyInfoOpen(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setDailyInfoOpen(null);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [dailyInfoOpen]);

  return (
    <section className="business-snapshot" aria-labelledby="business-snapshot-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p id="business-snapshot-title" className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-300">Business snapshot</p>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-surface-600">Current period</span>
      </div>

      <div className="business-metric-grid mt-4 grid grid-cols-2">
        {items.map((item, index) => {
          const displayValue = Number.isFinite(item.value) ? fmt(item.value, item.format) : 'Not entered';
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
              className={`business-metric relative min-w-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 ${index === 0 ? 'pr-4 sm:pr-5' : 'pl-4 sm:pl-5'} ${isActive ? 'business-metric-active' : ''}`}
            >
              <span className="block truncate text-[9px] font-bold uppercase tracking-[0.14em] text-surface-500">{item.title}</span>
              <strong className="mt-2 block truncate text-2xl leading-none tracking-[-0.045em] text-white">{displayValue}</strong>
              <span className={`mt-2 flex items-center gap-1 truncate text-[9px] font-semibold ${hasMovement ? movementTone : 'text-surface-600'}`}>
                {hasMovement ? <span aria-hidden="true">{item.variance < 0 ? '↓' : '↑'}</span> : null}
                {movementLabel(item.variance)}
              </span>
              {isActive ? <span className="business-metric-selection" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div ref={dailyInfoRef} className="business-pace relative mt-5 grid grid-cols-2 gap-x-4 border-t border-white/[0.07] pt-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-0.5">
            <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-surface-600">Daily actual</span>
            <div
              className="group relative"
              onMouseEnter={() => setDailyInfoOpen('actual')}
              onMouseLeave={() => setDailyInfoOpen(null)}
            >
              <ContextInfoButton
                label="How daily actual is calculated"
                expanded={dailyInfoOpen === 'actual'}
                controls="daily-actual-explanation"
                onClick={() => setDailyInfoOpen('actual')}
                onFocus={() => setDailyInfoOpen('actual')}
                onBlur={() => setDailyInfoOpen(null)}
                className="-my-2"
              />
            </div>
          </div>
          <strong className="mt-1 block truncate text-sm font-semibold text-surface-200">{Number.isFinite(dailyActual) ? fmt(dailyActual, 'currency') : 'Building'}</strong>
        </div>
        <div className="min-w-0 border-l border-white/[0.07] pl-4">
          <div className="flex items-center gap-0.5">
            <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-surface-600">Daily budget</span>
            <div
              className="group relative"
              onMouseEnter={() => setDailyInfoOpen('budget')}
              onMouseLeave={() => setDailyInfoOpen(null)}
            >
              <ContextInfoButton
                label="How daily budget is calculated"
                expanded={dailyInfoOpen === 'budget'}
                controls="daily-budget-explanation"
                onClick={() => setDailyInfoOpen('budget')}
                onFocus={() => setDailyInfoOpen('budget')}
                onBlur={() => setDailyInfoOpen(null)}
                className="-my-2"
              />
            </div>
          </div>
          <strong className="mt-1 block truncate text-sm font-semibold text-surface-200">{referenceReady ? fmt(dailyReference, 'currency') : 'Building'}</strong>
        </div>

        {dailyInfoOpen === 'actual' ? (
          <div id="daily-actual-explanation" role="tooltip" aria-label="Daily actual calculation details" className="pointer-events-none absolute left-0 top-full z-40 mt-3 w-[min(20rem,calc(100vw-2rem))] origin-top-left rounded-xl border border-white/[0.10] bg-[#17191c] p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.58)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-400">How Daily actual works</p>
            <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-surface-400">
              <p>Estimated working-day sales pace for the selected reporting period.</p>
              <p><strong className="font-semibold text-surface-200">Daily actual</strong> = average monthly Paint Sales ÷ 19.33 working days.</p>
              <p className="text-surface-500">The average uses up to three available months ending with the selected period.</p>
            </div>
          </div>
        ) : null}

        {dailyInfoOpen === 'budget' ? (
          <div id="daily-budget-explanation" role="tooltip" aria-label="Daily budget calculation details" className="pointer-events-none absolute right-0 top-full z-40 mt-3 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-white/[0.10] bg-[#17191c] p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.58)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-400">How Daily budget works</p>
            <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-surface-400">
              <p>Planning benchmark for the working-day sales pace.</p>
              <p><strong className="font-semibold text-surface-200">Daily budget</strong> = average monthly Paint Labour Costs × 3.3 ÷ 19.33 working days.</p>
              <p className="text-surface-500">This calculated estimate shows “Building” until three months are available.</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
