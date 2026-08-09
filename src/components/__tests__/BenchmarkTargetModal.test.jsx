import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BenchmarkTargetModal from '../BenchmarkTargetModal';

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    metric: 'Paint Cost / Total Sales',
    companyName: 'Test Bodyshop',
    currentTarget: undefined,
    benchmarkType: 'max',
    format: 'percent',
    isSaving: false,
    error: null,
    onSave: vi.fn(),
    onRemove: vi.fn(),
    onClose: vi.fn(),
    ...overrides
  };
  render(<BenchmarkTargetModal {...props} />);
  return props;
}

describe('BenchmarkTargetModal', () => {
  it('accepts a human-readable percentage and converts it for KPI calculations', () => {
    const props = renderModal();
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '1.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create target' }));
    expect(props.onSave).toHaveBeenCalledWith(0.015);
  });

  it('shows validation in the dialog instead of opening a browser alert', () => {
    const props = renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Create target' }));
    expect(screen.getByText('Enter a valid target of zero or more.')).toBeInTheDocument();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('requires a clear second step before removing an existing target', () => {
    const props = renderModal({ currentTarget: 0.012 });
    expect(screen.getByLabelText('Target value')).toHaveValue(1.2);
    fireEvent.click(screen.getByRole('button', { name: 'Remove target' }));
    expect(props.onRemove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm removal' }));
    expect(props.onRemove).toHaveBeenCalledTimes(1);
  });

  it('closes with Escape when no save is in progress', () => {
    const props = renderModal();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
