import React from 'react';
import BusinessSnapshot from './BusinessSnapshot';

export default function PerformancePulse({
  items,
  selectedKpi,
  onSelectKpi,
  dailyActual,
  dailyTarget,
  rollingMonths,
  reportingPeriod,
  dataStatusTone = 'current'
}) {
  const operationalItems = items.filter(item => item.pulseEligible === true);
  const businessItems = items.filter(item => item.category === 'business');
  const reportingItems = operationalItems.filter(item => Number.isFinite(item.value)).length;
  const progress = reportingItems / Math.max(operationalItems.length, 1);
  const progressDegrees = Math.max(0, Math.min(360, progress * 360));
  const isComplete = reportingItems === operationalItems.length;
  const periodStatus = dataStatusTone === 'historical' ? 'Historical period' : dataStatusTone === 'empty' ? 'No data' : 'Latest period';

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
            style={{ '--ring-target': `${progressDegrees}deg`, '--ring-colour': isComplete ? '#2dd4bf' : '#fbbf24' }}
            aria-label={`${reportingItems} of ${operationalItems.length} operational KPIs reported`}
          >
            <div className="pulse-score-inner">
              <strong>{`${reportingItems}/${operationalItems.length}`}</strong>
              <span>reported</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">Monthly snapshot</span>
              <span className="text-[11px] font-medium text-surface-500">{periodStatus}</span>
            </div>
            <h2 id="performance-pulse-title" className="max-w-xl text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
              {reportingPeriod ? `${reportingPeriod} at a glance` : 'Monthly results at a glance'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-surface-400">Open any KPI to review its 3M, 6M and 12M trend.</p>
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
