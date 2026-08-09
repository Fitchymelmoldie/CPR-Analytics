import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LayoutPreview from '../../LayoutPreview';

describe('Layout preview parity', () => {
  it('uses the shared dashboard workspace and target editor', () => {
    render(<LayoutPreview />);

    expect(screen.getByTestId('dashboard-workspace')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Bodyshop' })).toHaveValue('1991.au');
    expect(screen.getByRole('combobox', { name: 'Reporting period' })).toHaveValue('2026-08');
    expect(screen.getByText('KPI card guide')).toBeInTheDocument();
    expect(screen.getByText('Each marker answers a different question.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Set target for Total Sales' }));
    expect(screen.getByRole('heading', { name: 'Edit target for Total Sales' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '1100000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update target' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Target $1,100,000')).toBeInTheDocument();
  });
});
