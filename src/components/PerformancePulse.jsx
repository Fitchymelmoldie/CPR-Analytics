import React from 'react';
import { directionalVariance, targetIsMet } from '../utils/dashboardKpis';

function compactCurrency(value) {
  return '$' + Number(value || 0).toLocaleString('en-AU', { maximumFractionDigits: 0 });
}

export default function PerformancePulse({ items, dailyActual, dailyTarget, rollingMonths, reportingPeriod }) {
  const targetedItems = items.filter(item => item.benchmark !== undefined && item.benchmark !== null);
  const targetsMet = targetedItems.filter(targetIsMet).length;
  const reportingItems = items.filter(item => Number.isFinite(item.value)).length;
  const hasTargets = targetedItems.length > 0;
  const progress = hasTargets
    ? targetsMet / targetedItems.length
    : reportingItems / Math.max(items.length, 1);
  const progressDegrees = Math.max(0, Math.min(360, progress * 360));

  const movingItems = items
    .map(item => ({ ...item, movement: directionalVariance(item) }))
    .filter(item => item.movement !== null);
  const strongest = movingItems.reduce((best, item) => !best || item.movement > best.movement ? item : best, null);
  const attention = movingItems.reduce((worst, item) => !worst || item.movement < worst.movement ? item : worst, null);
  const hasPositiveMovement = strongest?.movement > 0;
  const paceReady = rollingMonths >= 3 && dailyTarget > 0;
  const paceIsAhead = paceReady && dailyActual >= dailyTarget;

  return (
    <section className="performance-pulse relative mb-5 overflow-hidden rounded-[30px] px-5 py-6 sm:px-7 lg:px-8" aria-labelledby="performance-pulse-title">
      <div className="pulse-ambient pulse-ambient-one" />
      <div className="pulse-ambient pulse-ambient-two" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(240px,.75fr)] lg:items-center xl:grid-cols-[minmax(360px,1.25fr)_minmax(300px,.85fr)_minmax(280px,.8fr)]">
        <div className="flex items-center gap-5 sm:gap-7">
          <div
            className="pulse-score-ring shrink-0"
            style={{ '--ring-target': `${progressDegrees}deg`, '--ring-colour': hasTargets && progress < 0.5 ? '#fb7185' : '#2dd4bf' }}
            aria-label={hasTargets ? `${targetsMet} of ${targetedItems.length} configured targets met` : `${reportingItems} of ${items.length} metrics reporting`}
          >
            <div className="pulse-score-inner">
              <strong>{hasTargets ? `${targetsMet}/${targetedItems.length}` : `${reportingItems}/${items.length}`}</strong>
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
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-surface-400">
              {hasTargets
                ? 'A concise view of target coverage, daily pace and the movements that deserve attention.'
                : 'Add KPI targets to turn this pulse into a live benchmark score for the selected bodyshop.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="pulse-stat group">
            <p>Daily actual</p>
            <strong className={paceReady ? (paceIsAhead ? 'text-success-400' : 'text-rose-400') : 'text-white'}>{compactCurrency(dailyActual)}</strong>
            <span>rolling quarterly pace</span>
          </div>
          <div className="pulse-stat group">
            <p>3.3x target</p>
            <strong>{paceReady ? compactCurrency(dailyTarget) : 'Building'}</strong>
            <span>{paceReady ? (paceIsAhead ? 'pace is ahead' : 'pace needs attention') : 'requires 3 months'}</span>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:col-span-2 xl:col-span-1 xl:grid-cols-1">
          <div className="pulse-signal pulse-signal-positive">
            <span>Strongest movement</span>
            <div><strong>{hasPositiveMovement ? strongest.title : (strongest ? 'No positive movement' : 'Awaiting comparison')}</strong>{hasPositiveMovement ? <em>+{strongest.movement.toFixed(1)}%</em> : null}</div>
          </div>
          <div className="pulse-signal pulse-signal-attention">
            <span>Watch this period</span>
            <div><strong>{attention?.movement < 0 ? attention.title : 'No negative movement'}</strong>{attention?.movement < 0 ? <em>{attention.movement.toFixed(1)}%</em> : null}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
