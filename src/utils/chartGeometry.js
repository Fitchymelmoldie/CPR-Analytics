function roundForStep(value, step) {
  const decimals = Math.max(0, Math.min(8, -Math.floor(Math.log10(Math.abs(step || 1))) + 2));
  return Number(value.toFixed(decimals));
}

function niceStepAtLeast(value) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const fraction = value / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

export function buildNiceScale(values, { isPercentage = false, desiredTicks = 5 } = {}) {
  const finiteValues = values.filter(Number.isFinite);
  const rawMin = finiteValues.length ? Math.min(...finiteValues) : 0;
  const rawMax = finiteValues.length ? Math.max(...finiteValues) : 1;
  const magnitude = Math.max(Math.abs(rawMin), Math.abs(rawMax), 1);
  const minimumSpan = isPercentage ? 0.5 : Math.max(1, magnitude * 0.12);
  const span = Math.max(rawMax - rawMin, minimumSpan);
  const paddedMin = Math.max(0, rawMin - span * 0.12);
  const paddedMax = rawMax + span * 0.12;
  let step = niceStepAtLeast((paddedMax - paddedMin) / Math.max(2, desiredTicks - 1));
  let floor = Math.max(0, Math.floor(paddedMin / step) * step);
  let ceiling = Math.ceil(paddedMax / step) * step;
  let tickCount = Math.round((ceiling - floor) / step) + 1;

  if (tickCount > 6) {
    step = niceStepAtLeast(step * 1.01);
    floor = Math.max(0, Math.floor(paddedMin / step) * step);
    ceiling = Math.ceil(paddedMax / step) * step;
    tickCount = Math.round((ceiling - floor) / step) + 1;
  }

  if (ceiling <= floor) ceiling = floor + step;
  const ticks = Array.from({ length: Math.max(2, tickCount) }, (_, index) => roundForStep(ceiling - index * step, step))
    .filter(value => value >= floor - step * 0.001);

  return {
    floor: roundForStep(floor, step),
    ceiling: roundForStep(ceiling, step),
    step: roundForStep(step, step),
    ticks
  };
}

export function chooseCalloutPlacement({ pointY, calloutHeight, plotTop, plotBottom, targetY }) {
  const gap = 18;
  const inset = 4;
  const targetClearance = 8;
  const candidates = [
    { above: true, y: pointY - calloutHeight - gap },
    { above: false, y: pointY + gap }
  ].map(candidate => {
    const initiallyCrossesTarget = Number.isFinite(targetY) && targetY >= candidate.y - 5 && targetY <= candidate.y + calloutHeight + 5;
    const y = initiallyCrossesTarget
      ? candidate.above ? targetY - calloutHeight - targetClearance : targetY + targetClearance
      : candidate.y;
    return {
      ...candidate,
      y,
      fits: y >= plotTop + inset && y + calloutHeight <= plotBottom - inset,
      crossesTarget: Number.isFinite(targetY) && targetY >= y - 5 && targetY <= y + calloutHeight + 5,
      targetDistance: Number.isFinite(targetY)
      ? Math.min(Math.abs(targetY - y), Math.abs(targetY - (y + calloutHeight)))
      : Infinity
    };
  });

  const best = candidates
    .filter(candidate => candidate.fits)
    .sort((a, b) => Number(a.crossesTarget) - Number(b.crossesTarget) || b.targetDistance - a.targetDistance || Number(b.above) - Number(a.above))[0];

  if (best) return { above: best.above, y: best.y };
  const preferAbove = pointY > (plotTop + plotBottom) / 2;
  return {
    above: preferAbove,
    y: Math.max(plotTop + inset, Math.min(preferAbove ? pointY - calloutHeight - gap : pointY + gap, plotBottom - calloutHeight - inset))
  };
}

export function xAxisLabel(label, index, labels) {
  const [month = '', year = ''] = String(label || '').split(' ');
  const previousYear = index > 0 ? String(labels[index - 1] || '').split(' ')[1] : null;
  const showYear = index === 0 || (year && year !== previousYear);
  return showYear && year ? `${month} ’${year.slice(-2)}` : month;
}

export function shouldShowXAxisLabel(index, total, plotWidth) {
  if (total <= 1) return true;
  const maxLabels = Math.max(4, Math.floor(plotWidth / 58));
  const interval = Math.max(1, Math.ceil(total / maxLabels));
  return index === 0 || index === total - 1 || index % interval === 0;
}
