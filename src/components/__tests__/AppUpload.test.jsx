import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App';
import * as authProvider from '../AuthProvider';
import * as dbServices from '../../services/db';

// Mock the dependencies
vi.mock('../AuthProvider', () => ({
  useAuth: vi.fn(),
  default: ({ children }) => <>{children}</>
}));

vi.mock('../../services/db', () => ({
  ANALYTICS_INPUT_FIELDS: [
    { key: 'Completed RO', label: 'Completed RO', format: 'number' },
    { key: 'Total Sales', label: 'Total Sales', format: 'currency' }
  ],
  uploadAnalytics: vi.fn(),
  upsertAnalyticsValue: vi.fn(),
  getAnalytics: vi.fn(),
  getCompanies: vi.fn(),
  getConsultantReviews: vi.fn(),
  saveConsultantReview: vi.fn(),
  getLeaderboardGroups: vi.fn(),
  createLeaderboardGroup: vi.fn(),
  deleteLeaderboardGroup: vi.fn(),
  getBenchmarks: vi.fn(),
  upsertBenchmark: vi.fn(),
  deleteBenchmark: vi.fn(),
  getDashboardKpiLayout: vi.fn(),
  upsertDashboardKpiLayout: vi.fn(),
  updateShopProfile: vi.fn(),
  deleteAnalyticsPeriod: vi.fn()
}));

// Mock ChartCanvas since ChartJS and ResizeObserver can be tricky in JSDOM
vi.mock('../../components/ChartCanvas', () => ({
  default: () => <div data-testid="mock-chart-canvas"></div>
}));

describe('Upload Pipeline Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: Mock Admin User with no data initially
    authProvider.useAuth.mockReturnValue({
      user: { id: 'test-user', email: 'admin@example.com' },
      profile: { role: 'ADMIN', company_id: 'CORP' },
      loading: false,
      signOut: vi.fn()
    });
    
    dbServices.getAnalytics.mockResolvedValue([]); // Empty DB initially
    dbServices.getCompanies.mockResolvedValue([]);
    dbServices.getConsultantReviews.mockResolvedValue([]);
    dbServices.getLeaderboardGroups.mockResolvedValue([]);
    dbServices.getBenchmarks.mockResolvedValue([]);
    dbServices.getDashboardKpiLayout.mockResolvedValue(null);
  });

  it('renders upload zone for Admin when there is no data', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));
    expect(await screen.findByRole('heading', { name: /Import CSV spreadsheet/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Quick KPI entry/i })).toBeInTheDocument();
  });

  it('shows an in-app error when required CSV columns are missing', async () => {
    const { container } = render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));
    await screen.findByRole('heading', { name: /Import CSV spreadsheet/i });
    
    const fileInput = container.querySelector('#file-input');
    
    // Create a mock invalid CSV (missing Total Sales)
    const csvContent = 'Company Id,Company Name,Year,Month,Paint Sales,Paint Labour Costs,Completed RO\n123,Test Co,2025,1,1000,500,10';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(await screen.findByRole('alert')).toHaveTextContent('Missing required columns');
    
    // Should not call upload
    expect(dbServices.uploadAnalytics).not.toHaveBeenCalled();
  });

  it('successfully uploads valid CSV and refreshes data', async () => {
    dbServices.uploadAnalytics.mockResolvedValue(true);
    
    // When getAnalytics is called again after upload, return the new data
    const mockData = [{
      'Company Id': '123',
      'Company Name': 'Test Co',
      'Year': '2025',
      'Month': '1',
      'Total Sales': '5000',
      'Paint Sales': '1000',
      'Paint Labour Costs': '500',
      'Completed RO': '10'
    }];
    
    dbServices.getAnalytics.mockImplementation(() => {
      // If it's called after upload (second call essentially, or based on state)
      if (dbServices.uploadAnalytics.mock.calls.length > 0) {
        return Promise.resolve(mockData);
      }
      return Promise.resolve([]);
    });

    const { container } = render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));
    await screen.findByRole('heading', { name: /Import CSV spreadsheet/i });
    
    const fileInput = container.querySelector('#file-input');
    
    const csvContent = 'Company Id,Company Name,Year,Month,Total Sales,Paint Sales,Paint Labour Costs,Completed RO\n123,Test Co,2025,1,5000,1000,500,10';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(dbServices.uploadAnalytics).toHaveBeenCalled();
    });
    
    // The upload completes without leaving the new Data & Imports workspace.
    expect(await screen.findByRole('heading', { name: /Data & Imports/i })).toBeInTheDocument();
  });

  it('adds one KPI value for a selected reporting month', async () => {
    const company = { id: '123', name: 'Test Co' };
    dbServices.getCompanies.mockResolvedValue([company]);
    dbServices.upsertAnalyticsValue.mockResolvedValue({ company_id: company.id, year: 2025, month: 1, completed_ro: 12 });
    dbServices.getAnalytics.mockImplementation(() => {
      if (dbServices.upsertAnalyticsValue.mock.calls.length > 0) {
        return Promise.resolve([{
          'Company Id': company.id,
          'Company Name': company.name,
          Year: 2025,
          Month: 1,
          'Completed RO': 12
        }]);
      }
      return Promise.resolve([]);
    });

    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Reporting month' }));
    fireEvent.click(screen.getByRole('button', { name: 'Jan', exact: true }));
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add KPI value' }));

    const expectedYear = new Date().getFullYear();
    await waitFor(() => expect(dbServices.upsertAnalyticsValue).toHaveBeenCalledWith('123', expectedYear, 1, 'Completed RO', 12));
    expect(await screen.findByText(`Completed RO was added for Jan ${expectedYear}.`)).toBeInTheDocument();
  });

  it('keeps the reporting month control in-app instead of falling back to a native calendar', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));

    const monthControl = await screen.findByRole('button', { name: 'Reporting month' });
    expect(document.querySelectorAll('input[type="month"]')).toHaveLength(0);
    expect(monthControl).toHaveAttribute('aria-haspopup', 'dialog');
    expect(monthControl).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(monthControl);
    expect(screen.getByRole('dialog', { name: 'Choose reporting month' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: `${new Date().getFullYear()} months` })).toBeInTheDocument();
    expect(monthControl).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Choose reporting month' })).not.toBeInTheDocument();
    expect(monthControl).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the KPI selector in-app instead of falling back to a native select menu', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));

    const metricControl = await screen.findByRole('combobox', { name: 'KPI' });
    expect(document.querySelector('select#quick-entry-metric')).toBeNull();
    fireEvent.click(metricControl);
    expect(screen.getByRole('listbox', { name: 'KPI options' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Total Sales' }));
    expect(metricControl).toHaveTextContent('Total Sales');
    expect(metricControl).toHaveAttribute('aria-expanded', 'false');
  });

  it('makes an existing KPI replacement explicit before saving', async () => {
    const company = { id: '123', name: 'Test Co' };
    const existing = [{
      'Company Id': company.id,
      'Company Name': company.name,
      Year: 2026,
      Month: 8,
      'Completed RO': 20,
      'Total Sales': 5000
    }];
    dbServices.getCompanies.mockResolvedValue([company]);
    dbServices.getAnalytics.mockResolvedValue(existing);
    dbServices.upsertAnalyticsValue.mockResolvedValue({ company_id: company.id, year: 2026, month: 8, completed_ro: 22 });

    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));
    expect(await screen.findByText('Saved value')).toBeInTheDocument();
    expect(screen.getByText('Only this KPI will change.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update KPI value' }));

    await waitFor(() => expect(dbServices.upsertAnalyticsValue).toHaveBeenCalledWith('123', 2026, 8, 'Completed RO', 22));
  });
});
