import React from 'react';
import { fmt } from '../utils/metrics';

function formatTargetGap(value, format) {
  if (format === 'percent') return `${(Number(value) * 100).toFixed(2)} pts`;
  if (format === 'percentWhole') return `${(Number(value) * 100).toFixed(0)} pts`;
  return fmt(value, format === 'currency' ? 'currency' : undefined);
}

function targetSummary(value, benchmark, benchmarkType, format, targetable, benchmarkStatus) {
  const numericValue = Number(value);
  const numericBenchmark = Number(benchmark);
  const hasBenchmark = benchmark !== undefined && benchmark !== null && Number.isFinite(numericBenchmark);

  if (targetable === false) {
    return {
      status: 'reference',
      label: 'Reference metric',
      detail: null,
      description: 'Reference metric; optional targets do not apply to this KPI.'
    };
  }

  if (benchmarkStatus === 'loading' || benchmarkStatus === 'idle') {
    return {
      status: 'loading',
      label: 'Loading target',
      detail: null,
      description: 'The configured target is loading.'
    };
  }

  if (benchmarkStatus === 'error') {
    return {
      status: 'unavailable',
      label: 'Target unavailable',
      detail: null,
      description: 'The configured target could not be loaded.'
    };
  }

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
  benchmarkStatus = 'ready',
  benchmarkType,
  targetable = true,
  onSetBenchmark,
  isAdmin,
  customizing = false,
  position = 0,
  totalCards = 0,
  onMove,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  dropPlacement = null
}) {
  const hasValue = Number.isFinite(value);
  const displayVal = !hasValue ? 'Not entered'
    : format === 'currency' ? fmt(value, 'currency')
      : format === 'percent' ? fmt(value, 'percent')
        : format === 'percentWhole' ? fmt(value, 'percentWhole')
          : fmt(value);
  const hasVariance = Number.isFinite(variance);
  const isGood = hasVariance && (benchmarkType === 'max' ? variance <= 0 : variance >= 0);
  const movementArrow = variance > 0 ? '↗' : variance < 0 ? '↘' : '→';
  const target = targetSummary(value, benchmark, benchmarkType, format, targetable, benchmarkStatus);
  const targetControlsReady = benchmarkStatus === 'ready';
  const targetClass = target.status === 'met'
    ? 'bg-success-500/10 text-success-400'
    : target.status === 'attention'
      ? 'bg-amber-300/10 text-amber-300'
      : target.status === 'reference'
        ? 'bg-brand-400/[0.08] text-brand-300'
        : 'bg-white/[0.04] text-surface-500';
  const cardDescription = `View ${title} performance${isActive ? ', currently selected' : ''}. Current result: ${displayVal}. ${target.description}`;

  return (
    <article
      onDragOver={(event) => onDragOver?.(title, event)}
      onDrop={(event) => onDrop?.(title, event)}
      onDragEnd={onDragEnd}
      className={`kpi-tile group relative overflow-hidden rounded-xl border border-white/[0.07] ${delayClass || ''} ${isActive ? 'kpi-tile-active' : ''} ${customizing ? 'kpi-tile-customizing' : ''} ${isDragging ? 'kpi-tile-dragging' : ''}`}
    >
      {dropPlacement ? <span className={`kpi-insertion-marker kpi-insertion-marker-${dropPlacement}`} aria-hidden="true" /> : null}
      <button
        type="button"
        onClick={customizing ? undefined : onClick}
        tabIndex={customizing ? -1 : 0}
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

        {isActive && !customizing ? <span className="kpi-active-rail absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand-400" /> : null}
      </button>

      {isAdmin && !customizing ? (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onSetBenchmark(title); }}
          disabled={!targetControlsReady}
          className="absolute right-3 top-3 z-20 rounded-lg p-1.5 text-surface-600 opacity-50 transition-all hover:bg-brand-500/10 hover:text-brand-300 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 group-hover:opacity-100 disabled:cursor-wait disabled:opacity-20"
          aria-label={`Set target for ${title}`}
          title={`Set target for ${title}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 109 9M12 3v9l6-6M12 12h9" />
          </svg>
        </button>
      ) : null}

      {customizing ? (
        <div className="absolute inset-x-3 top-3 z-30 flex items-center justify-between gap-2">
          <span
            draggable
            onDragStart={(event) => onDragStart?.(title, event)}
            onDragEnd={onDragEnd}
            title={`Drag ${title} to a new position`}
            className="inline-flex h-8 cursor-grab items-center gap-1.5 rounded-full border border-white/[0.08] bg-surface-900/90 px-2.5 text-[9px] font-bold uppercase tracking-wider text-surface-400 shadow-lg backdrop-blur-xl active:cursor-grabbing"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" /></svg>
            Drag
          </span>
          <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-surface-900/90 p-1 shadow-lg backdrop-blur-xl">
            <button type="button" disabled={position === 0} onClick={() => onMove?.(title, -1)} aria-label={`Move ${title} earlier`} className="grid h-7 w-7 place-items-center rounded-full text-surface-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-25">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="m15 18-6-6 6-6" /></svg>
            </button>
            <button type="button" disabled={position === totalCards - 1} onClick={() => onMove?.(title, 1)} aria-label={`Move ${title} later`} className="grid h-7 w-7 place-items-center rounded-full text-surface-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-25">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="m9 18 6-6-6-6" /></svg>
            </button>
            <button type="button" onClick={() => onRemove?.(title)} aria-label={`Remove ${title} from dashboard`} className="grid h-7 w-7 place-items-center rounded-full text-rose-300 transition-colors hover:bg-rose-500/15 hover:text-rose-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
