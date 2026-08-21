import React from 'react';
import BusinessSnapshot from './BusinessSnapshot';
import { targetIsMet } from '../utils/dashboardKpis';

export default function PerformancePulse({
  items,
  selectedKpi,
  onSelectKpi,
  dailyActual,
  dailyTarget,
  rollingMonths,
  reportingPeriod
}) {
  const operationalItems = items.filter(item => item.pulseEligible === true);
  const businessItems = items.filter(item => item.category === 'business');
  const targetedItems = operationalItems.filter(item => item.benchmark !== undefined && item.benchmark !== null && Number.isFinite(item.value));
  const targetsMet = targetedItems.filter(targetIsMet).length;
  const reportingItems = operationalItems.filter(item => Number.isFinite(item.value)).length;
  const hasTargets = targetedItems.length > 0;
  const progress = hasTargets
    ? targetsMet / targetedItems.length
    : reportingItems / Math.max(operationalItems.length, 1);
  const progressDegrees = Math.max(0, Math.min(360, progress * 360));

  return (
    <section className="performance-pulse relative z-20 rounded-xl border border-white/[0.07] px-5 py-5 sm:px-6 lg:px-7" aria-labelledby="performance-pulse-title">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
        <div className="pulse-ambient pulse-ambient-one" />
        <div className="pulse-ambient pulse-ambient-two" />
      </div>

      <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,.85fr)] lg:items-center xl:grid-cols-[minmax(360px,1.15fr)_minmax(330px,.9fr)]">
        <div className="flex items-center gap-5 sm:gap-7">
          <div
            className="pulse-score-ring shrink-0"
            style={{ '--ring-target': `${progressDegrees}deg`, '--ring-colour': hasTargets && progress < 0.5 ? '#fb7185' : '#2dd4bf' }}
            aria-label={hasTargets ? `${targetsMet} of ${targetedItems.length} configured operational targets met` : `${reportingItems} of ${operationalItems.length} operational metrics reporting`}
          >
            <div className="pulse-score-inner">
              <strong>{hasTargets ? `${targetsMet}/${targetedItems.length}` : `${reportingItems}/${operationalItems.length}`}</strong>
              <span>{hasTargets ? 'on target' : 'reporting'}</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">Performance pulse</span>
              {reportingPeriod ? <span className="text-[11px] font-medium text-surface-500">{reportingPeriod}</span> : null}
            </div>
            <h2 id="performance-pulse-title" className="max-w-xl text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
              {hasTargets
                ? `${targetsMet} of ${targetedItems.length} tracked targets are currently met.`
                : 'Your key bodyshop metrics are live and ready to explore.'}
            </h2>
          </div>
        </div>

        <BusinessSnapshot
          items={businessItems}
          selectedKpi={selectedKpi}
          onSelectKpi={onSelectKpi}
          dailyActual={dailyActual}
          dailyReference={dailyTarget}
          rollingMonths={rollingMonths}
        />

      </div>
    </section>
  );
}
