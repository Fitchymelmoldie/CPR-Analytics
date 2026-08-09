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
  uploadAnalytics: vi.fn(),
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
  });

  it('renders upload zone for Admin when there is no data', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));
    expect(await screen.findByText(/Upload Performance Data/i)).toBeInTheDocument();
  });

  it('shows an in-app error when required CSV columns are missing', async () => {
    const { container } = render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^Data & Imports$/i }));
    await screen.findByText(/Upload Performance Data/i);
    
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
    await screen.findByText(/Upload Performance Data/i);
    
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
});
