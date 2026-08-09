import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KpiCard from '../KpiCard';

describe('KpiCard', () => {
  it('renders Return on Paint Labour as a rounded whole-number percentage', () => {
    render(
      <KpiCard
        title="Return on Paint Labour"
        value={5.35}
        format="percentWhole"
        iconPath=""
      />
    );

    expect(screen.getByText('535%')).toBeInTheDocument();
    expect(screen.getByText('No target set')).toBeInTheDocument();
  });

  it('shows a clear target result and gap for a higher-is-better KPI', () => {
    render(
      <KpiCard
        title="Total Sales"
        value={1080528}
        format="currency"
        variance={8.4}
        benchmark={1000000}
        benchmarkType="min"
        rank={{ rank: 1 }}
        cohortSize={8}
        iconPath=""
      />
    );

    expect(screen.getByText('Target met')).toBeInTheDocument();
    expect(screen.getByText('Ahead by $80,528')).toBeInTheDocument();
    expect(screen.getByText('1st / 8')).toHaveAttribute('title', 'Ranked 1st of 8');
    expect(screen.getByText('8.4%').closest('span')).toHaveClass('text-success-400');
    expect(screen.getByRole('button', { name: /Current result: \$1,080,528.*Target met.*Ranked 1st of 8/i })).toBeInTheDocument();
  });

  it('separates favourable movement from a missed lower-is-better target', () => {
    render(
      <KpiCard
        title="Booth Cycle Time"
        value={1.8}
        format="number"
        variance={-3.2}
        benchmark={1.7}
        benchmarkType="max"
        iconPath=""
      />
    );

    expect(screen.getByText('Target missed')).toBeInTheDocument();
    expect(screen.getByText('Over by 0.1')).toBeInTheDocument();
    expect(screen.getByText('3.2%').closest('span')).toHaveClass('text-success-400');
  });

  it('formats percentage target gaps as percentage points', () => {
    render(
      <KpiCard
        title="Liquid Cost to Refinish"
        value={0.245}
        format="percent"
        variance={2.8}
        benchmark={0.27}
        benchmarkType="max"
        iconPath=""
      />
    );

    expect(screen.getByText('Target met')).toBeInTheDocument();
    expect(screen.getByText('Under by 2.50 pts')).toBeInTheDocument();
    expect(screen.getByText('2.8%').closest('span')).toHaveClass('text-rose-400');
  });
});
