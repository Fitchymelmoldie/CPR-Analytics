import React from 'react';
import { fmt } from '../utils/metrics';
import { directionalVariance, targetIsMet } from '../utils/dashboardKpis';

function displayValue(item) {
  if (!item) return '—';
  return fmt(item.value, item.format);
}

export default function PerformanceInsights({ items, selectedTitle }) {
  const withMovement = items
    .map(item => ({ ...item, movement: directionalVariance(item) }))
    .filter(item => item.movement !== null);
  const strongest = withMovement.reduce((best, item) => !best || item.movement > best.movement ? item : best, null);
  const weakest = withMovement.reduce((worst, item) => !worst || item.movement < worst.movement ? item : worst, null);
  const missedTargets = items.filter(item => item.benchmark !== undefined && item.benchmark !== null && !targetIsMet(item));
  const selected = items.find(item => item.title === selectedTitle) || items[0];
  const hasPositiveMovement = strongest?.movement > 0;

  const insights = [
    {
      tone: 'positive', eyebrow: 'Momentum', title: hasPositiveMovement ? strongest.title : (strongest ? 'No positive movement' : 'Building comparison'),
      detail: hasPositiveMovement ? `${strongest.movement.toFixed(1)}% favourable movement` : (strongest ? 'No KPI improved versus the prior period.' : 'A second reporting period will reveal movement.')
    },
    {
      tone: 'attention', eyebrow: 'Attention', title: missedTargets[0]?.title || (weakest?.movement < 0 ? weakest.title : 'No target alert'),
      detail: missedTargets.length ? `${missedTargets.length} configured target${missedTargets.length === 1 ? '' : 's'} currently need attention.` : (weakest?.movement < 0 ? `${Math.abs(weakest.movement).toFixed(1)}% unfavourable movement` : 'Configured targets are currently on track.')
    },
    {
      tone: 'selected', eyebrow: 'Selected metric', title: selected?.title || 'Choose a KPI',
      detail: selected ? `${displayValue(selected)} · ${selected.description || 'Select a tile to explore its rhythm.'}` : 'Choose a KPI to explore its history.'
    }
  ];

  return (
    <aside className="performance-insights rounded-[28px] p-5 sm:p-6" aria-labelledby="performance-insights-title">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-500">This period</span>
        <h3 id="performance-insights-title" className="mt-2 text-xl font-bold tracking-tight text-white">What changed</h3>
      </div>
      <div className="mt-5 space-y-2.5">
        {insights.map((insight, index) => (
          <div key={insight.eyebrow} className={`insight-row insight-row-${insight.tone}`} style={{ animationDelay: `${index * 80 + 120}ms` }}>
            <span>{insight.eyebrow}</span>
            <strong>{insight.title}</strong>
            <p>{insight.detail}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
