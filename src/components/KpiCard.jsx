import React from 'react';
import { fmt } from '../utils/metrics';

function ordinal(value) {
  if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function formatTargetGap(value, format) {
  if (format === 'percent') return `${(Number(value) * 100).toFixed(2)} pts`;
  if (format === 'percentWhole') return `${(Number(value) * 100).toFixed(0)} pts`;
  return fmt(value, format === 'currency' ? 'currency' : undefined);
}

function targetSummary(value, benchmark, benchmarkType, format) {
  const numericValue = Number(value);
  const numericBenchmark = Number(benchmark);
  const hasBenchmark = benchmark !== undefined && benchmark !== null && Number.isFinite(numericBenchmark);

  if (!hasBenchmark || !Number.isFinite(numericValue)) {
    return {
      status: 'unset',
      label: 'No target set',
      detail: null,
      description: 'No target is configured for this KPI.'
    };
  }

  const met = benchmarkType === 'max' ? numericValue <= numericBenchmark : numericValue >= numericBenchmark;
  const gap = Math.abs(numericValue - numericBenchmark);
  const isExact = gap <= Math.max(1e-9, Math.abs(numericBenchmark) * 1e-9);
  const formattedGap = formatTargetGap(gap, format);
  const formattedTarget = fmt(numericBenchmark, format);
  let detail = 'Exactly on target';

  if (!isExact) {
    if (benchmarkType === 'max') detail = met ? `Under by ${formattedGap}` : `Over by ${formattedGap}`;
    else detail = met ? `Ahead by ${formattedGap}` : `Short by ${formattedGap}`;
  }

  return {
    status: met ? 'met' : 'attention',
    label: met ? 'Target met' : 'Target missed',
    detail,
    description: `${met ? 'Target met' : 'Target needs attention'}. ${detail}. Configured target: ${formattedTarget}.`
  };
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
  const movementArrow = variance > 0 ? '↗' : variance < 0 ? '↘' : '→';
  const target = targetSummary(value, benchmark, benchmarkType, format);
  const targetClass = target.status === 'met'
    ? 'bg-success-500/10 text-success-400'
    : target.status === 'attention'
      ? 'bg-amber-300/10 text-amber-300'
      : 'bg-white/[0.04] text-surface-500';
  const rankDescription = rank ? ` Ranked ${ordinal(rank)}${cohortSize ? ` of ${cohortSize}` : ''}.` : '';
  const cardDescription = `View ${title} performance${isActive ? ', currently selected' : ''}. Current result: ${displayVal}. ${target.description}${rankDescription}`;

  return (
    <article className={`kpi-tile group relative overflow-hidden rounded-[22px] ${delayClass || ''} ${isActive ? 'kpi-tile-active' : ''}`}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={Boolean(isActive)}
        aria-label={cardDescription}
        className="relative z-10 flex min-h-[168px] w-full flex-col p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300/70 sm:min-h-[154px]"
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
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isGood ? 'bg-success-500/10 text-success-400' : 'bg-rose-500/10 text-rose-400'}`}
                  title={`${isGood ? 'Favourable' : 'Unfavourable'} movement versus the previous reporting period`}
                >
                  <span aria-hidden="true">{movementArrow}</span>
                  {Math.abs(variance).toFixed(1)}%
                </span>
              ) : <span className="text-[10px] font-medium text-surface-600">No prior comparison</span>}
            </div>
            {rank ? (
              <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${rank === 1 ? 'bg-amber-300/15 text-amber-300' : 'bg-white/[0.04] text-surface-400'}`} title={cohortSize ? `Ranked ${ordinal(rank)} of ${cohortSize}` : `Ranked ${ordinal(rank)}`}>
                {ordinal(rank)}{cohortSize ? ` / ${cohortSize}` : ''}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex min-w-0 flex-col items-start gap-1 border-t border-white/[0.035] pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-1.5">
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${targetClass}`}
              title={target.description}
            >
              <span aria-hidden="true">{target.status === 'met' ? '✓' : target.status === 'attention' ? '!' : '—'}</span>
              {target.label}
            </span>
            {target.detail ? (
              <span className="w-full min-w-0 truncate text-left text-[9px] font-semibold text-surface-500 sm:w-auto sm:text-right" title={target.description}>
                {target.detail}
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
