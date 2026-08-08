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
  });
});
