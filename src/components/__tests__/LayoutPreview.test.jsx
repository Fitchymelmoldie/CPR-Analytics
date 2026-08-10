import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LayoutPreview from '../../LayoutPreview';
import PerformancePulse from '../PerformancePulse';
import { DASHBOARD_KPI_DEFINITIONS } from '../../utils/dashboardKpis';

describe('Layout preview parity', () => {
  it('separates business results from operational KPI health', () => {
    render(<LayoutPreview />);

    expect(screen.getByTestId('dashboard-workspace')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Bodyshop' })).toHaveValue('1991.au');
    expect(screen.getByRole('combobox', { name: 'Reporting period' })).toHaveValue('2026-08');
    expect(screen.getByText('Operational KPI guide')).toBeInTheDocument();
    expect(screen.getByText('These 8 health KPIs contribute to the Performance Pulse.')).toBeInTheDocument();

    const businessSnapshot = screen.getByRole('region', { name: 'Business snapshot' });
    const totalSales = within(businessSnapshot).getByRole('button', { name: /View Total Sales trend/i });
    const paintSales = within(businessSnapshot).getByRole('button', { name: /View Paint Sales trend/i });
    expect(within(businessSnapshot).getByText('Business snapshot')).toBeInTheDocument();
    expect(within(businessSnapshot).queryByText(/Revenue activity/i)).not.toBeInTheDocument();
    expect(within(businessSnapshot).queryByText('Not scored')).not.toBeInTheDocument();
    expect(within(businessSnapshot).queryByText(/informational only/i)).not.toBeInTheDocument();
    expect(totalSales).not.toHaveAccessibleName(/not included in the Performance Pulse/i);
    expect(totalSales).toHaveAttribute('aria-pressed', 'true');
    expect(within(businessSnapshot).getByText('$1,080,528')).toBeInTheDocument();
    expect(within(businessSnapshot).getByText('Daily actual')).toBeInTheDocument();
    expect(within(businessSnapshot).getByText('Daily budget')).toBeInTheDocument();
    expect(screen.getByText('Metric detail')).toBeInTheDocument();
    expect(screen.getByText('3M rolling average')).toBeInTheDocument();
    expect(screen.getByText('Target status')).toBeInTheDocument();
    expect(screen.queryByText(/Movement compares the selected period/i)).not.toBeInTheDocument();
    expect(document.querySelector('.performance-insights')).toHaveClass('h-full');
    expect(document.querySelector('.performance-rhythm')).toHaveClass('h-full');
    expect(screen.queryByText('Strongest movement')).not.toBeInTheDocument();
    expect(screen.queryByText('Watch this period')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set target for Total Sales' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set target for Paint Sales' })).not.toBeInTheDocument();

    const operationalGrid = screen.getByRole('region', { name: 'Operational bodyshop KPIs' });
    expect(within(operationalGrid).getAllByRole('article')).toHaveLength(8);

    fireEvent.click(paintSales);
    expect(paintSales).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('heading', { name: 'Paint Sales' })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /View Paint Cost \/ Total Sales performance/i }));
    expect(screen.getByLabelText('Percentage scale')).toBeInTheDocument();
    expect(screen.getAllByText('Target 1.20%')).toHaveLength(2);
  });

  it('keeps target editing on genuine operational KPIs', () => {
    render(<LayoutPreview />);

    fireEvent.click(screen.getByRole('button', { name: /View Completed RO performance/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Set target for Completed RO' }));
    expect(screen.getByRole('heading', { name: 'Edit target for Completed RO' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update target' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Target 210', { selector: 'span' })).toBeInTheDocument();
  });

  it('uses only operational KPIs in the no-target reporting fallback', () => {
    const items = DASHBOARD_KPI_DEFINITIONS.map(definition => ({
      ...definition,
      value: 1,
      variance: 0,
      benchmark: undefined
    }));

    render(
      <PerformancePulse
        items={items}
        selectedKpi="Total Sales"
        onSelectKpi={() => {}}
        dailyActual={1}
        dailyTarget={0}
        rollingMonths={0}
        reportingPeriod="Aug 2026"
      />
    );

    expect(screen.getByText('8/8')).toBeInTheDocument();
    expect(screen.getByLabelText('8 of 8 operational metrics reporting')).toBeInTheDocument();
  });
});
