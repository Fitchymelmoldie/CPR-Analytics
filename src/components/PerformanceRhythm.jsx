import React from 'react';
import { fmt } from '../utils/metrics';

function formatValue(value, format) {
  if (format === 'currency') return fmt(value, 'currency');
  if (format === 'percent') return fmt(value, 'percent');
  if (format === 'percentWhole') return fmt(value, 'percentWhole');
  return fmt(value);
}

export default function PerformanceRhythm({ data, title, timeframe, onTimeframeChange, benchmark, benchmarkType, comparisonLabel }) {
  const values = data?.datasets?.[0]?.data || [];
  const labels = data?.labels || [];
  const format = data?.format || 'number';
  const finiteValues = values.filter(Number.isFinite);
  const rangeValues = benchmark === undefined || benchmark === null ? finiteValues : [...finiteValues, Number(benchmark)];
  const rawMin = rangeValues.length ? Math.min(...rangeValues) : 0;
  const rawMax = rangeValues.length ? Math.max(...rangeValues) : 1;
  const rawRange = Math.max(rawMax - rawMin, Math.abs(rawMax || 1) * 0.12, 1);
  const floor = Math.max(0, rawMin - rawRange * 0.22);
  const ceiling = rawMax + rawRange * 0.18;
  const displayRange = Math.max(ceiling - floor, 1);
  const targetPosition = benchmark === undefined || benchmark === null
    ? null
    : Math.max(4, Math.min(96, ((Number(benchmark) - floor) / displayRange) * 100));

  return (
    <section className="performance-rhythm min-w-0 rounded-[28px] p-5 sm:p-6" aria-labelledby="performance-rhythm-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400">Performance rhythm</span>
            {comparisonLabel ? <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-surface-400">{comparisonLabel}</span> : null}
          </div>
          <h3 id="performance-rhythm-title" className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h3>
          <p className="mt-1 text-xs text-surface-500">Monthly movement with the latest period brought forward.</p>
        </div>

        <div className="flex w-fit items-center rounded-full bg-black/20 p-1" aria-label="Trend timeframe">
          {['YTD', '3M', '6M', '12M', 'ALL'].map(option => (
            <button
              type="button"
              key={option}
              onClick={() => onTimeframeChange(option)}
              aria-pressed={timeframe === option}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${timeframe === option ? 'bg-brand-500 text-white shadow-[0_6px_16px_rgba(0,168,150,0.25)]' : 'text-surface-500 hover:text-surface-200'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-7 h-56 overflow-hidden rounded-[22px] bg-black/[0.12] px-4 pb-8 pt-5 sm:h-64 sm:px-6">
        <div className="pointer-events-none absolute inset-x-4 top-5 bottom-8 flex flex-col justify-between sm:inset-x-6">
          {[0, 1, 2, 3].map(line => <span key={line} className="block border-t border-dashed border-white/[0.045]" />)}
        </div>

        {targetPosition !== null ? (
          <div className="pointer-events-none absolute inset-x-4 z-20 flex items-center gap-2 sm:inset-x-6" style={{ bottom: `calc(2rem + ${targetPosition}% * 0.76)` }}>
            <span className="h-px flex-1 bg-amber-300/45" />
            <span className="rounded-full bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">Target {formatValue(benchmark, format)}</span>
          </div>
        ) : null}

        <div className="relative z-10 flex h-full items-end gap-2 sm:gap-3">
          {values.map((value, index) => {
            const height = 14 + Math.max(0, Math.min(1, (value - floor) / displayRange)) * 76;
            const hasBenchmark = benchmark !== undefined && benchmark !== null;
            const targetMet = hasBenchmark && (benchmarkType === 'max' ? value <= benchmark : value >= benchmark);
            const latest = index === values.length - 1;
            return (
              <div key={`${labels[index]}-${value}`} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
                <div className="absolute bottom-[calc(var(--bar-height)+0.55rem)] left-1/2 z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-surface-900/95 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-xl group-hover:block group-focus-within:block">
                  {labels[index]} · {formatValue(value, format)}
                </div>
                <div
                  tabIndex={0}
                  className={`rhythm-bar relative w-full max-w-11 rounded-[12px_12px_5px_5px] outline-none ring-brand-300/50 transition-[filter,opacity] duration-200 focus:ring-2 ${latest ? 'rhythm-bar-latest' : ''} ${hasBenchmark ? (targetMet ? 'rhythm-bar-positive' : 'rhythm-bar-attention') : 'rhythm-bar-neutral'}`}
                  style={{ '--bar-height': `${height}%`, height: `${height}%`, animationDelay: `${index * 55}ms` }}
                  aria-label={`${labels[index]} ${formatValue(value, format)}${hasBenchmark ? (targetMet ? ', target met' : ', target needs attention') : ''}`}
                >
                  {latest ? <span className="absolute inset-x-1 top-1 h-1 rounded-full bg-white/65" /> : null}
                </div>
                <span className={`absolute -bottom-6 left-1/2 max-w-[64px] -translate-x-1/2 truncate text-[9px] font-semibold ${latest ? 'text-brand-300' : 'text-surface-600'}`}>{labels[index]?.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
