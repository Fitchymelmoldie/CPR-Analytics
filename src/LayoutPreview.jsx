import React, { useMemo, useState } from 'react';
import ConsultantReviewModal from './ConsultantReviewModal';
import AppSidebar from './components/AppSidebar';
import BenchmarkTargetModal from './components/BenchmarkTargetModal';
import DataImportActions from './components/DataImportActions';
import DashboardWorkspace from './components/DashboardWorkspace';
import Header from './components/Header';
import ShopProfilePanel from './components/ShopProfilePanel';
import { DASHBOARD_KPI_DEFINITIONS, DEFAULT_DASHBOARD_KPI_TITLES } from './utils/dashboardKpis';
import { filterPeriodsByTimeframe, KPI_CONFIG } from './utils/metrics';
import { FEATURE_FLAGS } from './utils/featureFlags';

const PAGE_META = {
  dashboard: ['Visual Dashboard', ''],
  profile: ['Shop Profile', ''],
  'raw-data': ['Data & Imports', ''],
  leaderboards: ['Gamified Leaderboards', ''],
  customers: ['Customer Management', '']
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
  'Paint Revenue P/V': 880,
  'Panel Sales': 285419,
  'Part Sales': 490059,
  'Other Sales': 129021,
  'Sales per RO': 5457,
  'Effective Labour Rate': 146.9,
  'Effective Labour Cost': 20.7,
  'Total Gross Profit $': 671071,
  'Total Gross Profit %': 0.62,
  'Overall Efficiency': 1.09,
  'Panel Utilisation': 0.86,
  'Paint Utilisation': 0.82,
  'Panel Productive Efficiency': 0.94,
  'Paint Productive Efficiency': 1.02,
  'Cycle Time Total (K2K)': 21.1,
  'Paint Hours per RO': 5.2,
  'Paint Consumables': 10828
};
const MOCK_LATEST_VARIANCES = {
  'Total Sales': 8.4,
  'Completed RO': 4.2,
  'Paint Sales': -3.6,
  'Paint Cost / RO': -2.1,
  'Paint Cost / Total Sales': -0.7,
  'VPD / Per Booth': 12.4,
  'Booth Cycle Time': -3.2,
  'Return on Paint Labour': 18.6,
  'Liquid Cost to Refinish': 2.8,
  'Paint Revenue P/V': 5.1,
  'Panel Sales': 6.1,
  'Part Sales': 2.7,
  'Other Sales': -1.4,
  'Sales per RO': 3.8,
  'Effective Labour Rate': 2.2,
  'Effective Labour Cost': -1.8,
  'Total Gross Profit $': 7.4,
  'Total Gross Profit %': 1.9,
  'Overall Efficiency': 4.6,
  'Panel Utilisation': 2.8,
  'Paint Utilisation': 5.3,
  'Panel Productive Efficiency': 3.1,
  'Paint Productive Efficiency': 6.4,
  'Cycle Time Total (K2K)': -4.1,
  'Paint Hours per RO': 2.6,
  'Paint Consumables': 1.7
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
const PREVIEW_FACTORS = {
  min: [0.72, 0.76, 0.75, 0.81, 0.84, 0.88, 0.94, 1],
  max: [1.24, 1.18, 1.2, 1.13, 1.09, 1.1, 1.04, 1]
};

function previewMetricValue(definition, periodIndex) {
  const baseValue = MOCK_VALUES[definition.title];
  const factors = PREVIEW_FACTORS[definition.benchmarkType] || PREVIEW_FACTORS.min;
  const latestIndex = PREVIEW_PERIODS.length - 1;
  const latestVariance = MOCK_LATEST_VARIANCES[definition.title];
  const factor = periodIndex === latestIndex - 1 && Number.isFinite(latestVariance)
    ? 1 / (1 + latestVariance / 100)
    : factors[periodIndex];
  return Number.isFinite(baseValue) && Number.isFinite(factor) ? baseValue * factor : null;
}

function previewRollingAverage(definition, periodIndex) {
  const startIndex = Math.max(0, periodIndex - 2);
  const values = PREVIEW_PERIODS
    .slice(startIndex, periodIndex + 1)
    .map((_, offset) => previewMetricValue(definition, startIndex + offset))
    .filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function DashboardPreview({ navigationHidden, metricLibraryOpen, onCustomizeChange, isAdmin = true, consultantReviews = {}, onOpenConsultantReview }) {
  const [selectedTitle, setSelectedTitle] = useState('Total Sales');
  const [timeframe, setTimeframe] = useState('12M');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('2026-08');
  const [targets, setTargets] = useState(() => ({ ...MOCK_TARGETS }));
  const [targetEditorMetric, setTargetEditorMetric] = useState(null);
  const [visibleTitles, setVisibleTitles] = useState(() => [...DEFAULT_DASHBOARD_KPI_TITLES]);
  const selectedPeriodIndex = Math.max(0, PREVIEW_PERIODS.indexOf(selectedPeriod));

  const items = useMemo(() => DASHBOARD_KPI_DEFINITIONS.map((definition, index) => ({
    ...definition,
    value: previewMetricValue(definition, selectedPeriodIndex),
    previousValue: selectedPeriodIndex > 0 ? previewMetricValue(definition, selectedPeriodIndex - 1) : null,
    rollingAverage: previewRollingAverage(definition, selectedPeriodIndex),
    rollingMonths: Math.min(selectedPeriodIndex + 1, 3),
    variance: selectedPeriodIndex > 0
      ? ((previewMetricValue(definition, selectedPeriodIndex) - previewMetricValue(definition, selectedPeriodIndex - 1)) / Math.abs(previewMetricValue(definition, selectedPeriodIndex - 1))) * 100
      : null,
    benchmark: definition.targetable === false ? undefined : targets[definition.title],
    description: KPI_CONFIG[definition.title]?.description,
    rank: definition.rankKey && index < 4 ? { rank: index + 1 } : null,
    cohortSize: 8,
    delayClass: `card-appear-${(index % 4) + 1}`
  })), [selectedPeriodIndex, targets]);
  const selected = items.find(item => item.title === selectedTitle) || items[0];
  const targetDefinition = DASHBOARD_KPI_DEFINITIONS.find(definition => definition.title === targetEditorMetric);
  const reportingPeriod = PREVIEW_LABELS[PREVIEW_PERIODS.indexOf(selectedPeriod)] || 'August 2026';
  const periodOptions = PREVIEW_PERIODS
    .filter(period => period <= selectedPeriod)
    .map(period => ({ value: period, label: PREVIEW_LABELS[PREVIEW_PERIODS.indexOf(period)] }));
  const trendData = useMemo(() => {
    const chartPeriods = filterPeriodsByTimeframe(PREVIEW_PERIODS, selectedPeriod, timeframe, customRange);
    return {
      labels: chartPeriods.map(period => PREVIEW_LABELS[PREVIEW_PERIODS.indexOf(period)]),
      format: selected.format === 'percentWhole' ? 'percent' : selected.format,
      datasets: [{
        label: selected.title,
        data: chartPeriods.map(period => previewMetricValue(selected, PREVIEW_PERIODS.indexOf(period)))
      }]
    };
  }, [customRange, selected, selectedPeriod, timeframe]);
  const previousPeriod = selectedPeriodIndex > 0 ? PREVIEW_LABELS[selectedPeriodIndex - 1] : null;
  const dailyActual = 9108 * (previewMetricValue({ title: 'Paint Sales', benchmarkType: 'min' }, selectedPeriodIndex) / MOCK_VALUES['Paint Sales']);
  const dailyTarget = 8670 * (previewMetricValue({ title: 'Paint Cost / RO', benchmarkType: 'max' }, selectedPeriodIndex) / MOCK_VALUES['Paint Cost / RO']);
  const latestReviewEntry = Object.entries(consultantReviews)
    .filter(([period]) => period <= selectedPeriod)
    .sort(([periodA], [periodB]) => periodB.localeCompare(periodA))[0] || null;
  const latestConsultantReview = latestReviewEntry ? {
    period: latestReviewEntry[0],
    periodLabel: PREVIEW_LABELS[PREVIEW_PERIODS.indexOf(latestReviewEntry[0])] || latestReviewEntry[0],
    ...latestReviewEntry[1]
  } : null;

  return (
    <>
      <DashboardWorkspace
        companies={[MOCK_COMPANY.id]}
        selectedCompany={MOCK_COMPANY.id}
        onCompanyChange={() => {}}
        formatCompanyLabel={() => MOCK_COMPANY.name}
        isAdmin={isAdmin}
        periods={PREVIEW_PERIODS}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        formatPeriodLabel={(period) => PREVIEW_LABELS[PREVIEW_PERIODS.indexOf(period)] || period}
        company={MOCK_COMPANY}
        items={items}
        selectedKpi={selectedTitle}
        onSelectKpi={setSelectedTitle}
        onSetBenchmark={setTargetEditorMetric}
        dailyActual={dailyActual}
        dailyTarget={dailyTarget}
        rollingMonths={Math.min(selectedPeriodIndex + 1, 3)}
        reportingPeriod={reportingPeriod}
        previousPeriod={previousPeriod}
        dataStatusTone={selectedPeriod === '2026-08' ? 'current' : 'historical'}
        consultantReview={latestConsultantReview}
        consultantReviewStatus="ready"
        onOpenConsultantReview={onOpenConsultantReview}
        trendData={trendData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        periodOptions={periodOptions}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        comparisonLabel="3M cohort comparison"
        demoMode
        navigationHidden={navigationHidden}
        metricLibraryOpen={metricLibraryOpen}
        onCustomizeChange={onCustomizeChange}
        visibleTitles={visibleTitles}
        onVisibleTitlesChange={setVisibleTitles}
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

function DataPreview({ onNotice }) {
  const previewRows = [{
    'Company Id': MOCK_COMPANY.id,
    'Company Name': MOCK_COMPANY.name,
    Year: 2026,
    Month: 8,
    'Total Sales': 1080528,
    'Paint Sales': 176029,
    'Completed RO': 200,
    'Paint Cost per RO': 54
  }];

  return (
    <div className="space-y-4">
      <DataImportActions
        companyId={MOCK_COMPANY.id}
        companyName={MOCK_COMPANY.name}
        selectedPeriod="2026-08"
        periods={PREVIEW_PERIODS}
        rows={previewRows}
        onFile={() => onNotice('Spreadsheet import is disabled in this visual preview.')}
        onQuickSave={async ({ metricKey, period }) => onNotice(`${metricKey} is ready to save for ${period} in the authenticated app.`)}
      />
      <section className="codex-surface overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div><h2 className="font-semibold text-white">Full month editor</h2><p className="mt-1 text-xs text-surface-500">August 2026 · Boyle Smash Repairs</p></div>
          <button type="button" className="codex-button codex-button-primary px-3 py-2 text-xs">Save changes</button>
        </div>
        <div className="overflow-x-auto"><table className="codex-table min-w-[520px] text-left"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>{[['Total Sales', '$1,080,528'], ['Completed RO', '200'], ['Paint Cost / RO', '$54']].map(([metric, value]) => <tr key={metric}><td className="font-medium text-white">{metric}</td><td><span className="text-surface-200">{value}</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}

function LeaderboardPreview() {
  return <section className="codex-surface overflow-hidden"><div className="border-b border-white/[0.06] p-5"><h2 className="text-base font-semibold text-white">National performance group</h2><p className="mt-1 text-sm text-surface-400">A clear view of how each participating shop is performing.</p></div><div>{[['1', 'Boyle Smash Repairs', '92.4'], ['2', 'Northside Collision', '88.1'], ['3', 'Metro Bodyworks', '83.7']].map(([rank, name, score]) => <div key={rank} className="flex items-center gap-4 border-b border-white/[0.05] px-5 py-4 last:border-0"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.035] text-xs font-semibold text-surface-400">{rank}</span><span className="flex-1 font-medium text-white">{name}</span><span className="text-sm font-semibold text-surface-300">{score} pts</span></div>)}</div></section>;
}

function CustomersPreview({ onOpenDashboard }) {
  return <section className="codex-surface overflow-hidden"><div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-white">Customer Management</h2><p className="mt-1 text-sm text-surface-400">Manage access, then open a customer workspace when you need to inspect it.</p></div><button type="button" className="codex-button codex-button-primary px-3 py-2.5 text-xs">Add customer</button></div><div>{[['Boyle Smash Repairs', 'manager@boylesmash.com.au', 'Active', true], ['Northside Collision', 'owner@northside.com.au', 'Active', false], ['Metro Bodyworks', 'admin@metrobodyworks.com.au', 'Invited', false]].map(([name, email, status, canOpen]) => <div key={name} className="flex flex-wrap items-center gap-4 border-b border-white/[0.05] p-5 last:border-0"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.035] text-xs font-semibold text-surface-400">{name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate font-medium text-white">{name}</p><p className="truncate text-xs text-surface-500">{email}</p></div><span className="rounded-md bg-success-500/10 px-2 py-1 text-[10px] font-semibold text-success-400">{status}</span>{canOpen ? <button type="button" onClick={() => onOpenDashboard(MOCK_COMPANY.id)} className="text-xs font-semibold text-brand-300 hover:text-white">Open dashboard</button> : null}</div>)}</div></section>;
}

export default function LayoutPreview() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [metricLibraryOpen, setMetricLibraryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [viewingAs, setViewingAs] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOpenPeriod, setReviewOpenPeriod] = useState('2026-08');
  const [previewReviews, setPreviewReviews] = useState({
    '2026-08': {
      trendAnalysis: 'Paint sales and completed repair orders are moving favourably, while paint cost per repair order remains the clearest watch point.',
      improvements: 'Review paint-material usage by job and keep the current production rhythm visible in the weekly operations meeting.',
      timestamp: '2026-08-12T00:00:00.000Z'
    }
  });
  const [title, description] = PAGE_META[activeTab];
  const headerTitle = activeTab === 'dashboard' ? `Welcome, ${MOCK_COMPANY.name}` : title;
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 2400); };
  const navigate = (tab) => {
    setActiveTab(tab);
    if (tab !== 'dashboard') setMetricLibraryOpen(false);
  };
  const enterCustomerView = (companyId) => {
    setViewingAs(companyId);
    setActiveTab('dashboard');
    setMetricLibraryOpen(false);
    setMobileOpen(false);
  };
  const exitCustomerView = () => {
    setViewingAs(null);
    setActiveTab('customers');
  };
  const handleCustomizeChange = (open) => {
    setMetricLibraryOpen(open);
  };

  return (
    <div className="cpr-codex-shell min-h-screen bg-surface-900 text-surface-100 lg:flex">
      <AppSidebar activeTab={activeTab} onNavigate={navigate} currentUser={MOCK_USER} viewingAsCompany={Boolean(viewingAs)} collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} onOpenReviews={() => { setReviewOpenPeriod('2026-08'); setReviewOpen(true); }} hasNotification onLogout={() => showNotice('Logout is disabled in this visual preview.')} />
      <div className={`app-main-shell min-w-0 flex-1 ${activeTab === 'dashboard' && metricLibraryOpen ? 'metrics-panel-open' : ''}`}>
        <Header
          pageTitle={headerTitle}
          pageDescription={description}
          onMenuToggle={() => { setMetricLibraryOpen(false); setMobileOpen(value => !value); }}
          mobileNavOpen={mobileOpen}
          desktopNavHidden={collapsed}
          onDesktopNavToggle={() => setCollapsed(value => !value)}
          showMetricLibraryToggle={activeTab === 'dashboard'}
          metricLibraryOpen={metricLibraryOpen}
          onMetricLibraryToggle={() => { setMobileOpen(false); handleCustomizeChange(!metricLibraryOpen); }}
          showOperationalKpiInfo={activeTab === 'dashboard'}
          operationalKpiCount={DASHBOARD_KPI_DEFINITIONS.filter(definition => definition.pulseEligible === true).length}
          onReset={() => navigate('raw-data')}
          showReset={activeTab === 'raw-data'}
          onExport={() => showNotice('Export is disabled in this visual preview.')}
          showExport={!viewingAs && !['profile', 'customers'].includes(activeTab)}
          viewingAsCompanyName={viewingAs ? MOCK_COMPANY.name : null}
          onExitCustomerView={exitCustomerView}
        />
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' ? <DashboardPreview navigationHidden={collapsed} metricLibraryOpen={metricLibraryOpen} onCustomizeChange={handleCustomizeChange} isAdmin={!viewingAs} consultantReviews={previewReviews} onOpenConsultantReview={(period) => { setReviewOpenPeriod(period || '2026-08'); setReviewOpen(true); }} /> : null}
          {activeTab === 'profile' ? <ShopProfilePanel company={MOCK_COMPANY} onEdit={() => showNotice('Profile editing is disabled in this visual preview.')} /> : null}
          {activeTab === 'raw-data' ? <DataPreview onNotice={showNotice} /> : null}
          {FEATURE_FLAGS.leaderboards && activeTab === 'leaderboards' ? <LeaderboardPreview /> : null}
          {activeTab === 'customers' ? <CustomersPreview onOpenDashboard={enterCustomerView} /> : null}
        </main>
        <footer className="border-t border-surface-800 py-6 text-center text-xs text-surface-500">CPR Analytics · Automotive Refinishing Consultancy Dashboard</footer>
      </div>
      <ConsultantReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        currentUser={viewingAs ? { ...MOCK_USER, role: 'CUSTOMER' } : MOCK_USER}
        selectedCompany={MOCK_COMPANY.name}
        selectedPeriod={reviewOpenPeriod}
        availablePeriods={PREVIEW_PERIODS}
        companyReviews={previewReviews}
        onSaveReview={(period, trendAnalysis, improvements) => {
          setPreviewReviews(current => ({
            ...current,
            [period]: { trendAnalysis, improvements, timestamp: new Date().toISOString() }
          }));
          showNotice('Consultant review saved in this preview session.');
        }}
      />
      {notice ? <div role="status" className="fixed bottom-5 right-5 z-[70] rounded-xl bg-surface-800 px-4 py-3 text-sm text-surface-200 shadow-2xl">{notice}</div> : null}
    </div>
  );
}
