import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { fmt } from '../utils/metrics';
import { buildNiceScale, chooseCalloutPlacement, shouldShowXAxisLabel, xAxisLabel } from '../utils/chartGeometry';

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat('en-AU', { notation: 'compact', maximumFractionDigits: 1 });

function formatValue(value, format) {
  if (format === 'currency') return fmt(value, 'currency');
  if (format === 'percent') return fmt(value, 'percent');
  if (format === 'percentWhole') return fmt(value, 'percentWhole');
  return fmt(value);
}

function formatAxisValue(value, format, compact) {
  if (!compact || !Number.isFinite(value)) return formatValue(value, format);
  if (format === 'currency') {
    return `$${COMPACT_NUMBER_FORMATTER.format(value)}`;
  }
  if (format === 'number' && Math.abs(value) >= 1000) {
    return COMPACT_NUMBER_FORMATTER.format(value);
  }
  return formatValue(value, format);
}

const DEFAULT_CHART_WIDTH = 760;
const TIMEFRAME_OPTIONS = [
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '12M', label: '12M' },
  { value: 'FYTD', label: 'FYTD', title: 'Financial year to date (1 July to selected month)' }
];

function chartHeightFor(width) {
  if (width < 480) return 236;
  if (width < 720) return 288;
  return 320;
}

function plotInsetsFor(width) {
  return width < 480
    ? { left: 42, right: 24, top: 34, bottom: 44 }
    : { left: 48, right: 30, top: 36, bottom: 48 };
}

function buildSmoothPath(points) {
  if (!points.length) return '';

  return points.slice(1).reduce((path, point, index) => {
    const previousPoint = points[index];
    const midpointX = (previousPoint.x + point.x) / 2;
    return `${path} C ${midpointX.toFixed(1)} ${previousPoint.y.toFixed(1)} ${midpointX.toFixed(1)} ${point.y.toFixed(1)} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`);
}

export default function PerformanceRhythm({
  data,
  title,
  timeframe,
  onTimeframeChange,
  periodOptions = [],
  customRange,
  onCustomRangeChange,
  benchmark,
  benchmarkType,
  comparisonLabel,
  reportingPeriod
}) {
  const gradientId = useId().replace(/:/g, '');
  const stageRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(DEFAULT_CHART_WIDTH);
  const [selectedPointLabel, setSelectedPointLabel] = useState(null);
  const [previewPointLabel, setPreviewPointLabel] = useState(null);
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof window === 'undefined') return undefined;
    const updateWidth = () => {
      const nextWidth = Math.round(stage.clientWidth);
      if (nextWidth > 0) setChartWidth(current => current === nextWidth ? current : nextWidth);
    };
    updateWidth();
    const observer = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(updateWidth) : null;
    observer?.observe(stage);
    window.addEventListener('resize', updateWidth);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  useEffect(() => {
    setSelectedPointLabel(null);
    setPreviewPointLabel(null);
  }, [title]);

  const chartHeight = chartHeightFor(chartWidth);
  const plotInsets = plotInsetsFor(chartWidth);
  const values = data?.datasets?.[0]?.data || [];
  const labels = data?.labels || [];
  const format = data?.format || 'number';
  const isPercentage = format === 'percent' || format === 'percentWhole';
  const chartValues = values.map(value => Number.isFinite(value) && isPercentage ? value * 100 : value);
  const numericBenchmark = Number(benchmark);
  const chartBenchmark = benchmark === undefined || benchmark === null || !Number.isFinite(numericBenchmark)
    ? null
    : numericBenchmark * (isPercentage ? 100 : 1);
  const finiteValues = chartValues.filter(Number.isFinite);
  const rangeValues = chartBenchmark === null ? finiteValues : [...finiteValues, chartBenchmark];
  const { floor, ceiling, ticks: tickValues } = buildNiceScale(rangeValues, { isPercentage });
  const displayRange = Math.max(ceiling - floor, Number.EPSILON);
  const plotWidth = chartWidth - plotInsets.left - plotInsets.right;
  const plotHeight = chartHeight - plotInsets.top - plotInsets.bottom;
  const xFor = (index) => plotInsets.left + (values.length <= 1 ? plotWidth / 2 : (index / (values.length - 1)) * plotWidth);
  const yFor = (value) => plotInsets.top + (1 - (value - floor) / displayRange) * plotHeight;
  const pointSlots = chartValues.map((value, index) => Number.isFinite(value) ? ({
    index,
    x: xFor(index),
    y: yFor(value),
    value: values[index],
    chartValue: value,
    label: labels[index]
  }) : null);
  const pointSegments = pointSlots.reduce((segments, point) => {
    if (!point) return [...segments, []];
    const nextSegments = segments.length ? [...segments] : [[]];
    nextSegments[nextSegments.length - 1] = [...nextSegments[nextSegments.length - 1], point];
    return nextSegments;
  }, []).filter(segment => segment.length > 0);
  const points = pointSegments.flat();
  const linePath = pointSegments.map(buildSmoothPath).join(' ');
  const areaPath = pointSegments.map(segment => {
    const segmentPath = buildSmoothPath(segment);
    const baseline = (chartHeight - plotInsets.bottom).toFixed(1);
    return `M ${segment[0].x.toFixed(1)} ${baseline} ${segmentPath.replace(/^M/, 'L')} L ${segment[segment.length - 1].x.toFixed(1)} ${baseline} Z`;
  }).join(' ');
  const pointSpacing = values.length <= 1 ? plotWidth : plotWidth / (values.length - 1);
  const latestIndex = points.length - 1;
  const targetOperator = benchmarkType === 'max' ? '≤' : '≥';
  const targetText = chartBenchmark === null ? '' : `Goal ${targetOperator} ${formatValue(benchmark, format)}`;
  const targetY = chartBenchmark === null ? null : yFor(chartBenchmark);
  const activePointLabel = previewPointLabel || selectedPointLabel;
  const selectedPoint = points.find(point => point.label === activePointLabel) || null;
  const selectedPointValue = selectedPoint ? formatValue(selectedPoint.value, format) : '';
  const selectedTargetMet = selectedPoint && chartBenchmark !== null
    ? benchmarkType === 'max' ? selectedPoint.chartValue <= chartBenchmark : selectedPoint.chartValue >= chartBenchmark
    : null;
  const selectedTargetStatus = selectedTargetMet === null ? '' : selectedTargetMet ? 'Goal met' : 'Outside goal';
  const selectedCalloutHeight = 30;
  const selectedCalloutWidth = selectedPoint
    ? Math.min(
      plotWidth - 8,
      Math.max(
        104,
        String(selectedPoint.label || '').length * 4.6
          + selectedPointValue.length * 6.4
          + (selectedTargetStatus ? 30 : 24)
      )
    )
    : 0;
  const selectedCalloutX = selectedPoint
    ? Math.max(
      plotInsets.left + 4,
      Math.min(selectedPoint.x - selectedCalloutWidth / 2, chartWidth - plotInsets.right - selectedCalloutWidth - 4)
    )
    : 0;
  const selectedCalloutPlacement = selectedPoint ? chooseCalloutPlacement({
    pointY: selectedPoint.y,
    calloutHeight: selectedCalloutHeight,
    plotTop: plotInsets.top,
    plotBottom: chartHeight - plotInsets.bottom,
    targetY
  }) : { above: true, y: 0 };
  const selectedCalloutAbove = selectedCalloutPlacement.above;
  const selectedCalloutY = selectedCalloutPlacement.y;
  const availablePeriodValues = periodOptions.map(option => option.value);
  const activeCustomFrom = periodOptions.find(option => option.value === customRange?.from)?.label;
  const activeCustomTo = periodOptions.find(option => option.value === customRange?.to)?.label;
  const activeCustomRangeLabel = timeframe === 'CUSTOM' && activeCustomFrom && activeCustomTo
    ? `${activeCustomFrom} to ${activeCustomTo}`
    : null;
  const activeRangeLabel = labels.length
    ? `${labels.length} ${labels.length === 1 ? 'month' : 'months'} · ${labels[0]}${labels.length > 1 ? ` to ${labels[labels.length - 1]}` : ''}${points.length < labels.length ? ` · ${points.length} with data` : ''}`
    : 'No metric data in this range';
  const canApplyCustomRange = Boolean(draftFrom && draftTo);

  const handleTimeframeChange = (nextTimeframe) => {
    setCustomRangeOpen(false);
    setSelectedPointLabel(null);
    setPreviewPointLabel(null);
    onTimeframeChange(nextTimeframe);
  };

  const handleCustomRangeOpen = () => {
    const defaultFrom = periodOptions[Math.max(0, periodOptions.length - 12)]?.value || '';
    const defaultTo = periodOptions[periodOptions.length - 1]?.value || '';
    const nextFrom = availablePeriodValues.includes(customRange?.from) ? customRange.from : defaultFrom;
    const nextTo = availablePeriodValues.includes(customRange?.to) ? customRange.to : defaultTo;
    setDraftFrom(nextFrom <= nextTo ? nextFrom : nextTo);
    setDraftTo(nextFrom <= nextTo ? nextTo : nextFrom);
    setCustomRangeOpen(open => !open);
  };

  const handleCustomRangeSubmit = (event) => {
    event.preventDefault();
    if (!canApplyCustomRange) return;
    onCustomRangeChange({ from: draftFrom, to: draftTo });
    setSelectedPointLabel(null);
    setPreviewPointLabel(null);
    onTimeframeChange('CUSTOM');
    setCustomRangeOpen(false);
  };

  return (
    <section className="performance-rhythm h-full min-w-0 rounded-xl p-4 sm:p-6" aria-labelledby="performance-rhythm-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-400">Performance rhythm</span>
            {comparisonLabel ? <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-surface-400">{comparisonLabel}</span> : null}
          </div>
          <h3 id="performance-rhythm-title" className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h3>
          <p className="mt-1 text-xs text-surface-500">Hover to preview · select to pin.</p>
        </div>

        <div className="relative w-fit max-w-full self-start sm:self-auto">
          <div className="flex max-w-full items-center overflow-x-auto rounded-lg border border-white/[0.06] bg-black/15 p-0.5" role="group" aria-label="Trend timeframe">
            {TIMEFRAME_OPTIONS.map(option => (
              <button
                type="button"
                key={option.value}
                onClick={() => handleTimeframeChange(option.value)}
                aria-pressed={timeframe === option.value}
                title={option.title}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-colors duration-150 ${timeframe === option.value ? 'bg-white/[0.09] text-white shadow-sm' : 'text-surface-500 hover:bg-white/[0.035] hover:text-surface-200'}`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleCustomRangeOpen}
              aria-expanded={customRangeOpen}
              aria-controls={`${gradientId}-custom-range`}
              aria-pressed={timeframe === 'CUSTOM'}
              title="Choose a custom month range"
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-colors duration-150 ${timeframe === 'CUSTOM' ? 'bg-white/[0.09] text-white shadow-sm' : 'text-surface-500 hover:bg-white/[0.035] hover:text-surface-200'}`}
            >
              Custom
            </button>
          </div>

          {customRangeOpen ? (
            <form
              id={`${gradientId}-custom-range`}
              role="dialog"
              aria-label="Custom graph range"
              onSubmit={handleCustomRangeSubmit}
              onKeyDown={(event) => {
                if (event.key !== 'Escape') return;
                event.preventDefault();
                event.stopPropagation();
                setCustomRangeOpen(false);
              }}
              className="absolute right-0 top-full z-30 mt-2 w-[280px] max-w-[calc(100vw-4rem)] rounded-xl border border-white/[0.11] bg-[#17191c] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.48)]"
            >
              <p className="text-xs font-bold text-white">Custom month range</p>
              <p className="mt-1 text-[11px] leading-relaxed text-surface-500">Choose an inclusive start and end month.</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-surface-500" htmlFor={`${gradientId}-custom-from`}>
                  From month
                  <select
                    id={`${gradientId}-custom-from`}
                    value={draftFrom}
                    onChange={(event) => {
                      const nextFrom = event.target.value;
                      setDraftFrom(nextFrom);
                      if (draftTo && nextFrom > draftTo) setDraftTo(nextFrom);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-white/[0.09] bg-black/25 px-2.5 py-2 text-xs font-semibold normal-case tracking-normal text-surface-200 outline-none focus:border-brand-300/50"
                  >
                    {periodOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-surface-500" htmlFor={`${gradientId}-custom-to`}>
                  To month
                  <select
                    id={`${gradientId}-custom-to`}
                    value={draftTo}
                    onChange={(event) => {
                      const nextTo = event.target.value;
                      setDraftTo(nextTo);
                      if (draftFrom && nextTo < draftFrom) setDraftFrom(nextTo);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-white/[0.09] bg-black/25 px-2.5 py-2 text-xs font-semibold normal-case tracking-normal text-surface-200 outline-none focus:border-brand-300/50"
                  >
                    {periodOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setCustomRangeOpen(false)} className="rounded-full px-3 py-2 text-[11px] font-bold text-surface-400 transition-colors hover:text-white">Cancel</button>
                <button type="submit" disabled={!canApplyCustomRange} className="rounded-full bg-brand-500 px-4 py-2 text-[11px] font-bold text-white shadow-[0_8px_22px_rgba(0,168,150,0.22)] transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40">Apply</button>
              </div>
            </form>
          ) : null}
          <p className="mt-2 text-right text-[10px] font-medium text-surface-500" aria-live="polite" data-testid="active-graph-range">
            {timeframe === 'CUSTOM' && activeCustomRangeLabel ? `${activeRangeLabel} · Custom ${activeCustomRangeLabel}` : activeRangeLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 text-[10px] font-medium text-surface-500" data-testid="chart-legend">
        <div className="flex flex-wrap items-center gap-3" aria-label="Chart legend">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 rounded-full bg-brand-300" aria-hidden="true" />Monthly actual</span>
          {chartBenchmark !== null ? (
            <span className="inline-flex items-center gap-1.5 text-amber-200/80" aria-label={`Target rule: ${targetText}`}>
              <span className="w-5 border-t border-dashed border-amber-300/70" aria-hidden="true" />{targetText}
            </span>
          ) : null}
        </div>
        <span aria-label="Axis guide">Y · adaptive value range&nbsp;&nbsp; X · reporting month</span>
      </div>

      <div ref={stageRef} className="rhythm-line-stage relative mt-2 overflow-hidden rounded-[22px] bg-black/[0.12]">
        {points.length ? (
          <svg
            className="block w-full"
            style={{ height: `${chartHeight}px` }}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label={`${title} line trend ending ${reportingPeriod || 'at the selected period'}`}
            preserveAspectRatio="xMidYMid meet"
            data-responsive-plot="true"
          >
            <defs>
              <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.28" />
                <stop offset="72%" stopColor="#00a896" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#00a896" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0f766e" />
                <stop offset="55%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#99f6e4" />
              </linearGradient>
            </defs>

            <g aria-label={isPercentage ? 'Percentage scale' : 'Value scale'}>
              {tickValues.map((tickValue) => {
                const y = yFor(tickValue);
                return (
                  <g key={tickValue} data-testid="y-axis-tick" data-axis-value={tickValue}>
                    <line x1={plotInsets.left} x2={chartWidth - plotInsets.right} y1={y} y2={y} stroke="rgba(255,255,255,0.055)" strokeDasharray="5 7" vectorEffect="non-scaling-stroke" />
                    <text x={plotInsets.left - 8} y={y + 3} fill="#4b5563" fontSize="9" textAnchor="end">
                      {formatAxisValue(isPercentage ? tickValue / 100 : tickValue, format, chartWidth < 480)}
                    </text>
                  </g>
                );
              })}
            </g>
            <line data-testid="x-axis-line" x1={plotInsets.left} x2={chartWidth - plotInsets.right} y1={chartHeight - plotInsets.bottom} y2={chartHeight - plotInsets.bottom} stroke="rgba(255,255,255,0.08)" vectorEffect="non-scaling-stroke" />

            <path d={areaPath} fill={`url(#${gradientId}-area)`} className="rhythm-area" />
            {chartBenchmark !== null ? (
              <g aria-label={targetText} data-testid="target-annotation">
                <line data-testid="target-line" x1={plotInsets.left} x2={chartWidth - plotInsets.right} y1={targetY} y2={targetY} stroke="rgba(252,211,77,0.48)" strokeWidth="1.25" strokeDasharray="5 7" vectorEffect="non-scaling-stroke" />
              </g>
            ) : null}
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${gradientId}-line)`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="rhythm-line"
              data-testid="trend-line"
            />

            {points.map((point, index) => {
              const hitAreaX = Math.max(plotInsets.left, point.x - pointSpacing / 2);
              const hitAreaRight = Math.min(chartWidth - plotInsets.right, point.x + pointSpacing / 2);
              const hasBenchmark = chartBenchmark !== null;
              const targetMet = hasBenchmark && (benchmarkType === 'max' ? point.chartValue <= chartBenchmark : point.chartValue >= chartBenchmark);
              const latest = index === latestIndex;
              const selected = point.label === selectedPointLabel;
              const active = point.label === activePointLabel;
              const crossesYear = point.index > 0 && String(labels[point.index - 1] || '').split(' ')[1] !== String(point.label || '').split(' ')[1];
              const showXAxisLabel = shouldShowXAxisLabel(point.index, values.length, plotWidth) || crossesYear;
              const pointLabel = `${point.label}: ${formatValue(point.value, format)}${hasBenchmark ? (targetMet ? ', target met' : ', target needs attention') : ''}. Hover or focus to preview; select to pin this month's value.`;
              return (
                <g
                  key={`${point.label}-${point.value}`}
                  role="button"
                  tabIndex="0"
                  className="rhythm-point"
                  data-testid="trend-point"
                  aria-label={pointLabel}
                  aria-pressed={selected}
                  onClick={() => setSelectedPointLabel(point.label)}
                  onMouseEnter={() => setPreviewPointLabel(point.label)}
                  onMouseLeave={() => setPreviewPointLabel(null)}
                  onFocus={() => setPreviewPointLabel(point.label)}
                  onBlur={() => setPreviewPointLabel(null)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    setSelectedPointLabel(point.label);
                  }}
                >
                  <rect
                    data-testid="point-hit-area"
                    x={hitAreaX}
                    y={plotInsets.top}
                    width={Math.max(1, hitAreaRight - hitAreaX)}
                    height={plotHeight}
                    fill="rgba(0,0,0,0.001)"
                  />
                  {latest ? <circle cx={point.x} cy={point.y} r="11" fill="none" stroke="#5eead4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="rhythm-latest-pulse" /> : null}
                  {active ? <circle cx={point.x} cy={point.y} r={latest ? 12 : 10} fill="rgba(45,212,191,0.08)" stroke="#5eead4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /> : null}
                  <circle cx={point.x} cy={point.y} r={latest ? 5 : 3.75} fill={latest ? '#ccfbf1' : '#2dd4bf'} stroke="#153f3d" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  {showXAxisLabel ? (
                    <text data-testid="trend-label" x={point.x} y={chartHeight - 15} fill={latest ? '#5eead4' : '#4b5563'} fontSize="9" fontWeight="700" textAnchor="middle">{xAxisLabel(point.label, point.index, labels)}</text>
                  ) : null}
                </g>
              );
            })}

            {selectedPoint ? (
              <g
                data-testid="selected-point-readout"
                data-interaction={previewPointLabel ? 'preview' : 'pinned'}
                data-goal-status={selectedTargetMet === null ? 'none' : selectedTargetMet ? 'met' : 'outside'}
                aria-hidden="true"
                pointerEvents="none"
              >
                <line
                  x1={selectedPoint.x}
                  x2={selectedPoint.x}
                  y1={selectedCalloutAbove ? selectedCalloutY + selectedCalloutHeight : selectedCalloutY}
                  y2={selectedPoint.y + (selectedCalloutAbove ? -8 : 8)}
                  stroke="rgba(148,163,184,0.34)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x={selectedCalloutX}
                  y={selectedCalloutY}
                  width={selectedCalloutWidth}
                  height={selectedCalloutHeight}
                  rx="9"
                  fill="rgba(13,20,27,0.98)"
                  stroke="rgba(148,163,184,0.24)"
                  vectorEffect="non-scaling-stroke"
                />
                {selectedTargetStatus ? (
                  <circle
                    data-testid="callout-status"
                    cx={selectedCalloutX + 11}
                    cy={selectedCalloutY + selectedCalloutHeight / 2}
                    r="2.5"
                    fill={selectedTargetMet ? '#86efac' : '#fcd34d'}
                  />
                ) : null}
                <text
                  x={selectedCalloutX + (selectedTargetStatus ? 19 : 10)}
                  y={selectedCalloutY + 18.5}
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontWeight="650"
                >
                  {selectedPoint.label}
                </text>
                <text
                  x={selectedCalloutX + selectedCalloutWidth - 10}
                  y={selectedCalloutY + 19}
                  fill="#e2e8f0"
                  fontSize="10.5"
                  fontWeight="750"
                  textAnchor="end"
                >
                  {selectedPointValue}
                </text>
              </g>
            ) : null}
          </svg>
        ) : (
          <div className="grid place-items-center px-6 text-center text-sm text-surface-500" style={{ height: `${chartHeight}px` }}>Another reporting period will unlock this trend.</div>
        )}
        <span className="sr-only" aria-live="polite">
          {selectedPoint ? `${selectedPoint.label}: ${selectedPointValue}${selectedTargetStatus ? `, ${selectedTargetStatus}` : ''}` : ''}
        </span>
      </div>
    </section>
  );
}
