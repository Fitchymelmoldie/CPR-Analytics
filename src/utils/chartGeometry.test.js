import { describe, expect, it } from 'vitest';
import { buildNiceScale, chooseCalloutPlacement, shouldShowXAxisLabel, xAxisLabel } from './chartGeometry';

describe('chart geometry', () => {
  it('builds readable evenly spaced Y-axis ticks that contain data and target values', () => {
    expect(buildNiceScale([150, 200, 190])).toEqual({
      floor: 140,
      ceiling: 220,
      step: 20,
      ticks: [220, 200, 180, 160, 140]
    });
    expect(buildNiceScale([1.01, 1.25, 1.2], { isPercentage: true })).toEqual({
      floor: 0.9,
      ceiling: 1.4,
      step: 0.1,
      ticks: [1.4, 1.3, 1.2, 1.1, 1, 0.9]
    });
  });

  it('places a selected-month callout on the side that avoids the target line', () => {
    expect(chooseCalloutPlacement({ pointY: 180, calloutHeight: 50, plotTop: 36, plotBottom: 272, targetY: 150 })).toEqual({
      above: false,
      y: 198
    });
  });

  it('keeps month labels sparse while identifying year changes', () => {
    const labels = ['Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026'];
    expect(xAxisLabel(labels[0], 0, labels)).toBe('Nov ’25');
    expect(xAxisLabel(labels[1], 1, labels)).toBe('Dec');
    expect(xAxisLabel(labels[2], 2, labels)).toBe('Jan ’26');
    expect(shouldShowXAxisLabel(1, 12, 240)).toBe(false);
    expect(shouldShowXAxisLabel(11, 12, 240)).toBe(true);
  });
});
