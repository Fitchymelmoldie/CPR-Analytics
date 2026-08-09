import React, { useMemo, useState } from 'react';
import AppSidebar from './components/AppSidebar';
import BenchmarkTargetModal from './components/BenchmarkTargetModal';
import DashboardWorkspace from './components/DashboardWorkspace';
import Header from './components/Header';
import ShopProfilePanel from './components/ShopProfilePanel';
import { DASHBOARD_KPI_DEFINITIONS } from './utils/dashboardKpis';
import { KPI_CONFIG } from './utils/metrics';

const PAGE_META = {
  dashboard: ['Visual Dashboard', 'Performance, profitability and operational trends'],
  profile: ['Shop Profile', 'Facility capacity and staffing information'],
  'raw-data': ['Data & Imports', 'Upload, review and adjust bodyshop performance data'],
  leaderboards: ['Gamified Leaderboards', 'Build competitive cohorts and compare performance'],
  customers: ['Customer Management', 'Manage bodyshop access and customer accounts']
};

const MOCK_USER = { role: 'ADMIN', email: 'admin@cpranalytics.com.au', companyName: 'CPR Analytics' };
const MOCK_COMPANY = {
  id: '1991.au', name: 'Boyle Smash Repairs', painters_count: 4, panel_beaters_count: 6,
  booths_count: 2, estimators_count: 3, managers_count: 2, admin_count: 4
};
const MOCK_VALUES = {
  'Total Sales': 1080528,
  'Completed RO': 200,
  'Paint Sales': 176029,
  'Paint Cost / RO': 54,
  'Paint Cost / Total Sales': 0.0101,
  'VPD / Per Booth': 5.7,
  'Booth Cycle Time': 1.8,
  'Return on Paint Labour': 5.35,
  'Liquid Cost to Refinish': 0.245,
  'Paint Revenue P/V': 880
};
const MOCK_VARIANCES = [8.4, 4.2, -3.6, -2.1, -0.7, 12.4, -3.2, 18.6, 2.8, 5.1];
const MOCK_PREVIOUS_VALUES = Object.fromEntries(DASHBOARD_KPI_DEFINITIONS.map((definition, index) => {
  const variance = MOCK_VARIANCES[index];
  return [definition.title, Number.isFinite(variance) && variance > -100 ? MOCK_VALUES[definition.title] / (1 + variance / 100) : null];
}));
const MOCK_ROLLING_AVERAGES = {
  'Total Sales': 1042500,
  'Completed RO': 194,
  'Paint Sales': 172600,
  'Paint Cost / RO': 56,
  'Paint Cost / Total Sales': 0.0118,
  'VPD / Per Booth': 5.4,
  'Booth Cycle Time': 1.9,
  'Return on Paint Labour': 5.1,
  'Liquid Cost to Refinish': 0.24,
  'Paint Revenue P/V': 850
};
const MOCK_TARGETS = {
  'Completed RO': 190,
  'Paint Cost / RO': 50,
  'Paint Cost / Total Sales': 0.012,
  'VPD / Per Booth': 5.2,
  'Booth Cycle Time': 1.7,
  'Return on Paint Labour': 4.8,
  'Liquid Cost to Refinish': 0.27,
  'Paint Revenue P/V': 825
};
const PREVIEW_PERIODS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
const PREVIEW_LABELS = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];

function DashboardPreview() {
  const [selectedTitle, setSelectedTitle] = useState('Total Sales');
  const [timeframe, setTimeframe] = useState('YTD');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-08');
  const [targets, setTargets] = useState(() => ({ ...MOCK_TARGETS }));
  const [targetEditorMetric, setTargetEditorMetric] = useState(null);

  const items = useMemo(() => DASHBOARD_KPI_DEFINITIONS.map((definition, index) => ({
    ...definition,
    value: MOCK_VALUES[definition.title],
    previousValue: MOCK_PREVIOUS_VALUES[definition.title],
    rollingAverage: MOCK_ROLLING_AVERAGES[definition.title],
    rollingMonths: 3,
    variance: MOCK_VARIANCES[index],
    benchmark: definition.targetable === false ? undefined : targets[definition.title],
    description: KPI_CONFIG[definition.title]?.description,
    rank: index < 4 ? { rank: index + 1 } : null,
    cohortSize: 8,
    delayClass: `card-appear-${(index % 4) + 1}`
  })), [targets]);
  const selected = items.find(item => item.title === selectedTitle) || items[0];
  const targetDefinition = DASHBOARD_KPI_DEFINITIONS.find(definition => definition.title === targetEditorMetric);
  const reportingPeriod = PREVIEW_LABELS[PREVIEW_PERIODS.indexOf(selectedPeriod)] || 'August 2026';
  const trendData = useMemo(() => {
    const factors = selected.benchmarkType === 'max'
      ? [1.24, 1.18, 1.2, 1.13, 1.09, 1.1, 1.04, 1]
      : [0.72, 0.76, 0.75, 0.81, 0.84, 0.88, 0.94, 1];
    return {
      labels: PREVIEW_LABELS,
      format: selected.format === 'percentWhole' ? 'percent' : selected.format,
      datasets: [{ label: selected.title, data: factors.map(factor => selected.value * factor) }]
    };
  }, [selected]);

  return (
    <>
      <DashboardWorkspace
        companies={[MOCK_COMPANY.id]}
        selectedCompany={MOCK_COMPANY.id}
        onCompanyChange={() => {}}
        formatCompanyLabel={() => MOCK_COMPANY.name}
        isAdmin
        periods={PREVIEW_PERIODS}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        formatPeriodLabel={(period) => PREVIEW_LABELS[PREVIEW_PERIODS.indexOf(period)] || period}
        company={MOCK_COMPANY}
        items={items}
        selectedKpi={selectedTitle}
        onSelectKpi={setSelectedTitle}
        onSetBenchmark={setTargetEditorMetric}
        dailyActual={9108}
        dailyTarget={8670}
        rollingMonths={3}
        reportingPeriod={reportingPeriod}
        previousPeriod="July 2026"
        dataStatusLabel="10 metrics reporting"
        dataStatusTone={selectedPeriod === '2026-08' ? 'current' : 'historical'}
        trendData={trendData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        comparisonLabel="3M cohort comparison"
        demoMode
      />
      <BenchmarkTargetModal
        isOpen={Boolean(targetEditorMetric)}
        metric={targetEditorMetric}
        companyName={MOCK_COMPANY.name}
        currentTarget={targetEditorMetric ? targets[targetEditorMetric] : undefined}
        benchmarkType={targetDefinition?.benchmarkType}
        format={targetDefinition?.format}
        isSaving={false}
        error={null}
        onSave={(target) => {
          setTargets(current => ({ ...current, [targetEditorMetric]: target }));
          setTargetEditorMetric(null);
        }}
        onRemove={() => {
          setTargets(current => {
            const next = { ...current };
            delete next[targetEditorMetric];
            return next;
          });
          setTargetEditorMetric(null);
        }}
        onClose={() => setTargetEditorMetric(null)}
      />
    </>
  );
}

function DataPreview() {
  return <div className="space-y-5"><section className="rounded-[28px] border border-dashed border-brand-500/30 bg-brand-950/10 p-9 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-xl text-brand-300">↑</div><h2 className="mt-4 font-semibold text-white">Import bodyshop data</h2><p className="mt-1 text-sm text-surface-400">Drop a CPR Analytics CSV here, or choose a file.</p><button type="button" className="mt-4 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white">Choose CSV file</button></section><section className="overflow-hidden rounded-[28px] bg-white/[0.025]"><div className="flex items-center justify-between p-5"><div><h2 className="font-semibold text-white">Manual data entry</h2><p className="mt-1 text-xs text-surface-500">August 2026 · Boyle Smash Repairs</p></div><button type="button" className="rounded-full bg-brand-500/10 px-4 py-2 text-xs font-semibold text-brand-300">Save changes</button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-black/10 text-[9px] uppercase tracking-wider text-surface-600"><tr>{['Metric', 'Current value', 'Previous month', 'Movement', 'Status'].map(item => <th key={item} className="px-5 py-3">{item}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.04] text-surface-300">{[['Total Sales', '$98,420', '$91,105', '+8.0%', 'Ready'], ['Completed RO', '18', '17', '+5.9%', 'Ready'], ['Paint Cost', '$9,780', '$9,920', '-1.4%', 'Ready']].map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={cell} className={`px-5 py-4 ${index === 0 ? 'font-medium text-white' : ''}`}>{cell}</td>)}</tr>)}</tbody></table></div></section></div>;
}

function LeaderboardPreview() {
  return <section className="rounded-[28px] bg-white/[0.025] p-6"><h2 className="text-lg font-semibold text-white">National performance group</h2><p className="mt-1 text-sm text-surface-400">A clear view of how each participating shop is performing.</p><div className="mt-6 space-y-2.5">{[['1', 'Boyle Smash Repairs', '92.4'], ['2', 'Northside Collision', '88.1'], ['3', 'Metro Bodyworks', '83.7']].map(([rank, name, score]) => <div key={rank} className="flex items-center gap-4 rounded-2xl bg-black/10 p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/10 font-bold text-brand-300">{rank}</span><span className="flex-1 font-medium text-white">{name}</span><span className="text-sm font-semibold text-surface-300">{score} pts</span></div>)}</div></section>;
}

function CustomersPreview() {
  return <section className="overflow-hidden rounded-[28px] bg-white/[0.025]"><div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-white">Bodyshop customers</h2><p className="mt-1 text-sm text-surface-400">Access, company assignment and account status.</p></div><button type="button" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Add customer</button></div><div className="divide-y divide-white/[0.04]">{[['Boyle Smash Repairs', 'manager@boylesmash.com.au', 'Active'], ['Northside Collision', 'owner@northside.com.au', 'Active'], ['Metro Bodyworks', 'admin@metrobodyworks.com.au', 'Invited']].map(([name, email, status]) => <div key={name} className="flex items-center gap-4 p-5"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500/10 text-xs font-bold text-brand-300">{name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate font-medium text-white">{name}</p><p className="truncate text-xs text-surface-500">{email}</p></div><span className="rounded-full bg-success-500/10 px-3 py-1 text-xs font-semibold text-success-400">{status}</span></div>)}</div></section>;
}

export default function LayoutPreview() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [title, description] = PAGE_META[activeTab];
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 2400); };

  return (
    <div className="min-h-screen bg-surface-900 text-surface-100 lg:flex">
      <AppSidebar activeTab={activeTab} onNavigate={setActiveTab} currentUser={MOCK_USER} collapsed={collapsed} onToggleCollapsed={() => setCollapsed(value => !value)} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} onOpenReviews={() => showNotice('Consultant reviews would open here.')} hasNotification onLogout={() => showNotice('Logout is disabled in this visual preview.')} />
      <div className="min-w-0 flex-1"><Header pageTitle={title} pageDescription={description} onMenuToggle={() => setMobileOpen(true)} onReset={() => setActiveTab('raw-data')} showReset={activeTab === 'raw-data'} onExport={() => showNotice('Export is disabled in this visual preview.')} showExport={!['profile', 'customers'].includes(activeTab)} /><main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{activeTab === 'dashboard' ? <DashboardPreview /> : null}{activeTab === 'profile' ? <ShopProfilePanel company={MOCK_COMPANY} onEdit={() => showNotice('Profile editing is disabled in this visual preview.')} /> : null}{activeTab === 'raw-data' ? <DataPreview /> : null}{activeTab === 'leaderboards' ? <LeaderboardPreview /> : null}{activeTab === 'customers' ? <CustomersPreview /> : null}</main><footer className="border-t border-surface-800 py-6 text-center text-xs text-surface-500">CPR Analytics · Automotive Refinishing Consultancy Dashboard</footer></div>
      {notice ? <div role="status" className="fixed bottom-5 right-5 z-[70] rounded-xl bg-surface-800 px-4 py-3 text-sm text-surface-200 shadow-2xl">{notice}</div> : null}
    </div>
  );
}
