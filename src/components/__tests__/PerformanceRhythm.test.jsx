import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PerformanceRhythm from '../PerformanceRhythm';

describe('PerformanceRhythm missing-data handling', () => {
  it('leaves a visual gap instead of plotting a missing month at the chart floor', () => {
    render(
      <PerformanceRhythm
        data={{
          labels: ['Jan 2026', 'Feb 2026', 'Mar 2026'],
          format: 'number',
          datasets: [{ label: 'Completed RO', data: [180, null, 200] }]
        }}
        title="Completed RO"
        timeframe="3M"
        onTimeframeChange={vi.fn()}
        periodOptions={[]}
        customRange={{ from: '', to: '' }}
        onCustomRangeChange={vi.fn()}
        reportingPeriod="Mar 2026"
      />
    );

    expect(screen.getAllByTestId('trend-point')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Feb 2026:/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('trend-line').getAttribute('d').match(/M /g)).toHaveLength(2);
    expect(screen.getByTestId('active-graph-range')).toHaveTextContent('3 months · Jan 2026 to Mar 2026 · 2 with data');
  });

  it('uses clean axis ticks, an external directional goal key and continuous month hit areas', () => {
    render(
      <PerformanceRhythm
        data={{
          labels: ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'],
          format: 'number',
          datasets: [{ label: 'Completed RO', data: [150, 160, 180, 175, 190, 200] }]
        }}
        title="Completed RO"
        timeframe="6M"
        onTimeframeChange={vi.fn()}
        periodOptions={[]}
        customRange={{ from: '', to: '' }}
        onCustomRangeChange={vi.fn()}
        benchmark={190}
        benchmarkType="min"
        reportingPeriod="Jun 2026"
      />
    );

    expect(screen.getAllByTestId('y-axis-tick').map(tick => tick.getAttribute('data-axis-value'))).toEqual(['220', '200', '180', '160', '140']);
    expect(screen.getByLabelText('Target rule: Goal ≥ 190')).toBeInTheDocument();
    expect(screen.getByTestId('target-annotation').querySelector('rect')).not.toBeInTheDocument();

    const hitAreas = screen.getAllByTestId('point-hit-area').map(area => ({
      x: Number(area.getAttribute('x')),
      width: Number(area.getAttribute('width'))
    }));
    const xAxis = screen.getByTestId('x-axis-line');
    expect(hitAreas[0].x).toBe(Number(xAxis.getAttribute('x1')));
    hitAreas.slice(1).forEach((area, index) => {
      expect(hitAreas[index].x + hitAreas[index].width).toBeCloseTo(area.x, 5);
    });
    expect(hitAreas.at(-1).x + hitAreas.at(-1).width).toBe(Number(xAxis.getAttribute('x2')));

    fireEvent.click(screen.getByRole('button', { name: /Jan 2026: 150/i }));
    const readout = screen.getByTestId('selected-point-readout');
    expect(readout).toHaveAttribute('data-goal-status', 'outside');
    expect(within(readout).getByTestId('callout-status')).toHaveAttribute('fill', '#fcd34d');
    const callout = readout.querySelector('rect');
    expect(Number(callout.getAttribute('height'))).toBe(30);
    expect(Number(callout.getAttribute('width'))).toBeLessThanOrEqual(140);
    const calloutTop = Number(callout.getAttribute('y'));
    const calloutBottom = calloutTop + Number(callout.getAttribute('height'));
    const targetY = Number(screen.getByTestId('target-line').getAttribute('y1'));
    expect(targetY < calloutTop || targetY > calloutBottom).toBe(true);
  });

  it('previews values on hover and focus while preserving click-to-pin behavior', () => {
    render(
      <PerformanceRhythm
        data={{
          labels: ['May 2026', 'Jun 2026'],
          format: 'number',
          datasets: [{ label: 'Completed RO', data: [168, 176] }]
        }}
        title="Completed RO"
        timeframe="3M"
        onTimeframeChange={vi.fn()}
        periodOptions={[]}
        customRange={{ from: '', to: '' }}
        onCustomRangeChange={vi.fn()}
        benchmark={190}
        benchmarkType="min"
        reportingPeriod="Jun 2026"
      />
    );

    const mayPoint = screen.getByRole('button', { name: /May 2026: 168/i });
    const junePoint = screen.getByRole('button', { name: /Jun 2026: 176/i });
    screen.getAllByTestId('trend-point').forEach(point => {
      expect(point.querySelector('title')).not.toBeInTheDocument();
    });

    fireEvent.mouseEnter(junePoint);
    expect(screen.getByTestId('selected-point-readout')).toHaveAttribute('data-interaction', 'preview');
    expect(screen.getByTestId('selected-point-readout')).toHaveTextContent('Jun 2026');
    expect(junePoint).toHaveAttribute('aria-pressed', 'false');
    fireEvent.mouseLeave(junePoint);
    expect(screen.queryByTestId('selected-point-readout')).not.toBeInTheDocument();

    fireEvent.focus(mayPoint);
    expect(screen.getByTestId('selected-point-readout')).toHaveTextContent('May 2026');
    fireEvent.click(mayPoint);
    fireEvent.blur(mayPoint);
    expect(screen.getByTestId('selected-point-readout')).toHaveAttribute('data-interaction', 'pinned');
    expect(mayPoint).toHaveAttribute('aria-pressed', 'true');

    fireEvent.mouseEnter(junePoint);
    expect(screen.getByTestId('selected-point-readout')).toHaveTextContent('Jun 2026');
    fireEvent.mouseLeave(junePoint);
    expect(screen.getByTestId('selected-point-readout')).toHaveTextContent('May 2026');
  });
});
