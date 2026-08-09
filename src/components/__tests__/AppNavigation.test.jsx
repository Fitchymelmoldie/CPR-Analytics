import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import * as authProvider from '../AuthProvider';
import * as dbServices from '../../services/db';

vi.mock('../AuthProvider', () => ({
  useAuth: vi.fn(),
  default: ({ children }) => <>{children}</>
}));

vi.mock('../../services/db', () => ({
  uploadAnalytics: vi.fn(),
  getAnalytics: vi.fn(),
  getCompanies: vi.fn(),
  getProfiles: vi.fn(),
  inviteCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  createCompany: vi.fn(),
  deleteCompany: vi.fn(),
  updateShopProfile: vi.fn(),
  deleteAnalyticsPeriod: vi.fn(),
  getConsultantReviews: vi.fn(),
  saveConsultantReview: vi.fn(),
  getLeaderboardGroups: vi.fn(),
  createLeaderboardGroup: vi.fn(),
  deleteLeaderboardGroup: vi.fn(),
  getBenchmarks: vi.fn(),
  upsertBenchmark: vi.fn(),
  deleteBenchmark: vi.fn()
}));

const company = {
  id: '123.au',
  name: 'Test Bodyshop',
  state: 'NSW',
  painters_count: 4,
  panel_beaters_count: 6,
  admin_count: 2,
  estimators_count: 3,
  managers_count: 2,
  booths_count: 2
};

const analytics = [
  {
    'Company Id': '123.au',
    'Company Name': 'Test Bodyshop',
    State: 'NSW',
    Year: 2026,
    Month: 4,
    'Total Sales': 950000,
    'Paint Sales': 155000,
    'Paint Labour Costs': 32000,
    'Completed RO': 180,
    'Paint Cost per RO': 58,
    'Vehicles per Day per Booth': 5.1,
    'Booth Cycle Time': 2.1
  },
  {
    'Company Id': '123.au',
    'Company Name': 'Test Bodyshop',
    State: 'NSW',
    Year: 2026,
    Month: 5,
    'Total Sales': 1080000,
    'Paint Sales': 176000,
    'Paint Labour Costs': 32900,
    'Completed RO': 200,
    'Paint Cost per RO': 54,
    'Vehicles per Day per Booth': 5.7,
    'Booth Cycle Time': 1.8
  }
];

const customerProfiles = [
  {
    id: 'customer-user',
    email: 'shop@example.com',
    role: 'CUSTOMER',
    company_id: company.id,
    companies: { name: company.name },
    created_at: '2026-07-01T00:00:00.000Z'
  }
];

function authState(role = 'ADMIN') {
  const isAdmin = role === 'ADMIN';
  const user = { id: isAdmin ? 'admin-user' : 'customer-user', email: isAdmin ? 'admin@example.com' : 'shop@example.com' };
  return {
    user,
    profile: {
      role,
      company_id: isAdmin ? null : company.id,
      companies: isAdmin ? null : { name: company.name }
    },
    session: { access_token: 'test-token', user },
    loading: false,
    requirePasswordSet: false,
    setRequirePasswordSet: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  };
}

function useRole(role = 'ADMIN') {
  const state = authState(role);
  authProvider.useAuth.mockReturnValue(state);
  return state;
}

describe('Drawer and dashboard regression coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    dbServices.getAnalytics.mockResolvedValue(analytics);
    dbServices.getCompanies.mockResolvedValue([company]);
    dbServices.getProfiles.mockResolvedValue(customerProfiles);
    dbServices.getConsultantReviews.mockResolvedValue([
      {
        period: '2026-05',
        trend_analysis: 'Strong paint sales.',
        improvements: 'Keep monitoring cycle time.',
        created_at: '2026-06-01T00:00:00.000Z'
      }
    ]);
    dbServices.getLeaderboardGroups.mockResolvedValue([]);
    dbServices.getBenchmarks.mockResolvedValue([]);
    dbServices.uploadAnalytics.mockResolvedValue(true);
    dbServices.updateShopProfile.mockResolvedValue(company);
    dbServices.saveConsultantReview.mockResolvedValue({
      trend_analysis: 'Saved analysis',
      improvements: 'Saved improvements',
      created_at: '2026-06-02T00:00:00.000Z'
    });
    dbServices.upsertBenchmark.mockResolvedValue({ kpi_key: 'Total Sales', target: 1000000 });
    dbServices.deleteBenchmark.mockResolvedValue(null);
    dbServices.deleteAnalyticsPeriod.mockResolvedValue(null);
    dbServices.createLeaderboardGroup.mockResolvedValue({ id: 'group-1', name: 'Peer Group', shops: ['123.au', '456.au'] });
    dbServices.inviteCustomer.mockResolvedValue({ message: 'User invited successfully' });
    dbServices.deleteCustomer.mockResolvedValue({ message: 'User deleted successfully' });
    dbServices.deleteCompany.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lets an administrator reach every drawer workspace', async () => {
    useRole('ADMIN');
    render(<App />);

    expect(await screen.findByRole('button', { name: 'Visual Dashboard' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Shop Profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Consultant Reviews' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Data & Imports' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gamified Leaderboards' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Customer Management' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Shop Profile' }));
    expect(await screen.findByRole('heading', { name: company.name })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Data & Imports' }));
    expect(await screen.findByRole('heading', { name: /Manual Data Entry/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Gamified Leaderboards' }));
    expect(await screen.findByText('Gamified Leaderboard Configuration')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Customer Management' }));
    expect((await screen.findAllByRole('heading', { name: 'Customer Management' })).length).toBeGreaterThan(0);
    expect(await screen.findByText('shop@example.com')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Consultant Reviews' }));
    expect(await screen.findByRole('heading', { name: 'Consultant Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Review' })).toBeInTheDocument();
  });

  it('keeps KPI selection and timeframe controls connected to the new chart', async () => {
    useRole('ADMIN');
    render(<App />);

    const paintSales = await screen.findByRole('button', { name: /View Paint Sales performance/i });
    fireEvent.click(paintSales);
    expect(paintSales).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Paint Sales' })).toBeInTheDocument();

    const threeMonths = screen.getByRole('button', { name: '3M' });
    fireEvent.click(threeMonths);
    await waitFor(() => expect(screen.getByRole('button', { name: '3M' })).toHaveAttribute('aria-pressed', 'true'));
  });

  it('preserves manual editing and saving in Data & Imports', async () => {
    useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Data & Imports' }));

    const totalSalesLabel = await screen.findByText('Total Sales', { selector: 'label' });
    const totalSalesInput = totalSalesLabel.parentElement.querySelector('input');
    fireEvent.change(totalSalesInput, { target: { value: '1100000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes *' }));

    await waitFor(() => expect(dbServices.uploadAnalytics).toHaveBeenCalledTimes(1));
    expect(dbServices.uploadAnalytics.mock.calls[0][0][0]['Total Sales']).toBe('1100000');
  });

  it('marks a newly added reporting period as needing to be saved', async () => {
    useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Data & Imports' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Add New Period' }));
    expect(screen.getByRole('heading', { name: 'Add a reporting period' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add period' }));

    expect(await screen.findByRole('button', { name: 'Save Changes *' })).toBeEnabled();
  });

  it('keeps administrator controls out of the bodyshop drawer and dashboard', async () => {
    useRole('CUSTOMER');
    render(<App />);

    expect(await screen.findByRole('button', { name: 'Visual Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shop Profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Consultant Reviews' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Data & Imports' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Gamified Leaderboards' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Customer Management' })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Export data')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Set target for/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Consultant Reviews' }));
    expect(await screen.findByText("Review the consultant's analysis below.")).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save Review' })).not.toBeInTheDocument();
  });

  it('keeps profile and reviews useful for a bodyshop that is still awaiting analytics', async () => {
    useRole('CUSTOMER');
    dbServices.getAnalytics.mockResolvedValue([]);
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Awaiting Data' })).toBeInTheDocument();
    expect(screen.queryByText('Performance pulse')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Shop Profile' }));
    expect(await screen.findByRole('heading', { name: company.name })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Consultant Reviews' }));
    expect((await screen.findAllByText(company.id, { exact: false })).length).toBeGreaterThan(0);
  });

  it('does not render zero-value dashboard widgets for an empty administrator account', async () => {
    useRole('ADMIN');
    dbServices.getAnalytics.mockResolvedValue([]);
    dbServices.getCompanies.mockResolvedValue([]);
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Your dashboard is ready for data' })).toBeInTheDocument();
    expect(screen.queryByText('Performance pulse')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Bodyshop key performance indicators')).not.toBeInTheDocument();
  });

  it('persists sidebar collapse state and still signs out', async () => {
    const state = useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Collapse sidebar' }));
    await waitFor(() => expect(window.localStorage.getItem('cpr_sidebar_collapsed')).toBe('true'));

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => expect(state.signOut).toHaveBeenCalledTimes(1));
  });

  it('opens and closes the responsive mobile drawer', async () => {
    useRole('ADMIN');
    const { container } = render(<App />);
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('invisible');

    fireEvent.click(await screen.findByRole('button', { name: 'Open navigation' }));
    expect(sidebar).toHaveClass('visible');
    fireEvent.click(screen.getAllByRole('button', { name: 'Close navigation' })[1]);
    expect(sidebar).toHaveClass('invisible');
  });

  it('keeps shop profile editing connected to the existing save action', async () => {
    useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Shop Profile' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Edit shop profile' }));

    const countFields = screen.getAllByRole('spinbutton');
    fireEvent.change(countFields[0], { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => expect(dbServices.updateShopProfile).toHaveBeenCalledTimes(1));
    expect(dbServices.updateShopProfile).toHaveBeenCalledWith(company.id, expect.objectContaining({ painters_count: '5' }));
  });

  it('keeps consultant review editing and saving available to administrators', async () => {
    useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Consultant Reviews' }));

    fireEvent.change(screen.getByPlaceholderText(/Summarise the key performance trends/i), { target: { value: 'Saved analysis' } });
    fireEvent.change(screen.getByPlaceholderText(/List specific, actionable recommendations/i), { target: { value: 'Saved improvements' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Review' }));

    await waitFor(() => expect(dbServices.saveConsultantReview).toHaveBeenCalledTimes(1));
    expect(dbServices.saveConsultantReview).toHaveBeenCalledWith(company.id, '2026-05', 'Saved analysis', 'Saved improvements');
  });

  it('keeps target creation and removal connected to the benchmark service', async () => {
    useRole('ADMIN');
    render(<App />);

    await waitFor(() => expect(dbServices.getBenchmarks).toHaveBeenCalledWith(company.id));
    fireEvent.click(await screen.findByRole('button', { name: 'Set target for Total Sales' }));
    expect(screen.getByRole('heading', { name: 'Create target for Total Sales' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Target value'), { target: { value: '1000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create target' }));
    await waitFor(() => expect(dbServices.upsertBenchmark).toHaveBeenCalledWith(company.id, 'Total Sales', 1000000));

    fireEvent.click(screen.getByRole('button', { name: 'Set target for Total Sales' }));
    expect(screen.getByRole('heading', { name: 'Edit target for Total Sales' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove target' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm removal' }));
    await waitFor(() => expect(dbServices.deleteBenchmark).toHaveBeenCalledWith(company.id, 'Total Sales'));
  });

  it('keeps period deletion behind confirmation and refreshes data afterwards', async () => {
    useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Data & Imports' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Period' }));
    expect(screen.getByRole('heading', { name: 'Delete Period?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete Period' }));
    await waitFor(() => expect(dbServices.deleteAnalyticsPeriod).toHaveBeenCalledWith(company.id, '2026', '05'));
    await waitFor(() => expect(dbServices.getAnalytics.mock.calls.length).toBeGreaterThan(1));
  });

  it('keeps leaderboard cohort selection and group saving connected', async () => {
    const secondCompany = { ...company, id: '456.au', name: 'Second Bodyshop' };
    const secondCompanyRows = analytics.map(row => ({ ...row, 'Company Id': secondCompany.id, 'Company Name': secondCompany.name }));
    useRole('ADMIN');
    dbServices.getCompanies.mockResolvedValue([company, secondCompany]);
    dbServices.getAnalytics.mockResolvedValue([...analytics, ...secondCompanyRows]);
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Gamified Leaderboards' }));

    fireEvent.click(await screen.findByText(company.id, { selector: 'span' }));
    fireEvent.click(screen.getByText(secondCompany.id, { selector: 'span' }));
    fireEvent.change(screen.getByPlaceholderText(/Enter group name/i), { target: { value: 'Peer Group' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Selection as Group' }));

    await waitFor(() => expect(dbServices.createLeaderboardGroup).toHaveBeenCalledWith('admin-user', 'Peer Group', [company.id, secondCompany.id]));
  });

  it('exports the existing data without leaving a temporary browser URL behind', async () => {
    useRole('ADMIN');
    const createObjectURL = vi.fn(() => 'blob:test-export');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<App />);

    fireEvent.click(await screen.findByTitle('Export data'));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-export');
  });

  it('still presents and submits the login screen when there is no active session', async () => {
    const signIn = vi.fn().mockResolvedValue({ error: null });
    authProvider.useAuth.mockReturnValue({
      user: null,
      profile: null,
      session: null,
      loading: false,
      requirePasswordSet: false,
      setRequirePasswordSet: vi.fn(),
      signIn,
      signOut: vi.fn()
    });
    const { container } = render(<App />);
    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'user@example.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'correct-horse-battery-staple' } });
    fireEvent.click(screen.getByRole('button', { name: 'Secure Login' }));

    await waitFor(() => expect(signIn).toHaveBeenCalledWith('user@example.com', 'correct-horse-battery-staple'));
    expect(dbServices.getAnalytics).not.toHaveBeenCalled();
  });

  it('submits one customer invitation with the current administrator token', async () => {
    useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Customer Management' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Invite Customer' }));
    fireEvent.change(screen.getByPlaceholderText('client@bodyshop.com'), { target: { value: 'newshop@example.com' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: company.id } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Invite' }));

    await waitFor(() => expect(dbServices.inviteCustomer).toHaveBeenCalledTimes(1));
    expect(dbServices.inviteCustomer).toHaveBeenCalledWith('newshop@example.com', company.id, 'test-token');
    expect(await screen.findByText('Invitation sent successfully!')).toBeInTheDocument();
  });

  it('keeps user and company deletion behind their existing confirmations', async () => {
    useRole('ADMIN');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Customer Management' }));
    await screen.findByText('shop@example.com');

    fireEvent.click(screen.getByTitle('Delete User Account'));
    expect(screen.getByRole('heading', { name: 'Delete User Account?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete User' }));
    await waitFor(() => expect(dbServices.deleteCustomer).toHaveBeenCalledWith('customer-user', 'test-token'));

    fireEvent.click(await screen.findByTitle('Delete Company & Data'));
    expect(screen.getByRole('heading', { name: 'Delete Company?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete Everything' }));
    await waitFor(() => expect(dbServices.deleteCompany).toHaveBeenCalledWith(company.id));
  });
});
