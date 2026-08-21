import { MAX_DASHBOARD_KPI_CARDS } from './dashboardKpis';

export function reorderMetricTitles(visibleTitles, sourceTitle, targetTitle, placement, maxCards = MAX_DASHBOARD_KPI_CARDS) {
  if (!sourceTitle || !targetTitle || sourceTitle === targetTitle) return visibleTitles;
  const sourceIsVisible = visibleTitles.includes(sourceTitle);
  if (!sourceIsVisible && visibleTitles.length >= maxCards) return visibleTitles;

  const next = visibleTitles.filter(title => title !== sourceTitle);
  const targetIndex = next.indexOf(targetTitle);
  if (targetIndex < 0) return visibleTitles;
  const insertionIndex = targetIndex + (placement === 'after' ? 1 : 0);
  next.splice(insertionIndex, 0, sourceTitle);
  return next.slice(0, maxCards);
}
