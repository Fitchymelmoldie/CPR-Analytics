import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LayoutPreview from '../../LayoutPreview';
import PerformancePulse from '../PerformancePulse';
import { DASHBOARD_KPI_DEFINITIONS } from '../../utils/dashboardKpis';
import { reorderMetricTitles } from '../../utils/dashboardLayout';

describe('Layout preview parity', () => {
  it('places a dragged KPI on the exact side of the chosen card', () => {
    const titles = ['Completed RO', 'Paint Cost / RO', 'Paint Cost / Total Sales', 'Booth Cycle Time'];

    expect(reorderMetricTitles(titles, 'Completed RO', 'Paint Cost / Total Sales', 'before')).toEqual([
      'Paint Cost / RO', 'Completed RO', 'Paint Cost / Total Sales', 'Booth Cycle Time'
    ]);
    expect(reorderMetricTitles(titles, 'Completed RO', 'Paint Cost / Total Sales', 'after')).toEqual([
      'Paint Cost / RO', 'Paint Cost / Total Sales', 'Completed RO', 'Booth Cycle Time'
    ]);
    expect(reorderMetricTitles(titles, 'Booth Cycle Time', 'Paint Cost / RO', 'before')).toEqual([
      'Completed RO', 'Booth Cycle Time', 'Paint Cost / RO', 'Paint Cost / Total Sales'
    ]);
  });

  it('shows the chosen insertion side and drops the KPI there', () => {
    render(<LayoutPreview />);
    fireEvent.click(screen.getByRole('button', { name: 'Show metric library' }));

    const grid = screen.getByRole('region', { name: 'Dashboard KPI cards' });
    const sourceHandle = within(grid).getByTitle('Drag Completed RO to a new position');
    const targetCard = within(grid).getByRole('button', { name: /View Paint Cost \/ Total Sales performance/i }).closest('article');
    targetCard.getBoundingClientRect = () => ({ left: 100, width: 200, right: 300, top: 0, bottom: 170, height: 170, x: 100, y: 0, toJSON: () => ({}) });
    const values = new Map();
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: (type, value) => values.set(type, value),
      getData: type => values.get(type) || ''
    };

    fireEvent.dragStart(sourceHandle, { dataTransfer });
    const dragOverEvent = new MouseEvent('dragover', { bubbles: true, clientX: 275 });
    Object.defineProperty(dragOverEvent, 'dataTransfer', { value: dataTransfer });
    fireEvent(targetCard, dragOverEvent);
    expect(targetCard.querySelector('.kpi-insertion-marker-after')).toBeInTheDocument();
    const dropEvent = new MouseEvent('drop', { bubbles: true, clientX: 275 });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
    fireEvent(targetCard, dropEvent);

    const titles = within(grid).getAllByRole('article').map(card => card.querySelector('button')?.getAttribute('aria-label')?.match(/^View (.*?) performance/)?.[1]);
    expect(titles.slice(0, 3)).toEqual(['Paint Cost / RO', 'Paint Cost / Total Sales', 'Completed RO']);
    expect(titles.indexOf('Completed RO')).toBe(titles.indexOf('Paint Cost / Total Sales') + 1);
  });

  it('provides exact touch-friendly ordering inside the metric library', () => {
    render(<LayoutPreview />);
    fireEvent.click(screen.getByRole('button', { name: 'Show metric library' }));
    const drawer = screen.getByRole('complementary', { name: 'Metric library' });
    const grid = screen.getByRole('region', { name: 'Dashboard KPI cards' });

    fireEvent.click(within(drawer).getByRole('button', { name: 'Move Completed RO later in dashboard order' }));
    let titles = within(grid).getAllByRole('article').map(card => card.querySelector('button')?.getAttribute('aria-label')?.match(/^View (.*?) performance/)?.[1]);
    expect(titles.slice(0, 2)).toEqual(['Paint Cost / RO', 'Completed RO']);

    fireEvent.click(within(drawer).getByRole('button', { name: 'Move Completed RO earlier in dashboard order' }));
    titles = within(grid).getAllByRole('article').map(card => card.querySelector('button')?.getAttribute('aria-label')?.match(/^View (.*?) performance/)?.[1]);
    expect(titles.slice(0, 2)).toEqual(['Completed RO', 'Paint Cost / RO']);
  });
  it('uses the Codex-native shell across every preview workspace', async () => {
    const { container } = render(<LayoutPreview />);
    expect(container.querySelector('.cpr-codex-shell')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Gamified Leaderboards' })).not.toBeInTheDocument();

    for (const page of ['Shop Profile', 'Data & Imports', 'Customer Management']) {
      fireEvent.click(screen.getByRole('button', { name: page }));
      expect(screen.getAllByRole('heading', { name: page }).length).toBeGreaterThan(0);
      expect(container.querySelector('.cpr-codex-shell')).toBeInTheDocument();
    }
  });
  it('separates business results from operational KPI health', () => {
    render(<LayoutPreview />);

    expect(screen.getByTestId('dashboard-workspace')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Bodyshop' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Reporting period' })).toHaveTextContent('Aug 2026');
    const operationalKpiInfo = screen.getByRole('button', { name: 'Operational KPI guide' });
    expect(operationalKpiInfo).toBeInTheDocument();
    expect(operationalKpiInfo).toHaveAttribute('data-context-info-button', 'true');
    expect(operationalKpiInfo).toHaveClass('h-8', 'w-8');
    expect(operationalKpiInfo.querySelector('[data-context-info-icon="true"]')).toBeInTheDocument();
    expect(operationalKpiInfo.closest('.group').nextElementSibling).toHaveTextContent('Export');
    expect(operationalKpiInfo.closest('header')).toHaveClass('z-[70]');
    const operationalKpiTooltip = screen.getByRole('tooltip', { name: 'Operational KPI guide details' });
    expect(operationalKpiTooltip).toHaveClass('invisible');
    expect(operationalKpiTooltip).toHaveClass('bg-[#171d26]', 'top-full', 'z-[70]', 'opacity-100', 'mt-3');
    expect(operationalKpiTooltip).not.toHaveClass('backdrop-blur-xl');
    fireEvent.focus(operationalKpiInfo);
    expect(operationalKpiTooltip).toHaveClass('visible');
    expect(operationalKpiTooltip).toHaveTextContent('These 8 health KPIs contribute to the Performance Pulse.');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(operationalKpiTooltip).toHaveClass('invisible');
    fireEvent.mouseEnter(operationalKpiInfo.closest('.group'));
    expect(operationalKpiTooltip).toHaveClass('visible');
    fireEvent.mouseLeave(operationalKpiInfo.closest('.group'));
    expect(operationalKpiTooltip).toHaveClass('invisible');

    const businessSnapshot = screen.getByRole('region', { name: 'Business snapshot' });
    const totalSales = within(businessSnapshot).getByRole('button', { name: /View Total Sales trend/i });
    const paintSales = within(businessSnapshot).getByRole('button', { name: /View Paint Sales trend/i });
    expect(within(businessSnapshot).getByText('Business snapshot')).toBeInTheDocument();
    expect(businessSnapshot).not.toHaveClass('rounded-[24px]');
    expect(totalSales).not.toHaveClass('rounded-2xl');
    expect(paintSales).not.toHaveClass('rounded-2xl');
    expect(businessSnapshot.querySelector('.business-pace')).not.toHaveClass('rounded-2xl');
    expect(within(businessSnapshot).queryByText(/Revenue activity/i)).not.toBeInTheDocument();
    expect(within(businessSnapshot).queryByText('Not scored')).not.toBeInTheDocument();
    expect(within(businessSnapshot).queryByText(/informational only/i)).not.toBeInTheDocument();
    expect(totalSales).not.toHaveAccessibleName(/not included in the Performance Pulse/i);
    expect(totalSales).toHaveAttribute('aria-pressed', 'true');
    expect(within(businessSnapshot).getByText('$1,080,528')).toBeInTheDocument();
    expect(within(businessSnapshot).getByText('Daily actual')).toBeInTheDocument();
    expect(within(businessSnapshot).getByText('Daily budget')).toBeInTheDocument();
    const dailyActualInfo = within(businessSnapshot).getByRole('button', { name: 'How daily actual is calculated' });
    const dailyBudgetInfo = within(businessSnapshot).getByRole('button', { name: 'How daily budget is calculated' });
    [dailyActualInfo, dailyBudgetInfo].forEach((button) => {
      expect(button).toHaveAttribute('data-context-info-button', 'true');
      expect(button).toHaveClass('h-8', 'w-8');
      expect(button.querySelector('[data-context-info-icon="true"]')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
    expect(dailyActualInfo.closest('.group').previousElementSibling).toHaveTextContent('Daily actual');
    expect(dailyBudgetInfo.closest('.group').previousElementSibling).toHaveTextContent('Daily budget');
    expect(within(businessSnapshot).queryByRole('tooltip', { name: /Daily (actual|budget) calculation details/ })).not.toBeInTheDocument();

    fireEvent.mouseEnter(dailyActualInfo.closest('.group'));
    expect(dailyActualInfo).toHaveAttribute('aria-expanded', 'true');
    expect(dailyBudgetInfo).toHaveAttribute('aria-expanded', 'false');
    const actualExplanation = within(businessSnapshot).getByRole('tooltip', { name: 'Daily actual calculation details' });
    expect(actualExplanation).toHaveClass('absolute', 'left-0', 'rounded-xl', 'bg-[#17191c]');
    expect(actualExplanation).toHaveTextContent('Estimated working-day sales pace');
    expect(actualExplanation).toHaveTextContent('average monthly Paint Sales ÷ 19.33 working days');
    expect(within(businessSnapshot).queryByRole('tooltip', { name: 'Daily budget calculation details' })).not.toBeInTheDocument();
    fireEvent.mouseLeave(dailyActualInfo.closest('.group'));

    fireEvent.mouseEnter(dailyBudgetInfo.closest('.group'));
    expect(dailyActualInfo).toHaveAttribute('aria-expanded', 'false');
    expect(dailyBudgetInfo).toHaveAttribute('aria-expanded', 'true');
    const budgetExplanation = within(businessSnapshot).getByRole('tooltip', { name: 'Daily budget calculation details' });
    expect(budgetExplanation).toHaveClass('absolute', 'right-0', 'rounded-xl', 'bg-[#17191c]');
    expect(budgetExplanation).toHaveTextContent('Planning benchmark for the working-day sales pace');
    expect(budgetExplanation).toHaveTextContent('average monthly Paint Labour Costs × 3.3 ÷ 19.33 working days');
    expect(within(businessSnapshot).queryByRole('tooltip', { name: 'Daily actual calculation details' })).not.toBeInTheDocument();
    fireEvent.mouseLeave(dailyBudgetInfo.closest('.group'));

    fireEvent.click(dailyActualInfo);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(within(businessSnapshot).queryByRole('tooltip', { name: 'Daily actual calculation details' })).not.toBeInTheDocument();
    fireEvent.click(dailyBudgetInfo);
    fireEvent.mouseDown(document.body);
    expect(dailyBudgetInfo).toHaveAttribute('aria-expanded', 'false');
    expect(within(businessSnapshot).queryByRole('tooltip', { name: 'Daily budget calculation details' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Metric detail')).not.toBeInTheDocument();
    expect(screen.queryByText(/Movement compares the selected period/i)).not.toBeInTheDocument();
    expect(document.querySelector('.performance-insights')).not.toBeInTheDocument();
    expect(document.querySelector('.performance-rhythm')).not.toBeInTheDocument();
    expect(screen.queryByText('Strongest movement')).not.toBeInTheDocument();
    expect(screen.queryByText('Watch this period')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set target for Total Sales' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set target for Paint Sales' })).not.toBeInTheDocument();

    const operationalGrid = screen.getByRole('region', { name: 'Dashboard KPI cards' });
    expect(within(operationalGrid).getAllByRole('article')).toHaveLength(8);

    fireEvent.click(paintSales);
    expect(paintSales).toHaveAttribute('aria-pressed', 'true');
    const paintStory = screen.getByRole('dialog', { name: 'Paint Sales' });
    expect(within(paintStory).getByText('Performance story')).toBeInTheDocument();
    expect(within(paintStory).getByText('Metric detail')).toBeInTheDocument();
    expect(within(paintStory).getByText('3M rolling average')).toBeInTheDocument();
    expect(within(paintStory).getByText('Pulse treatment')).toBeInTheDocument();
    fireEvent.click(within(paintStory).getByRole('button', { name: 'Close performance story' }));

    fireEvent.click(screen.getByRole('button', { name: /View Paint Cost \/ Total Sales performance/i }));
    const percentageStory = screen.getByRole('dialog', { name: 'Paint Cost / Total Sales' });
    expect(percentageStory).toHaveClass('max-w-[1280px]');
    expect(screen.getByLabelText('Percentage scale')).toBeInTheDocument();
    const percentageChart = within(percentageStory).getByRole('img', { name: /Paint Cost \/ Total Sales line trend/i });
    expect(percentageChart).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
    expect(percentageChart).toHaveAttribute('data-responsive-plot', 'true');
    expect(within(percentageChart).getByTestId('trend-line')).not.toHaveAttribute('pathLength');
    expect(within(percentageChart).getByTestId('trend-line').getAttribute('d')).toContain(' C ');
    expect(within(percentageStory).getByTestId('target-annotation')).toBeInTheDocument();
    expect(within(percentageStory).getByText('Goal ≤ 1.20%')).toBeInTheDocument();
  });

  it('keeps target editing on genuine operational KPIs', () => {
    render(<LayoutPreview />);

    fireEvent.click(screen.getByRole('button', { name: 'Set target for Completed RO' }));
    expect(screen.getByRole('heading', { name: 'Edit target for Completed RO' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '210' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update target' }));

    expect(screen.queryByRole('heading', { name: 'Edit target for Completed RO' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /View Completed RO performance/i }));
    expect(screen.getByRole('dialog', { name: 'Completed RO' })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog', { name: 'Completed RO' })).getByText('Goal ≥ 210')).toBeInTheDocument();
  });

  it('previews the customer workspace without exposing administration controls', () => {
    render(<LayoutPreview />);

    fireEvent.click(screen.getByRole('button', { name: 'Customer Management' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open dashboard' }));

    expect(screen.getByRole('heading', { name: 'Welcome, Boyle Smash Repairs' })).toBeInTheDocument();
    expect(screen.getByText(/Viewing Boyle Smash Repairs as the customer sees it/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return to Admin' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Data & Imports' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Customer Management' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Return to Admin' }));
    expect((screen.getAllByRole('heading', { name: 'Customer Management' })).length).toBeGreaterThan(0);
  });

  it('filters the trend window and pins a selected month value', () => {
    render(<LayoutPreview />);

    fireEvent.click(screen.getByRole('button', { name: /View Paint Cost \/ RO performance/i }));
    const story = screen.getByRole('dialog', { name: 'Paint Cost / RO' });
    expect(within(story).getByText(/Hover to preview · select to pin/i)).toBeInTheDocument();
    expect(within(story).getAllByTestId('trend-point')).toHaveLength(8);
    expect(within(story).getAllByTestId('trend-label').map(label => label.textContent)).toEqual(['Jan ’26', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']);
    expect(within(story).getByRole('button', { name: '12M' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(story).queryByRole('button', { name: 'YTD' })).not.toBeInTheDocument();
    expect(within(story).queryByRole('button', { name: 'ALL' })).not.toBeInTheDocument();

    fireEvent.click(within(story).getByRole('button', { name: '3M' }));
    expect(within(story).getAllByTestId('trend-point')).toHaveLength(3);
    expect(within(story).getAllByTestId('trend-label').map(label => label.textContent)).toEqual(['Jun ’26', 'Jul', 'Aug']);
    expect(within(story).queryByRole('button', { name: /May 2026:/i })).not.toBeInTheDocument();

    const julyPoint = within(story).getByRole('button', { name: /Jul 2026: \$55.*select to pin this month's value/i });
    fireEvent.click(julyPoint);
    expect(julyPoint).toHaveAttribute('aria-pressed', 'true');
    expect(within(story).getByTestId('selected-point-readout')).toHaveTextContent('Jul 2026');
    expect(within(story).getByTestId('selected-point-readout')).toHaveTextContent('$55');

    fireEvent.click(within(story).getByRole('button', { name: '6M' }));
    expect(within(story).getAllByTestId('trend-point')).toHaveLength(6);
    expect(within(story).getAllByTestId('trend-label')).toHaveLength(6);

    fireEvent.click(within(story).getByRole('button', { name: 'FYTD' }));
    expect(within(story).getAllByTestId('trend-point')).toHaveLength(2);
    expect(within(story).getAllByTestId('trend-label')).toHaveLength(2);
    expect(within(story).getByRole('button', { name: /Jul 2026:/i })).toBeInTheDocument();

    fireEvent.click(within(story).getByRole('button', { name: 'Custom' }));
    const customRange = within(story).getByRole('dialog', { name: 'Custom graph range' });
    fireEvent.change(within(customRange).getByLabelText('From month'), { target: { value: '2026-02' } });
    fireEvent.change(within(customRange).getByLabelText('To month'), { target: { value: '2026-05' } });
    fireEvent.click(within(customRange).getByRole('button', { name: 'Apply' }));

    expect(within(story).getByRole('button', { name: 'Custom' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(story).getAllByTestId('trend-point')).toHaveLength(4);
    expect(within(story).getAllByTestId('trend-label')).toHaveLength(4);
    expect(within(story).getByTestId('active-graph-range')).toHaveTextContent('4 months · Feb 2026 to May 2026 · Custom Feb 2026 to May 2026');

    fireEvent.click(within(story).getByRole('button', { name: 'Close performance story' }));
    fireEvent.click(screen.getByRole('combobox', { name: 'Reporting period' }));
    fireEvent.click(screen.getByRole('option', { name: 'Jan 2026' }));
    fireEvent.click(screen.getByRole('button', { name: /View Paint Cost \/ RO performance/i }));

    const resetStory = screen.getByRole('dialog', { name: 'Paint Cost / RO' });
    expect(within(resetStory).getByRole('button', { name: '12M' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(resetStory).getAllByTestId('trend-point')).toHaveLength(1);
    expect(within(resetStory).getByTestId('active-graph-range')).toHaveTextContent('1 month · Jan 2026');
    expect(within(resetStory).queryByText(/Custom Feb 2026 to May 2026/i)).not.toBeInTheDocument();
  });

  it('opens the real consultant review surface in the protected preview', () => {
    render(<LayoutPreview />);

    fireEvent.click(screen.getByRole('button', { name: 'Consultant Reviews' }));
    const review = screen.getByRole('dialog', { name: 'Consultant Review' });
    expect(within(review).getByLabelText('Consultant review period')).toHaveValue('2026-08');
    expect(within(review).getByLabelText('Trend Analysis').value).toMatch(/Paint sales and completed repair orders/i);
    expect(within(review).getByRole('tab', { name: /Historical Log/i })).toBeInTheDocument();
  });

  it('adds imported metrics through the right-side library without changing the Pulse', () => {
    render(<LayoutPreview />);
    const pulseLabel = screen.getByLabelText(/configured operational targets met/i).getAttribute('aria-label');
    const topBarMetricToggle = screen.getByRole('button', { name: 'Show metric library' });
    expect(topBarMetricToggle.closest('header')).not.toBeNull();

    fireEvent.click(topBarMetricToggle);
    expect(topBarMetricToggle).toHaveAccessibleName('Hide metric library');
    expect(screen.getByRole('complementary', { name: 'Metric library' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide workspace' })).toBeInTheDocument();
    expect(document.querySelector('.app-main-shell')).toHaveClass('metrics-panel-open');
    fireEvent.click(screen.getByRole('button', { name: 'Add Panel Sales to dashboard' }));

    const grid = screen.getByRole('region', { name: 'Dashboard KPI cards' });
    expect(within(grid).getAllByRole('article')).toHaveLength(9);
    expect(within(grid).getByText('Panel Sales')).toBeInTheDocument();

    const transferValues = new Map();
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: (type, value) => transferValues.set(type, value),
      getData: (type) => transferValues.get(type) || ''
    };
    const partSalesLibraryItem = screen.getByRole('button', { name: 'Add Part Sales to dashboard' }).closest('article');
    fireEvent.dragStart(partSalesLibraryItem, { dataTransfer });
    fireEvent.drop(grid, { dataTransfer });
    expect(within(grid).getAllByRole('article')).toHaveLength(10);
    expect(within(grid).getByText('Part Sales')).toBeInTheDocument();
    expect(screen.getByLabelText(pulseLabel)).toBeInTheDocument();

    fireEvent.click(topBarMetricToggle);
    expect(screen.queryByRole('complementary', { name: 'Metric library' })).not.toBeInTheDocument();
    expect(document.querySelector('.app-main-shell')).not.toHaveClass('metrics-panel-open');
    expect(topBarMetricToggle).toHaveAccessibleName('Show metric library');
    fireEvent.click(topBarMetricToggle);
    expect(topBarMetricToggle).toHaveAccessibleName('Hide metric library');
    expect(screen.getByRole('complementary', { name: 'Metric library' })).toBeInTheDocument();
  });

  it('anchors the performance story to the selected reporting month', () => {
    render(<LayoutPreview />);

    expect(screen.getByRole('button', { name: /View Completed RO performance.*Current result: 200/i })).toBeInTheDocument();
    expect(screen.getByText('$1,080,528')).toBeInTheDocument();
    const periodSelect = screen.getByRole('combobox', { name: 'Reporting period' });
    fireEvent.click(periodSelect);
    fireEvent.click(screen.getByRole('option', { name: 'May 2026' }));
    expect(screen.getByRole('button', { name: /View Completed RO performance.*Current result: 168/i })).toBeInTheDocument();
    expect(screen.getByText('$907,644')).toBeInTheDocument();
    expect(screen.getByText('$7,651')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /View Completed RO performance/i }));

    const story = screen.getByRole('dialog', { name: 'Completed RO' });
    expect(within(story).getAllByText('May 2026').length).toBeGreaterThan(0);
    expect(within(story).getByRole('img', { name: /Completed RO line trend ending May 2026/i })).toBeInTheDocument();
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
