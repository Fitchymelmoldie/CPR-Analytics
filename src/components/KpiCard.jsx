import React from 'react';
import { fmt } from '../utils/metrics';

function ordinal(value) {
  if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

export default function KpiCard({
  title,
  value,
  format,
  variance,
  iconPath,
  delayClass,
  isActive,
  onClick,
  benchmark,
  benchmarkType,
  onSetBenchmark,
  isAdmin,
  rank: rankProp,
  cohortSize
}) {
  const rank = typeof rankProp === 'object' && rankProp !== null ? rankProp.rank : rankProp;
  const displayVal = format === 'currency' ? fmt(value, 'currency')
    : format === 'percent' ? fmt(value, 'percent')
    : format === 'percentWhole' ? fmt(value, 'percentWhole')
    : fmt(value);
  const hasVariance = variance !== null && variance !== undefined;
  const isGood = hasVariance && (benchmarkType === 'max' ? variance <= 0 : variance >= 0);
  const isUp = hasVariance && variance > 0;
  const hasBenchmark = benchmark !== undefined && benchmark !== null;
  const hitsBenchmark = hasBenchmark && (benchmarkType === 'max' ? value <= benchmark : value >= benchmark);

  return (
    <article className={`kpi-tile group relative overflow-hidden rounded-[22px] ${delayClass || ''} ${isActive ? 'kpi-tile-active' : ''}`}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={Boolean(isActive)}
        aria-label={`View ${title} performance${isActive ? ', currently selected' : ''}`}
        className="relative z-10 flex min-h-[132px] w-full flex-col p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300/70"
      >
        <div className="flex items-start justify-between gap-2 pr-7">
          <span className="min-w-0 text-[10px] font-bold uppercase leading-tight tracking-[0.13em] text-surface-400" title={title}>{title}</span>
          <span className={`kpi-icon shrink-0 ${isActive ? 'text-brand-300' : 'text-surface-500'}`}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
            </svg>
          </span>
        </div>

        <div className="mt-auto min-w-0 pt-4">
          <div key={displayVal} className="kpi-value-enter truncate text-[1.45rem] font-bold leading-none tracking-[-0.035em] text-white sm:text-[1.65rem]">{displayVal}</div>
          <div className="mt-2 flex min-h-5 items-center justify-between gap-1.5">
            <div className="flex min-w-0 items-center gap-1.5">
              {hasVariance ? (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isGood ? 'bg-success-500/10 text-success-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <span aria-hidden="true">{isUp ? '↗' : '↘'}</span>
                  {Math.abs(variance).toFixed(1)}%
                </span>
              ) : <span className="text-[10px] font-medium text-surface-600">No prior comparison</span>}
              {hasBenchmark ? (
                <span className={`h-1.5 w-1.5 rounded-full ${hitsBenchmark ? 'bg-success-400 shadow-[0_0_8px_rgba(74,222,128,.8)]' : 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,.6)]'}`} title={hitsBenchmark ? 'Target met' : 'Target needs attention'} />
              ) : null}
            </div>
            {rank ? (
              <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${rank === 1 ? 'bg-amber-300/15 text-amber-300' : 'bg-white/[0.04] text-surface-400'}`} title={cohortSize ? `Ranked ${ordinal(rank)} of ${cohortSize}` : `Ranked ${ordinal(rank)}`}>
                {ordinal(rank)}{cohortSize ? ` / ${cohortSize}` : ''}
              </span>
            ) : null}
          </div>
        </div>

        {isActive ? <span className="kpi-active-rail absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand-400" /> : null}
      </button>

      {isAdmin ? (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onSetBenchmark(title); }}
          className="absolute right-3 top-3 z-20 rounded-lg p-1.5 text-surface-600 opacity-50 transition-all hover:bg-brand-500/10 hover:text-brand-300 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 group-hover:opacity-100"
          aria-label={`Set target for ${title}`}
          title={`Set target for ${title}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 109 9M12 3v9l6-6M12 12h9" />
          </svg>
        </button>
      ) : null}
    </article>
  );
}
