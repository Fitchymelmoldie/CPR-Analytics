import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import ConsultantReviewModal from './ConsultantReviewModal';
import { parseNum, MONTH_NAMES, filterPeriodsByTimeframe, KPI_CONFIG } from './utils/metrics';
import { DASHBOARD_KPI_DEFINITIONS, DEFAULT_DASHBOARD_KPI_TITLES, normalizeDashboardKpiTitles } from './utils/dashboardKpis';
import BenchmarkTargetModal from './components/BenchmarkTargetModal';
import DataImportActions from './components/DataImportActions';
import DashboardWorkspace from './components/DashboardWorkspace';
import FilterSelect from './components/FilterSelect';
import Header from './components/Header';
import AppSidebar from './components/AppSidebar';
import ShopProfilePanel from './components/ShopProfilePanel';
import LoginScreen from './components/LoginScreen';
import ReportingPeriodModal from './components/ReportingPeriodModal';
import SetPasswordScreen from './components/SetPasswordScreen';
import CustomerManagement from './components/CustomerManagement';
import { useAuth } from './components/AuthProvider';
import { uploadAnalytics, upsertAnalyticsValue, getAnalytics, updateShopProfile, deleteAnalyticsPeriod, getCompanies, getConsultantReviews, saveConsultantReview, getLeaderboardGroups, createLeaderboardGroup, deleteLeaderboardGroup, getBenchmarks, upsertBenchmark, deleteBenchmark, getDashboardKpiLayout, upsertDashboardKpiLayout } from './services/db';
import { FEATURE_FLAGS } from './utils/featureFlags';

const PAGE_META = {
  dashboard: { title: 'Visual Dashboard', description: '' },
  profile: { title: 'Shop Profile', description: '' },
  'raw-data': { title: 'Data & Imports', description: '' },
  leaderboards: { title: 'Gamified Leaderboards', description: '' },
  customers: { title: 'Customer Management', description: '' }
};

const SIDEBAR_STORAGE_KEY = 'cpr_sidebar_hidden:v1';

function getInitialSidebarHidden() {
  if (typeof window === 'undefined') return false;
  try {
    const currentValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (currentValue !== null) return currentValue === 'true';
    return window.localStorage.getItem('cpr_sidebar_collapsed') === 'true';
  } catch {
    return false;
  }
}

function metricValueFromRow(title, row) {
  if (!row) return null;
  const value = KPI_CONFIG[title]?.getValue(row);
  return Number.isFinite(value) ? value : null;
}

function rollingMetricValue(title, rows) {
  if (!rows.length) return null;

  const sumField = (field) => rows.reduce((sum, row) => sum + (parseNum(row[field]) || 0), 0);

  if (title === 'Return on Paint Labour') {
    const sales = sumField('Paint Sales');
    const labourCosts = sumField('Paint Labour Costs');
    return labourCosts > 0 ? sales / labourCosts : null;
  }

  if (title === 'Paint Revenue P/V') {
    const sales = sumField('Paint Sales');
    const completedRO = sumField('Completed RO');
    return completedRO > 0 ? sales / completedRO : null;
  }

  if (title === 'Paint Cost / RO') {
    const totalPaintCost = rows.reduce((sum, row) => sum + ((parseNum(row['Paint Cost per RO']) || 0) * (parseNum(row['Completed RO']) || 0)), 0);
    const completedRO = sumField('Completed RO');
    return completedRO > 0 ? totalPaintCost / completedRO : null;
  }

  if (title === 'Paint Cost / Total Sales') {
    const totalPaintCost = rows.reduce((sum, row) => sum + ((parseNum(row['Paint Cost per RO']) || 0) * (parseNum(row['Completed RO']) || 0)), 0);
    const totalSales = sumField('Total Sales');
    return totalSales > 0 ? totalPaintCost / totalSales : null;
  }

  if (title === 'Liquid Cost to Refinish') {
    const totalPaintCost = rows.reduce((sum, row) => sum + ((parseNum(row['Paint Cost per RO']) || 0) * (parseNum(row['Completed RO']) || 0)), 0);
    const paintSales = sumField('Paint Sales');
    return paintSales > 0 ? totalPaintCost / paintSales : null;
  }

  const values = rows.map(row => metricValueFromRow(title, row)).filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

// === Main App ===
    function App() {
      const { user, profile, loading, requirePasswordSet, setRequirePasswordSet, signOut } = useAuth();
      
      const currentUser = useMemo(() => {
        if (!user || !profile) return null;
        return {
          id: user.id,
          email: user.email,
          role: profile.role,
          companyId: profile.company_id,
          companyName: profile.companies?.name || profile.company_id
        };
      }, [user, profile]);

      const currentUserRole = currentUser?.role;
      const currentUserCompanyId = currentUser?.companyId;

      const handleLogout = async () => {
        await signOut();
        setData([]);
        setAnalyticsStatus('idle');
        setSelectedCompany('');
        setSelectedPeriod('');
        setBenchmarks({});
        setLeaderboardCohort([]);
        setSavedGroups([]);
        setSavedReviews({});
        localStorage.removeItem('bodyshop_data');
        localStorage.removeItem('bodyshop_saved_groups');
        localStorage.removeItem('cpr_reviews');
      };

      const [data, setData] = useState([]);
      const [analyticsStatus, setAnalyticsStatus] = useState('idle');
      
      useEffect(() => {
        if (!currentUser) {
          setAnalyticsStatus('idle');
          return undefined;
        }

        let cancelled = false;
        setData([]);
        setAnalyticsStatus('loading');
        getAnalytics(currentUser.role === 'CUSTOMER' ? currentUser.companyId : null)
          .then(fetched => {
            if (cancelled) return;
            setData(fetched);
            setAnalyticsStatus('ready');
          })
          .catch(err => {
            if (cancelled) return;
            console.error("DB Fetch Error:", err);
            setAnalyticsStatus('error');
          });

        return () => { cancelled = true; };
      }, [currentUser]);

      const [allCompanies, setAllCompanies] = useState([]);
      useEffect(() => {
        if (currentUser) {
          getCompanies()
            .then(comps => setAllCompanies(comps))
            .catch(err => console.error("Company fetch error:", err));
        }
      }, [currentUser]);
      const [selectedCompany, setSelectedCompany] = useState('');
      const [selectedPeriod, setSelectedPeriod] = useState('');
      const [customerViewCompanyId, setCustomerViewCompanyId] = useState(null);
      const [adminReturnCompanyId, setAdminReturnCompanyId] = useState(null);
      const [showCreatePeriodModal, setShowCreatePeriodModal] = useState(false);
      const handleCloseCreatePeriodModal = useCallback(() => setShowCreatePeriodModal(false), []);
      const [isSavingRow, setIsSavingRow] = useState(false);
      const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
      const [activeTab, setActiveTab] = useState('dashboard');
      const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarHidden);
      const [metricLibraryOpen, setMetricLibraryOpen] = useState(false);
      const [mobileNavOpen, setMobileNavOpen] = useState(false);
      const [selectedKpi, setSelectedKpi] = useState('Completed RO');
      const [chartTimeframe, setChartTimeframe] = useState('12M');
      const [chartCustomRange, setChartCustomRange] = useState({ from: '', to: '' });
      const [benchmarks, setBenchmarks] = useState({});
      const [benchmarkLoadState, setBenchmarkLoadState] = useState({ companyId: null, status: 'idle' });
      const [targetEditorMetric, setTargetEditorMetric] = useState(null);
      const [benchmarkMutation, setBenchmarkMutation] = useState({ loading: false, error: null });
      const [dashboardVisibleKpis, setDashboardVisibleKpis] = useState(() => [...DEFAULT_DASHBOARD_KPI_TITLES]);
      const [dashboardLayoutState, setDashboardLayoutState] = useState({ status: 'idle', dirty: false, error: null });
      const dashboardLayoutRequestRef = useRef(0);
      const [leaderboardCohort, setLeaderboardCohort] = useState([]);
      const [savedGroups, setSavedGroups] = useState([]);
      const [groupNameInput, setGroupNameInput] = useState('');
      
      const [showShopProfileModal, setShowShopProfileModal] = useState(false);
      const [shopProfileForm, setShopProfileForm] = useState({
        painters_count: 0, panel_beaters_count: 0, admin_count: 0, estimators_count: 0, managers_count: 0, booths_count: 0
      });
      const [appNotice, setAppNotice] = useState(null);
      const appNoticeTimerRef = useRef(null);

      const enterCustomerView = useCallback((companyId) => {
        if (!companyId || currentUserRole !== 'ADMIN') return;
        setAdminReturnCompanyId(selectedCompany);
        setCustomerViewCompanyId(companyId);
        setSelectedCompany(companyId);
        setSelectedPeriod('');
        setActiveTab('dashboard');
        setMobileNavOpen(false);
      }, [currentUserRole, selectedCompany]);

      const exitCustomerView = useCallback(() => {
        const restoreCompany = adminReturnCompanyId || allCompanies[0]?.id || '';
        setCustomerViewCompanyId(null);
        setAdminReturnCompanyId(null);
        setSelectedCompany(restoreCompany);
        setSelectedPeriod('');
        setActiveTab('customers');
        setMobileNavOpen(false);
      }, [adminReturnCompanyId, allCompanies]);

      const showAppNotice = useCallback((message, tone = 'error') => {
        if (appNoticeTimerRef.current) window.clearTimeout(appNoticeTimerRef.current);
        setAppNotice({ message, tone });
        appNoticeTimerRef.current = window.setTimeout(() => setAppNotice(null), 4200);
      }, []);

      useEffect(() => () => {
        if (appNoticeTimerRef.current) window.clearTimeout(appNoticeTimerRef.current);
      }, []);

      useEffect(() => {
        try {
          window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
        } catch {
          // The layout remains usable when storage is unavailable.
        }
      }, [sidebarCollapsed]);

      const handleDashboardCustomizeChange = useCallback((isOpen) => {
        setMetricLibraryOpen(isOpen);
      }, []);

      useEffect(() => {
        if (activeTab !== 'dashboard') setMetricLibraryOpen(false);
      }, [activeTab]);

      useEffect(() => {
        if ((!FEATURE_FLAGS.leaderboards && activeTab === 'leaderboards') || (currentUserRole !== 'ADMIN' && ['raw-data', 'leaderboards', 'customers'].includes(activeTab))) {
          setActiveTab('dashboard');
        }
        if (currentUserRole !== 'ADMIN' && customerViewCompanyId) {
          setCustomerViewCompanyId(null);
          setAdminReturnCompanyId(null);
        }
      }, [activeTab, currentUserRole, customerViewCompanyId]);

      const handleEditShopProfile = useCallback(() => {
        const comp = allCompanies.find(c => c.id === selectedCompany);
        if (comp) {
          setShopProfileForm({
            painters_count: comp.painters_count || 0,
            panel_beaters_count: comp.panel_beaters_count || 0,
            admin_count: comp.admin_count || 0,
            estimators_count: comp.estimators_count || 0,
            managers_count: comp.managers_count || 0,
            booths_count: comp.booths_count || 0
          });
        }
        setShowShopProfileModal(true);
      }, [allCompanies, selectedCompany]);

      const handleSaveShopProfile = async (e) => {
        e.preventDefault();
        try {
          await updateShopProfile(selectedCompany, shopProfileForm);
          setData(prev => prev.map(r => r['Company Id'] === selectedCompany ? { ...r, ...shopProfileForm } : r));
          setAllCompanies(prev => prev.map(c => c.id === selectedCompany ? { ...c, ...shopProfileForm } : c));
          setShowShopProfileModal(false);
        } catch (err) {
          console.error(err);
          showAppNotice("Failed to save profile: " + err.message);
        }
      };
      
      const [deleteConfirmPeriod, setDeleteConfirmPeriod] = useState(null);
      const [deletePeriodStatus, setDeletePeriodStatus] = useState({ loading: false, error: null });

      const executeDeletePeriod = async () => {
        if (!deleteConfirmPeriod || !selectedCompany) return;
        setDeletePeriodStatus({ loading: true, error: null });
        try {
          const [year, month] = deleteConfirmPeriod.split('-');
          await deleteAnalyticsPeriod(selectedCompany, year, month);
          setDeleteConfirmPeriod(null);
          setSelectedPeriod('');
          // refresh data
          const fetched = await getAnalytics(currentUser.role === 'CUSTOMER' ? currentUser.companyId : null);
          setData(fetched);
        } catch (err) {
          setDeletePeriodStatus({ loading: false, error: err.message });
        }
      };

      const [savedReviews, setSavedReviews] = useState({});
      const [showReviewModal, setShowReviewModal] = useState(false);
      const [reviewModalPeriod, setReviewModalPeriod] = useState('');
      const [reviewLoadState, setReviewLoadState] = useState({ companyId: null, status: 'idle' });

      const handleOpenReview = useCallback((period = selectedPeriod) => {
        setReviewModalPeriod(period || selectedPeriod);
        setShowReviewModal(true);
      }, [selectedPeriod]);

      // Load saved leaderboard groups from Supabase when user changes
      useEffect(() => {
        if (currentUser && currentUser.id) {
          getLeaderboardGroups(currentUser.id).then(groups => {
            setSavedGroups(groups.map(g => ({ id: g.id, name: g.name, shops: g.shops })));
          }).catch(err => {
            console.error("Failed to load leaderboard groups:", err);
          });
        }
      }, [currentUser]);
      // Load reviews from Supabase when selectedCompany changes
      useEffect(() => {
        if (!selectedCompany) {
          setReviewLoadState({ companyId: null, status: 'idle' });
          return undefined;
        }

        let cancelled = false;
        setReviewLoadState({ companyId: selectedCompany, status: 'loading' });
        getConsultantReviews(selectedCompany).then(reviews => {
          if (cancelled) return;
          const formattedReviews = {};
          reviews.forEach(r => {
            formattedReviews[r.period] = {
              trendAnalysis: r.trend_analysis,
              improvements: r.improvements,
              timestamp: r.created_at
            };
          });
          setSavedReviews(prev => ({
            ...prev,
            [selectedCompany]: formattedReviews
          }));
          setReviewLoadState({ companyId: selectedCompany, status: 'ready' });
        }).catch(err => {
          if (cancelled) return;
          console.error("Failed to load reviews:", err);
          setReviewLoadState({ companyId: selectedCompany, status: 'error' });
        });

        return () => { cancelled = true; };
      }, [selectedCompany]);
      
      const handleSaveReview = async (period, trendAnalysis, improvements) => {
        if (!selectedCompany || !period) return;
        try {
          const saved = await saveConsultantReview(selectedCompany, period, trendAnalysis, improvements);
          setSavedReviews(prev => ({
            ...prev,
            [selectedCompany]: {
              ...prev[selectedCompany],
              [period]: { trendAnalysis: saved.trend_analysis, improvements: saved.improvements, timestamp: saved.created_at }
            }
          }));
          setReviewLoadState({ companyId: selectedCompany, status: 'ready' });
        } catch (err) {
          console.error("Failed to save review:", err);
          showAppNotice("Failed to save review: " + err.message);
        }
      };

      useEffect(() => {
        const requestId = dashboardLayoutRequestRef.current + 1;
        dashboardLayoutRequestRef.current = requestId;

        if (!selectedCompany) {
          setDashboardVisibleKpis([...DEFAULT_DASHBOARD_KPI_TITLES]);
          setDashboardLayoutState({ status: 'idle', dirty: false, error: null });
          return undefined;
        }

        setDashboardVisibleKpis([...DEFAULT_DASHBOARD_KPI_TITLES]);
        setDashboardLayoutState({ status: 'loading', dirty: false, error: null });

        getDashboardKpiLayout(selectedCompany).then(layout => {
          if (dashboardLayoutRequestRef.current !== requestId) return;
          setDashboardVisibleKpis(normalizeDashboardKpiTitles(layout?.visible_kpis));
          setDashboardLayoutState({ status: 'saved', dirty: false, error: null });
        }).catch(err => {
          if (dashboardLayoutRequestRef.current !== requestId) return;
          console.error('Failed to load dashboard layout:', err);
          setDashboardVisibleKpis([...DEFAULT_DASHBOARD_KPI_TITLES]);
          setDashboardLayoutState({
            status: 'error',
            dirty: false,
            error: err.message || 'The saved layout could not be loaded.'
          });
        });

        return undefined;
      }, [selectedCompany]);

      const handleDashboardVisibleKpisChange = useCallback((nextTitles) => {
        dashboardLayoutRequestRef.current += 1;
        setDashboardVisibleKpis(normalizeDashboardKpiTitles(nextTitles));
        setDashboardLayoutState({ status: 'dirty', dirty: true, error: null });
      }, []);

      const handleSaveDashboardLayout = useCallback(async () => {
        if (!selectedCompany || dashboardLayoutState.status === 'saving') return;

        const requestId = dashboardLayoutRequestRef.current + 1;
        dashboardLayoutRequestRef.current = requestId;
        const companyId = selectedCompany;
        const visibleKpis = normalizeDashboardKpiTitles(dashboardVisibleKpis);
        setDashboardLayoutState({ status: 'saving', dirty: true, error: null });

        try {
          const saved = await upsertDashboardKpiLayout(companyId, visibleKpis);
          if (dashboardLayoutRequestRef.current !== requestId) return;
          setDashboardVisibleKpis(normalizeDashboardKpiTitles(saved?.visible_kpis, visibleKpis));
          setDashboardLayoutState({ status: 'saved', dirty: false, error: null });
          showAppNotice('Dashboard layout saved for this bodyshop.', 'success');
        } catch (err) {
          if (dashboardLayoutRequestRef.current !== requestId) return;
          console.error('Failed to save dashboard layout:', err);
          setDashboardLayoutState({
            status: 'error',
            dirty: true,
            error: err.message || 'The layout could not be saved.'
          });
        }
      }, [dashboardLayoutState.status, dashboardVisibleKpis, selectedCompany, showAppNotice]);

      useEffect(() => {
        if (!selectedCompany) {
          setBenchmarks({});
          setBenchmarkLoadState({ companyId: null, status: 'idle' });
          return undefined;
        }

        let cancelled = false;
        setBenchmarks({});
        setBenchmarkLoadState({ companyId: selectedCompany, status: 'loading' });
        getBenchmarks(selectedCompany).then(rows => {
          if (cancelled) return;
          setBenchmarks(rows.reduce((acc, row) => {
            acc[row.kpi_key] = { target: Number(row.target) };
            return acc;
          }, {}));
          setBenchmarkLoadState({ companyId: selectedCompany, status: 'ready' });
        }).catch(err => {
          if (cancelled) return;
          console.error("Failed to load benchmarks:", err);
          setBenchmarkLoadState({ companyId: selectedCompany, status: 'error' });
        });

        return () => { cancelled = true; };
      }, [selectedCompany]);

      const handleOpenBenchmarkEditor = useCallback((kpiTitle) => {
        if (!selectedCompany || currentUserRole !== 'ADMIN') return;
        const definition = DASHBOARD_KPI_DEFINITIONS.find(item => item.title === kpiTitle);
        if (!definition || definition.targetable === false) return;
        setBenchmarkMutation({ loading: false, error: null });
        setTargetEditorMetric(kpiTitle);
      }, [currentUserRole, selectedCompany]);

      const handleCloseBenchmarkEditor = useCallback(() => {
        if (benchmarkMutation.loading) return;
        setTargetEditorMetric(null);
        setBenchmarkMutation({ loading: false, error: null });
      }, [benchmarkMutation.loading]);

      const handleSaveBenchmark = useCallback(async (target) => {
        if (!selectedCompany || !targetEditorMetric || currentUserRole !== 'ADMIN') return;
        setBenchmarkMutation({ loading: true, error: null });
        try {
          const saved = await upsertBenchmark(selectedCompany, targetEditorMetric, target);
          setBenchmarks(prev => ({ ...prev, [targetEditorMetric]: { target: Number(saved.target) } }));
          setBenchmarkLoadState({ companyId: selectedCompany, status: 'ready' });
          setTargetEditorMetric(null);
          setBenchmarkMutation({ loading: false, error: null });
        } catch (err) {
          console.error("Failed to save benchmark:", err);
          setBenchmarkMutation({ loading: false, error: err.message || 'The target could not be saved.' });
        }
      }, [currentUserRole, selectedCompany, targetEditorMetric]);

      const handleRemoveBenchmark = useCallback(async () => {
        if (!selectedCompany || !targetEditorMetric || currentUserRole !== 'ADMIN') return;
        setBenchmarkMutation({ loading: true, error: null });
        try {
          await deleteBenchmark(selectedCompany, targetEditorMetric);
          setBenchmarks(prev => {
            const next = { ...prev };
            delete next[targetEditorMetric];
            return next;
          });
          setBenchmarkLoadState({ companyId: selectedCompany, status: 'ready' });
          setTargetEditorMetric(null);
          setBenchmarkMutation({ loading: false, error: null });
        } catch (err) {
          console.error("Failed to delete benchmark:", err);
          setBenchmarkMutation({ loading: false, error: err.message || 'The target could not be removed.' });
        }
      }, [currentUserRole, selectedCompany, targetEditorMetric]);

      useEffect(() => {
        setTargetEditorMetric(null);
        setBenchmarkMutation({ loading: false, error: null });
      }, [selectedCompany]);

      // Force selectedCompany for CUSTOMER role
      useEffect(() => {
        if (currentUserRole === 'CUSTOMER' && currentUserCompanyId) {
          // A bodyshop still needs its profile and consultant reviews before
          // the first analytics upload exists, so selection cannot depend on
          // finding an analytics row.
          setSelectedCompany(currentUserCompanyId);
        }
      }, [currentUserRole, currentUserCompanyId]);

      // CSV parsing
      const handleFile = useCallback((file) => {
        if (!file) return;
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              const errs = results.errors.map(e => e.message).join('\\n');
              showAppNotice('CSV parsing errors: ' + errs);
            }
            if (results.data && results.data.length > 0) {
              const requiredCols = ['Company Id', 'Company Name', 'Year', 'Month', 'Total Sales', 'Paint Sales', 'Paint Labour Costs', 'Completed RO'];
              const firstRow = results.data[0];
              const missingCols = requiredCols.filter(col => !(col in firstRow));
              if (missingCols.length > 0) {
                showAppNotice('Missing required columns: ' + missingCols.join(', '));
                return;
              }

              uploadAnalytics(results.data).then(() => {
                  return getAnalytics(currentUserRole === 'CUSTOMER' ? currentUserCompanyId : null);
              }).then(fetchedData => {
                 setData(fetchedData);
                 showAppNotice('CSV data imported successfully.', 'success');
              }).catch(err => {
                 console.error(err);
                 showAppNotice('Upload failed: ' + err.message);
              });
            }
          },
        });
      }, [currentUserRole, currentUserCompanyId, showAppNotice]);

      const handleQuickKpiSave = useCallback(async ({ period, metricKey, value }) => {
        if (!selectedCompany) throw new Error('Select a bodyshop before entering a KPI value.');
        const companyId = selectedCompany;
        const [year, month] = period.split('-').map(Number);
        await upsertAnalyticsValue(companyId, year, month, metricKey, value);
        const fetchedData = await getAnalytics(currentUserRole === 'CUSTOMER' ? currentUserCompanyId : null);
        setData(fetchedData);
        setSelectedCompany(companyId);
        setSelectedPeriod(period);
        showAppNotice(`${metricKey} saved for ${MONTH_NAMES[month]} ${year}.`, 'success');
      }, [currentUserCompanyId, currentUserRole, selectedCompany, showAppNotice]);

      const handleExport = useCallback(() => {
        if (!data || data.length === 0) return;
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bodyshop_data_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, [data]);

      const resetDashboard = useCallback(() => {
        setData([]);
        setSelectedCompany('');
        setSelectedPeriod('');
        setMetricLibraryOpen(false);
      }, []);

      // Derived: unique companies
      const companies = useMemo(() => {
        if (currentUser?.role === 'ADMIN') {
          return allCompanies.map(c => c.id).sort();
        }
        const set = new Set(data.map(r => r['Company Id']).filter(Boolean));
        return [...set].sort();
      }, [data, allCompanies, currentUser]);

      const selectedCompanyProfile = useMemo(
        () => allCompanies.find(company => company.id === selectedCompany) || null,
        [allCompanies, selectedCompany]
      );
      const pageMeta = PAGE_META[activeTab] || PAGE_META.dashboard;

      // Auto-select first company
      useEffect(() => {
        if (companies.length > 0 && !selectedCompany) setSelectedCompany(companies[0]);
      }, [companies, selectedCompany]);

      // Filter by company
      const companyData = useMemo(() => {
        if (!selectedCompany) return data;
        return data.filter(r => r['Company Id'] === selectedCompany);
      }, [data, selectedCompany]);

      // Sorted unique periods
      const uniquePeriods = useMemo(() => {
        const all = companyData
          .map(r => ({ year: parseNum(r['Year']), month: parseNum(r['Month']) }))
          .sort((a, b) => a.year - b.year || a.month - b.month)
          .map(p => p.year + '-' + String(p.month).padStart(2, '0'));
        return [...new Set(all)];
      }, [companyData]);

      // Auto-select latest period
      useEffect(() => {
        if (uniquePeriods.length > 0 && (!selectedPeriod || uniquePeriods.indexOf(selectedPeriod) === -1)) {
          setSelectedPeriod(uniquePeriods[uniquePeriods.length - 1]);
        }
      }, [uniquePeriods, selectedPeriod]);

      const isMultiMonth = uniquePeriods.length > 1;
      const chartPeriodOptions = useMemo(() => {
        const anchorPeriod = selectedPeriod || uniquePeriods[uniquePeriods.length - 1];
        return filterPeriodsByTimeframe(uniquePeriods, anchorPeriod, 'ALL').map(period => {
          const [year, month] = period.split('-');
          return { value: period, label: `${MONTH_NAMES[parseInt(month)]} ${year}` };
        });
      }, [selectedPeriod, uniquePeriods]);

      // Current row
      const currentRow = useMemo(() => {
        if (!selectedPeriod) return companyData[0] || null;
        const parts = selectedPeriod.split('-');
        const y = parseInt(parts[0]), m = parseInt(parts[1]);
        return companyData.find(r => parseNum(r['Year']) === y && parseNum(r['Month']) === m) || null;
      }, [companyData, selectedPeriod]);

      // Previous row (chronologically prior)
      const prevRow = useMemo(() => {
        if (!isMultiMonth || !selectedPeriod) return null;
        const idx = uniquePeriods.indexOf(selectedPeriod);
        if (idx <= 0) return null;
        const prev = uniquePeriods[idx - 1];
        const parts = prev.split('-');
        const y = parseInt(parts[0]), m = parseInt(parts[1]);
        return companyData.find(r => parseNum(r['Year']) === y && parseNum(r['Month']) === m) || null;
      }, [companyData, isMultiMonth, selectedPeriod, uniquePeriods]);

      const selectedPeriodRollingRows = useMemo(() => {
        if (!selectedPeriod) return [];
        const [year, month] = selectedPeriod.split('-').map(Number);
        const targetTotalMonths = year * 12 + month;
        return companyData.filter(row => {
          const rowTotalMonths = parseNum(row['Year']) * 12 + parseNum(row['Month']);
          return rowTotalMonths <= targetTotalMonths && rowTotalMonths > targetTotalMonths - 3;
        });
      }, [companyData, selectedPeriod]);

      const rollingMetricValues = useMemo(() => Object.fromEntries(
        DASHBOARD_KPI_DEFINITIONS.map(definition => [definition.title, rollingMetricValue(definition.title, selectedPeriodRollingRows)])
      ), [selectedPeriodRollingRows]);

      const handleDataEdit = (key, val) => {
        if (!currentRow) return;
        setHasUnsavedChanges(true);
        setData(prev => prev.map(row => 
          (row['Company Id'] === currentRow['Company Id'] && parseNum(row['Year']) === parseNum(currentRow['Year']) && parseNum(row['Month']) === parseNum(currentRow['Month']))
            ? { ...row, [key]: val }
            : row
        ));
      };

      const handleSaveChanges = async () => {
        if (!currentRow) return;
        setIsSavingRow(true);
        try {
          await uploadAnalytics([currentRow]);
          setHasUnsavedChanges(false);
          showAppNotice('Changes saved successfully.', 'success');
        } catch (err) {
          showAppNotice('Failed to save changes: ' + err.message);
        } finally {
          setIsSavingRow(false);
        }
      };

      const handleCreatePeriod = useCallback((year, month) => {
        if (!selectedCompany) return;
        const y = Number(year);
        const m = Number(month);
        const exists = data.some(r => r['Company Id'] === selectedCompany && parseNum(r['Year']) === y && parseNum(r['Month']) === m);
        if (exists) return;

        // Find existing row to copy structure (with 0 values)
        const templateRow = data.find(r => r['Company Id'] === selectedCompany) || (data[0] || {});
        const newRow = { ...templateRow, 'Year': y, 'Month': m };
        Object.keys(newRow).forEach(k => {
          if (!['Company Id', 'Company Name', 'State', 'Year', 'Month'].includes(k)) {
            newRow[k] = 0;
          }
        });
        
        setData(prev => [...prev, newRow]);
        setHasUnsavedChanges(true);
        setShowCreatePeriodModal(false);
        const periodStr = `${y}-${String(m).padStart(2, '0')}`;
        // Give React a tiny tick to update uniquePeriods
        setTimeout(() => setSelectedPeriod(periodStr), 50);
      }, [selectedCompany, data]);

      // Variance helper
      function calcVariance(field, isDerived, derivedType) {
        if (!prevRow || !currentRow) return null;
        let curr, prev;
        if (isDerived) {
          if (derivedType === 'return') {
            const currentSales = parseNum(currentRow['Paint Sales']);
            const currentLabour = parseNum(currentRow['Paint Labour Costs']);
            const previousSales = parseNum(prevRow['Paint Sales']);
            const previousLabour = parseNum(prevRow['Paint Labour Costs']);
            curr = Number.isFinite(currentSales) && Number.isFinite(currentLabour) && currentLabour > 0 ? currentSales / currentLabour : null;
            prev = Number.isFinite(previousSales) && Number.isFinite(previousLabour) && previousLabour > 0 ? previousSales / previousLabour : null;
          } else if (derivedType === 'revPerVehicle') {
            const currentSales = parseNum(currentRow['Paint Sales']);
            const currentCompleted = parseNum(currentRow['Completed RO']);
            const previousSales = parseNum(prevRow['Paint Sales']);
            const previousCompleted = parseNum(prevRow['Completed RO']);
            curr = Number.isFinite(currentSales) && Number.isFinite(currentCompleted) && currentCompleted > 0 ? currentSales / currentCompleted : null;
            prev = Number.isFinite(previousSales) && Number.isFinite(previousCompleted) && previousCompleted > 0 ? previousSales / previousCompleted : null;
          } else if (derivedType === 'dailyBudget') {
            const currentLabour = parseNum(currentRow['Paint Labour Costs']);
            const previousLabour = parseNum(prevRow['Paint Labour Costs']);
            curr = Number.isFinite(currentLabour) ? (currentLabour * 3.3) / 19.33 : null;
            prev = Number.isFinite(previousLabour) ? (previousLabour * 3.3) / 19.33 : null;
          } else if (derivedType === 'paintCostToTotalSales') {
            const currentCostPerRO = parseNum(currentRow['Paint Cost per RO']);
            const currentCompleted = parseNum(currentRow['Completed RO']);
            const currentSales = parseNum(currentRow['Total Sales']);
            const previousCostPerRO = parseNum(prevRow['Paint Cost per RO']);
            const previousCompleted = parseNum(prevRow['Completed RO']);
            const previousSales = parseNum(prevRow['Total Sales']);
            curr = Number.isFinite(currentCostPerRO) && Number.isFinite(currentCompleted) && Number.isFinite(currentSales) && currentSales > 0 ? (currentCostPerRO * currentCompleted) / currentSales : null;
            prev = Number.isFinite(previousCostPerRO) && Number.isFinite(previousCompleted) && Number.isFinite(previousSales) && previousSales > 0 ? (previousCostPerRO * previousCompleted) / previousSales : null;
          } else if (derivedType === 'liquidCostRatio') {
            const currentCostPerRO = parseNum(currentRow['Paint Cost per RO']);
            const currentCompleted = parseNum(currentRow['Completed RO']);
            const currentSales = parseNum(currentRow['Paint Sales']);
            const previousCostPerRO = parseNum(prevRow['Paint Cost per RO']);
            const previousCompleted = parseNum(prevRow['Completed RO']);
            const previousSales = parseNum(prevRow['Paint Sales']);
            curr = Number.isFinite(currentCostPerRO) && Number.isFinite(currentCompleted) && Number.isFinite(currentSales) && currentSales > 0 ? (currentCostPerRO * currentCompleted) / currentSales : null;
            prev = Number.isFinite(previousCostPerRO) && Number.isFinite(previousCompleted) && Number.isFinite(previousSales) && previousSales > 0 ? (previousCostPerRO * previousCompleted) / previousSales : null;
          } else {
            return null;
          }
        } else {
          curr = parseNum(currentRow[field]);
          prev = parseNum(prevRow[field]);
        }
        if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) return null;
        return ((curr - prev) / Math.abs(prev)) * 100;
      }



      const trendChartData = useMemo(() => {
        if (!isMultiMonth || uniquePeriods.length === 0) return null;
        
        // Anchor the story to the reporting period the customer selected.
        const anchorPeriod = selectedPeriod || uniquePeriods[uniquePeriods.length - 1];
        const chartPeriods = filterPeriodsByTimeframe(uniquePeriods, anchorPeriod, chartTimeframe, chartCustomRange);

        const labels = [];
        const dataPoints = [];
        const config = KPI_CONFIG[selectedKpi];
        
        if (!config) return null;

        chartPeriods.forEach(p => {
          const pParts = p.split('-');
          const py = parseInt(pParts[0]);
          const pm = parseInt(pParts[1]);
          const row = companyData.find(r => parseNum(r['Year']) === py && parseNum(r['Month']) === pm);
          labels.push(MONTH_NAMES[pm] + ' ' + py);
          dataPoints.push(row ? config.getValue(row) : null);
        });

        return {
          labels,
          format: config.format,
          datasets: [
            {
              label: selectedKpi,
              data: dataPoints,
              borderColor: '#00a896',
              backgroundColor: 'rgba(0, 168, 150, 0.12)',
              fill: true,
              tension: 0.4,
              cubicInterpolationMode: 'monotone',
              pointRadius: 5,
              pointBackgroundColor: '#00a896',
              pointBorderWidth: 0,
              pointHoverRadius: 7,
              borderWidth: 2.5,
            }
          ]
        };
      }, [isMultiMonth, uniquePeriods, companyData, selectedKpi, chartTimeframe, chartCustomRange, selectedPeriod]);

      // KPIs
      const kpis = useMemo(() => {
        if (!currentRow) {
          return {
            totalSales: 0,
            paintSales: 0,
            paintLabourCosts: 0,
            completedRO: 0,
            paintCostPerRO: 0,
            paintCostToTotalSales: 0,
            vpdPerBooth: 0,
            boothCycleTime: 0,
            returnOnPaintLabour: 0,
            liquidCostRatio: 0,
            paintRevPerVehicle: 0,
            actualDailyRevenue: 0,
            dailyBudget: 0,
            rollingMonths: 0
          };
        }
        const paintSales = parseNum(currentRow['Paint Sales']);
        const paintLabourCosts = parseNum(currentRow['Paint Labour Costs']);
        const totalSales = parseNum(currentRow['Total Sales']);
        const completedRO = parseNum(currentRow['Completed RO']);
        const paintCostPerRO = parseNum(currentRow['Paint Cost per RO']);

        // Calculate Rolling Quarter for Daily Budget & Actual Revenue
        let rollingPaintSales = 0;
        let rollingPaintLabourCosts = 0;
        let paintSalesMonthsFound = 0;
        let labourCostMonthsFound = 0;
        
        if (companyData.length > 0) {
          const selectedTotalMonths = parseNum(currentRow['Year']) * 12 + parseNum(currentRow['Month']);

          companyData.forEach(r => {
            const rowTotalMonths = parseNum(r['Year']) * 12 + parseNum(r['Month']);
            if (rowTotalMonths <= selectedTotalMonths && rowTotalMonths > selectedTotalMonths - 3) {
              const rowPaintSales = parseNum(r['Paint Sales']);
              const rowLabourCosts = parseNum(r['Paint Labour Costs']);
              if (Number.isFinite(rowPaintSales)) {
                rollingPaintSales += rowPaintSales;
                paintSalesMonthsFound++;
              }
              if (Number.isFinite(rowLabourCosts)) {
                rollingPaintLabourCosts += rowLabourCosts;
                labourCostMonthsFound++;
              }
            }
          });
        }

        const avgMonthlyPaintSales = paintSalesMonthsFound > 0 ? rollingPaintSales / paintSalesMonthsFound : null;
        const avgMonthlyLabourCosts = labourCostMonthsFound > 0 ? rollingPaintLabourCosts / labourCostMonthsFound : null;

        return {
          totalSales,
          completedRO,
          paintSales: paintSales,
          paintCostPerRO,
          paintCostToTotalSales: Number.isFinite(totalSales) && totalSales > 0 && Number.isFinite(paintCostPerRO) && Number.isFinite(completedRO) ? (paintCostPerRO * completedRO) / totalSales : null,
          vpdPerBooth: parseNum(currentRow['Vehicles per Day per Booth']),
          boothCycleTime: parseNum(currentRow['Booth Cycle Time']),
          returnOnPaintLabour: Number.isFinite(paintLabourCosts) && paintLabourCosts > 0 && Number.isFinite(paintSales) ? paintSales / paintLabourCosts : null,
          liquidCostRatio: Number.isFinite(paintSales) && paintSales > 0 && Number.isFinite(paintCostPerRO) && Number.isFinite(completedRO) ? (paintCostPerRO * completedRO) / paintSales : null,
          paintRevPerVehicle: Number.isFinite(completedRO) && completedRO > 0 && Number.isFinite(paintSales) ? paintSales / completedRO : null,
          dailyBudget: Number.isFinite(avgMonthlyLabourCosts) ? (avgMonthlyLabourCosts * 3.3) / 19.33 : null,
          actualDailyRevenue: Number.isFinite(avgMonthlyPaintSales) ? avgMonthlyPaintSales / 19.33 : null,
          rollingMonths: labourCostMonthsFound
        };
      }, [currentRow, companyData]);

      // Rankings calculation
      const ranks = useMemo(() => {
        if (!selectedCompany || !selectedPeriod || leaderboardCohort.length === 0 || !leaderboardCohort.includes(selectedCompany)) return null;
        
        const parts = selectedPeriod.split('-');
        const targetYear = parseInt(parts[0]);
        const targetMonth = parseInt(parts[1]);
        const targetTotalMonths = targetYear * 12 + targetMonth;
        
        // Filter data for the last 3 months
        const rollingData = data.filter(r => {
          if (!leaderboardCohort.includes(r['Company Id'])) return false;
          const y = parseNum(r['Year']);
          const m = parseNum(r['Month']);
          const totalMonths = y * 12 + m;
          return totalMonths <= targetTotalMonths && totalMonths > targetTotalMonths - 3;
        });

        if (rollingData.length === 0) return null;

        // Group by company
        const companyAverages = {};
        leaderboardCohort.forEach(comp => {
          const compData = rollingData.filter(r => r['Company Id'] === comp);
          if (compData.length > 0) {
            companyAverages[comp] = compData;
          }
        });

        if (!companyAverages[selectedCompany]) return null;

        const getAvgVal = (compName, kpi) => {
          const compData = companyAverages[compName];
          if (!compData || compData.length === 0) return 0;
          
          if (kpi === 'Return on Paint Labour') {
             const sumSales = compData.reduce((sum, r) => sum + parseNum(r['Paint Sales']), 0);
             const sumCosts = compData.reduce((sum, r) => sum + parseNum(r['Paint Labour Costs']), 0);
             return sumCosts > 0 ? (sumSales / sumCosts) : 0;
          }
          if (kpi === 'Paint Revenue P/V') {
             const sumSales = compData.reduce((sum, r) => sum + parseNum(r['Paint Sales']), 0);
             const sumRO = compData.reduce((sum, r) => sum + parseNum(r['Completed RO']), 0);
             return sumRO > 0 ? (sumSales / sumRO) : 0;
          }
          if (kpi === 'Paint Cost to Total Sales' || kpi === 'Paint Cost / Total Sales') {
             const sumCosts = compData.reduce((sum, r) => sum + ((parseNum(r['Paint Cost per RO']) || 0) * (parseNum(r['Completed RO']) || 0)), 0);
             const sumSales = compData.reduce((sum, r) => sum + (parseNum(r['Total Sales']) || 0), 0);
             return sumSales > 0 ? (sumCosts / sumSales) : 0;
          }
          if (kpi === 'Liquid Cost to Refinish Labour Sales' || kpi === 'Liquid Cost to Refinish') {
             const sumCosts = compData.reduce((sum, r) => sum + ((parseNum(r['Paint Cost per RO']) || 0) * (parseNum(r['Completed RO']) || 0)), 0);
             const sumSales = compData.reduce((sum, r) => sum + (parseNum(r['Paint Sales']) || 0), 0);
             return sumSales > 0 ? (sumCosts / sumSales) : 0;
          }
          const sum = compData.reduce((acc, r) => acc + parseNum(r[kpi]), 0);
          return sum / compData.length;
        };

        const computeRank = (kpi, type) => {
          const vals = Object.keys(companyAverages).map(compName => ({
            company: compName,
            val: getAvgVal(compName, kpi)
          }));
          vals.sort((a, b) => type === 'max' ? a.val - b.val : b.val - a.val);
          const currentValObj = vals.find(v => v.company === selectedCompany);
          if (!currentValObj) return null;
          const rankIdx = vals.findIndex(v => Math.abs(v.val - currentValObj.val) < 0.000001);
          return rankIdx !== -1 ? { rank: rankIdx + 1, avgVal: currentValObj.val } : null;
        };

        return {
          totalSales: computeRank('Total Sales', 'min'),
          completedRO: computeRank('Completed RO', 'min'),
          paintSales: computeRank('Paint Sales', 'min'),
          paintCostPerRO: computeRank('Paint Cost per RO', 'max'),
          paintCostToTotalSales: computeRank('Paint Cost to Total Sales', 'max'),
          vpdPerBooth: computeRank('Vehicles per Day per Booth', 'min'),
          boothCycleTime: computeRank('Booth Cycle Time', 'max'),
          returnOnPaintLabour: computeRank('Return on Paint Labour', 'min'),
          liquidCostRatio: computeRank('Liquid Cost to Refinish Labour Sales', 'max'),
          paintRevPerVehicle: computeRank('Paint Revenue P/V', 'min'),
          cohortSize: Object.keys(companyAverages).length
        };
      }, [data, selectedPeriod, leaderboardCohort, selectedCompany]);

      const activeRankAvgFormatted = useMemo(() => {
        if (!ranks) return null;
        let avg = null;
        let format = 'number';
        switch (selectedKpi) {
          case 'Completed RO': avg = ranks.completedRO?.avgVal; format = 'number'; break;
          case 'Paint Sales': avg = ranks.paintSales?.avgVal; format = 'currency'; break;
          case 'Paint Cost / RO': avg = ranks.paintCostPerRO?.avgVal; format = 'currency'; break;
          case 'Paint Cost / Total Sales': avg = ranks.paintCostToTotalSales?.avgVal; format = 'percent'; break;
          case 'VPD / Per Booth': avg = ranks.vpdPerBooth?.avgVal; format = 'number'; break;
          case 'Booth Cycle Time': avg = ranks.boothCycleTime?.avgVal; format = 'number'; break;
          case 'Return on Paint Labour': avg = ranks.returnOnPaintLabour?.avgVal; format = 'percentWhole'; break;
          case 'Liquid Cost to Refinish': avg = ranks.liquidCostRatio?.avgVal; format = 'percent'; break;
          case 'Total Sales': avg = ranks.totalSales?.avgVal; format = 'currency'; break;
          case 'Paint Revenue P/V': avg = ranks.paintRevPerVehicle?.avgVal; format = 'currency'; break;
        }
        if (avg === null || avg === undefined) return null;
        if (format === 'currency') return '$' + avg.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
        if (format === 'percent') return (avg * 100).toFixed(2) + '%';
        if (format === 'percentWhole') return (avg * 100).toFixed(0) + '%';
        return avg.toFixed(1);
      }, [ranks, selectedKpi]);

      const dashboardKpiItems = DASHBOARD_KPI_DEFINITIONS.map((definition, index) => ({
        ...definition,
        value: Number.isFinite(kpis[definition.valueKey]) ? kpis[definition.valueKey] : metricValueFromRow(definition.title, currentRow),
        previousValue: metricValueFromRow(definition.title, prevRow),
        rollingAverage: rollingMetricValues[definition.title],
        rollingMonths: selectedPeriodRollingRows.length,
        variance: calcVariance(...definition.varianceArgs),
        benchmark: definition.targetable === false ? undefined : benchmarks[definition.title]?.target,
        benchmarkStatus: definition.targetable === false
          ? 'ready'
          : benchmarkLoadState.companyId === selectedCompany ? benchmarkLoadState.status : 'loading',
        rank: ranks?.[definition.rankKey],
        cohortSize: ranks?.cohortSize,
        description: KPI_CONFIG[definition.title]?.description,
        delayClass: `card-appear-${(index % 4) + 1}`
      }));
      const reportingPeriodLabel = selectedPeriod
        ? `${MONTH_NAMES[parseInt(selectedPeriod.split('-')[1])]} ${selectedPeriod.split('-')[0]}`
        : 'Latest available period';
      const previousReportingPeriodLabel = prevRow
        ? `${MONTH_NAMES[parseNum(prevRow['Month'])]} ${parseNum(prevRow['Year'])}`
        : null;
      const dashboardCompany = selectedCompanyProfile || (selectedCompany ? {
        id: selectedCompany,
        name: currentRow?.['Company Name'] || selectedCompany,
        painters_count: currentRow?.painters_count || 0,
        panel_beaters_count: currentRow?.panel_beaters_count || 0,
        booths_count: currentRow?.booths_count || 0
      } : null);
      const dashboardDataStatusTone = uniquePeriods.length === 0
        ? 'empty'
        : selectedPeriod === uniquePeriods[uniquePeriods.length - 1] ? 'current' : 'historical';
      const availableReviewEntries = Object.entries(savedReviews[selectedCompany] || {})
        .filter(([period]) => !selectedPeriod || period <= selectedPeriod)
        .sort(([periodA], [periodB]) => periodB.localeCompare(periodA));
      const latestReviewEntry = availableReviewEntries[0] || null;
      const dashboardConsultantReview = latestReviewEntry ? {
        period: latestReviewEntry[0],
        periodLabel: `${MONTH_NAMES[parseInt(latestReviewEntry[0].split('-')[1])]} ${latestReviewEntry[0].split('-')[0]}`,
        ...latestReviewEntry[1]
      } : null;
      const dashboardConsultantReviewStatus = reviewLoadState.companyId === selectedCompany ? reviewLoadState.status : 'loading';
      const targetEditorDefinition = DASHBOARD_KPI_DEFINITIONS.find(definition => definition.title === targetEditorMetric) || null;

      // Render Logic
      if (loading) {
        return (
          <div className="min-h-screen bg-surface-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        );
      }

      if (requirePasswordSet) {
        return <SetPasswordScreen onComplete={() => setRequirePasswordSet(false)} />;
      }

      if (!currentUser) {
        return <LoginScreen />;
      }

      // The empty state early return has been removed, replaced by an overlay in the main layout.
      // Render: Dashboard
      return (
        <div className="cpr-codex-shell min-h-screen bg-surface-900 lg:flex">
          <AppSidebar
            activeTab={activeTab}
            onNavigate={setActiveTab}
            currentUser={currentUser}
            viewingAsCompany={Boolean(customerViewCompanyId)}
            collapsed={sidebarCollapsed}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
            onOpenReviews={() => handleOpenReview(selectedPeriod)}
            hasNotification={Boolean(selectedPeriod && savedReviews[selectedCompany]?.[selectedPeriod])}
            onLogout={handleLogout}
          />

          <div className={`app-main-shell flex min-w-0 flex-1 flex-col ${activeTab === 'dashboard' && metricLibraryOpen ? 'metrics-panel-open' : ''}`}>
            <Header
              pageTitle={activeTab === 'dashboard' && dashboardCompany?.name ? `Welcome, ${dashboardCompany.name}` : pageMeta.title}
              pageDescription={pageMeta.description}
              onMenuToggle={() => { setMetricLibraryOpen(false); setMobileNavOpen(value => !value); }}
              mobileNavOpen={mobileNavOpen}
              desktopNavHidden={sidebarCollapsed}
              onDesktopNavToggle={() => setSidebarCollapsed(value => !value)}
              showMetricLibraryToggle={activeTab === 'dashboard' && Boolean(currentRow)}
              metricLibraryOpen={metricLibraryOpen}
              onMetricLibraryToggle={() => { setMobileNavOpen(false); handleDashboardCustomizeChange(!metricLibraryOpen); }}
              showOperationalKpiInfo={activeTab === 'dashboard' && Boolean(currentRow)}
              operationalKpiCount={DASHBOARD_KPI_DEFINITIONS.filter(definition => definition.pulseEligible === true).length}
              onReset={resetDashboard}
              showReset={activeTab === 'raw-data' && data.length > 0 && currentUser.role === 'ADMIN'}
              onExport={handleExport}
              showExport={data.length > 0 && currentUser.role === 'ADMIN' && !customerViewCompanyId && activeTab !== 'profile' && activeTab !== 'customers'}
              viewingAsCompanyName={customerViewCompanyId ? dashboardCompany?.name : null}
              onExitCustomerView={exitCustomerView}
            />
          <ConsultantReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            currentUser={customerViewCompanyId ? { ...currentUser, role: 'CUSTOMER' } : currentUser}
            selectedCompany={dashboardCompany?.name || selectedCompany}
            selectedPeriod={reviewModalPeriod || selectedPeriod}
            availablePeriods={uniquePeriods}
            companyReviews={savedReviews[selectedCompany] || {}}
            onSaveReview={handleSaveReview}
          />

          <BenchmarkTargetModal
            isOpen={Boolean(targetEditorMetric)}
            metric={targetEditorMetric}
            companyName={dashboardCompany?.name || selectedCompany}
            currentTarget={targetEditorMetric ? benchmarks[targetEditorMetric]?.target : undefined}
            benchmarkType={targetEditorDefinition?.benchmarkType}
            format={targetEditorDefinition?.format}
            isSaving={benchmarkMutation.loading}
            error={benchmarkMutation.error}
            onSave={handleSaveBenchmark}
            onRemove={handleRemoveBenchmark}
            onClose={handleCloseBenchmarkEditor}
          />

          <ReportingPeriodModal
            isOpen={showCreatePeriodModal}
            companyName={dashboardCompany?.name || selectedCompany}
            latestPeriod={uniquePeriods[uniquePeriods.length - 1]}
            existingPeriods={uniquePeriods}
            onCreate={handleCreatePeriod}
            onClose={handleCloseCreatePeriodModal}
          />

          {/* Delete Period Confirmation Modal */}
          {deleteConfirmPeriod && (
            <div className="codex-dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="codex-dialog relative w-full max-w-md p-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-danger-500/20 flex items-center justify-center mb-4 text-danger-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 text-center">Delete Period?</h3>
                <p className="text-surface-300 text-sm mb-6 text-center">
                  Are you absolutely sure you want to delete all data for <strong className="text-white">{MONTH_NAMES[parseInt(deleteConfirmPeriod.split('-')[1])]} {deleteConfirmPeriod.split('-')[0]}</strong>? 
                  This action cannot be undone.
                </p>
                
                {deletePeriodStatus.error && (
                  <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm p-3 rounded-lg mb-6">
                    {deletePeriodStatus.error}
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setDeleteConfirmPeriod(null)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:text-white transition-colors border border-surface-700 hover:bg-surface-800"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeDeletePeriod}
                    disabled={deletePeriodStatus.loading}
                    className="bg-danger-600 hover:bg-danger-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {deletePeriodStatus.loading ? 'Deleting...' : 'Yes, Delete Period'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="relative mx-auto w-full max-w-[1600px] flex-1 px-4 pb-16 sm:px-5 lg:px-6">
            {activeTab === 'dashboard' && analyticsStatus === 'loading' && (
              <section className="codex-surface mx-auto mt-8 max-w-2xl p-8" role="status" aria-label="Loading monthly dashboard">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-brand-400/10" aria-hidden="true" />
                  <div className="min-w-0 flex-1 space-y-2" aria-hidden="true">
                    <div className="h-3 w-40 animate-pulse rounded bg-surface-700/70" />
                    <div className="h-2.5 w-full max-w-md animate-pulse rounded bg-surface-800" />
                  </div>
                  <span className="text-xs font-medium text-surface-400">Loading dashboard…</span>
                </div>
              </section>
            )}

            {activeTab === 'dashboard' && analyticsStatus === 'error' && (
              <section className="codex-surface mx-auto mt-8 max-w-2xl p-8 text-center" role="alert">
                <h2 className="text-lg font-semibold text-white">Dashboard unavailable</h2>
                <p className="mt-2 text-sm text-surface-400">The latest reporting data could not be loaded. Refresh the page to try again.</p>
              </section>
            )}
            
            {/* Filters */}
            {activeTab !== 'dashboard' && activeTab !== 'customers' && (activeTab !== 'profile' || currentUser.role === 'ADMIN') && (
              <section className="flex flex-wrap items-center gap-4 my-6 animate-float-in" id="filters">
                {currentUser.role === 'ADMIN' && (
                  <FilterSelect id="filter-company" label="Company" value={selectedCompany}
                    onChange={(v) => { setSelectedCompany(v); setSelectedPeriod(''); }} options={companies} 
                    formatLabel={(compId) => {
                      const comp = allCompanies.find(c => c.id === compId);
                      if (comp) return `${compId} - ${comp.name}`;
                      const row = data.find(r => r['Company Id'] === compId);
                      return row ? `${row['Company Id']} - ${row['Company Name']}` : compId;
                    }} />
                )}
                {activeTab !== 'profile' && (
                  <FilterSelect id="filter-period" label="Period" value={selectedPeriod}
                    onChange={setSelectedPeriod} options={uniquePeriods}
                    formatLabel={(p) => { const parts = p.split('-'); return MONTH_NAMES[parseInt(parts[1])] + ' ' + parts[0]; }} />
                )}
                {activeTab !== 'profile' && (
                  <div className="ml-auto flex items-center gap-4 text-sm text-surface-400">
                  {currentUser.role === 'ADMIN' && (
                    <div className="flex items-center gap-1.5" title="Total customers on the platform">
                      <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <span><strong className="text-white">{allCompanies.length}</strong> Customers</span>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${uniquePeriods.length === 0 ? 'bg-surface-500' : 'bg-success-500 animate-pulse'}`}></span>
                      {uniquePeriods.length === 0 ? 'No data loaded' : (isMultiMonth ? uniquePeriods.length + ' months loaded' : 'Single month loaded')}
                    </div>
                    {uniquePeriods.length > 0 && (
                      <span className="text-[10px] text-surface-500 uppercase tracking-wider font-medium">vs previous month</span>
                    )}
                  </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'profile' && (
              <div className="mb-8">
                <ShopProfilePanel company={selectedCompanyProfile} onEdit={handleEditShopProfile} />
              </div>
            )}

            {activeTab === 'customers' && currentUser.role === 'ADMIN' && !customerViewCompanyId && (
              <CustomerManagement onOpenDashboard={enterCustomerView} />
            )}

            {activeTab === 'raw-data' && currentUser.role === 'ADMIN' && (
              <DataImportActions
                companyId={selectedCompany}
                companyName={selectedCompanyProfile?.name || currentRow?.['Company Name'] || selectedCompany}
                selectedPeriod={selectedPeriod}
                periods={uniquePeriods}
                rows={companyData}
                onFile={handleFile}
                onQuickSave={handleQuickKpiSave}
              />
            )}

            {activeTab === 'dashboard' && analyticsStatus === 'ready' && !currentRow && currentUser.role === 'ADMIN' && !customerViewCompanyId && (
              <div className="codex-surface mx-auto mt-8 max-w-2xl p-10 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-brand-300">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0-12l-4 4m4-4l4 4M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Your dashboard is ready for data</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-surface-400">Import a CSV or add individual KPI values from Data & Imports to populate the dashboard and trends.</p>
                <button type="button" onClick={() => setActiveTab('raw-data')} className="codex-button codex-button-primary mt-6 px-4 py-2.5 text-xs">
                  Go to Data & Imports
                </button>
              </div>
            )}

            {activeTab === 'dashboard' && analyticsStatus === 'ready' && !currentRow && (currentUser.role === 'CUSTOMER' || customerViewCompanyId) && (
              <div className="codex-surface mx-auto flex max-w-3xl flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-surface-800/80 rounded-full flex items-center justify-center border border-surface-700/50 mb-6 relative">
                  <div className="absolute inset-0 border border-brand-500/30 rounded-full animate-ping opacity-75"></div>
                  <svg className="w-10 h-10 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Awaiting Data</h3>
                <p className="text-surface-400 text-center max-w-md text-sm leading-relaxed">
                  Your dashboard is ready, but we are currently waiting for your latest analytics data to be processed and uploaded by CPR Analytics.
                </p>
              </div>
            )}

            {activeTab === 'leaderboards' && data.length === 0 && currentUser.role === 'ADMIN' && !customerViewCompanyId && (
               <div className="codex-surface mx-auto mt-8 max-w-2xl p-14 text-center">
                  <h2 className="text-2xl font-bold text-white mb-3">No Data Available</h2>
                  <p className="text-surface-400 text-sm">Upload data to generate Gamified Leaderboards.</p>
               </div>
            )}

            {activeTab === 'dashboard' && currentRow && (
              <DashboardWorkspace
                companies={companies}
                selectedCompany={selectedCompany}
                onCompanyChange={(value) => { setSelectedCompany(value); setSelectedPeriod(''); }}
                formatCompanyLabel={(companyId) => {
                  const companyOption = allCompanies.find(company => company.id === companyId);
                  return companyOption ? companyOption.name : companyId;
                }}
                isAdmin={currentUser.role === 'ADMIN' && !customerViewCompanyId}
                periods={uniquePeriods}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                formatPeriodLabel={(period) => {
                  const [year, month] = period.split('-');
                  return `${MONTH_NAMES[parseInt(month)]} ${year}`;
                }}
                company={dashboardCompany}
                items={dashboardKpiItems}
                selectedKpi={selectedKpi}
                onSelectKpi={setSelectedKpi}
                onSetBenchmark={handleOpenBenchmarkEditor}
                dailyActual={kpis.actualDailyRevenue}
                dailyTarget={kpis.dailyBudget}
                rollingMonths={kpis.rollingMonths}
                reportingPeriod={reportingPeriodLabel}
                previousPeriod={previousReportingPeriodLabel}
                dataStatusTone={dashboardDataStatusTone}
                consultantReview={dashboardConsultantReview}
                consultantReviewStatus={dashboardConsultantReviewStatus}
                onOpenConsultantReview={(period) => handleOpenReview(period || selectedPeriod)}
                trendData={isMultiMonth ? trendChartData : null}
                timeframe={chartTimeframe}
                onTimeframeChange={setChartTimeframe}
                periodOptions={chartPeriodOptions}
                customRange={chartCustomRange}
                onCustomRangeChange={setChartCustomRange}
                comparisonLabel={activeRankAvgFormatted ? `3M cohort avg ${activeRankAvgFormatted}` : null}
                navigationHidden={sidebarCollapsed}
                metricLibraryOpen={metricLibraryOpen}
                onCustomizeChange={handleDashboardCustomizeChange}
                visibleTitles={dashboardVisibleKpis}
                onVisibleTitlesChange={handleDashboardVisibleKpisChange}
                layoutSaveStatus={dashboardLayoutState.status}
                hasUnsavedLayout={dashboardLayoutState.dirty}
                layoutSaveError={dashboardLayoutState.error}
                onSaveLayout={handleSaveDashboardLayout}
              />
            )}

            {activeTab === 'raw-data' && data.length > 0 && currentUser.role === 'ADMIN' && (
              <section className="codex-surface mb-8 p-5 sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-700/60 flex items-center justify-center">
                    <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Full Month Editor <span className="text-surface-400 font-normal text-sm ml-2">({selectedPeriod ? (MONTH_NAMES[parseInt(selectedPeriod.split('-')[1])] + ' ' + selectedPeriod.split('-')[0]) : 'None'})</span></h3>
                    <p className="mt-1 text-xs text-surface-500">Edit all KPI values for this month.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPeriod && (
                    <button onClick={() => setDeleteConfirmPeriod(selectedPeriod)} className="codex-button codex-button-danger flex items-center gap-1.5 px-3 py-2 text-xs" title="Delete current period">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete Period
                    </button>
                  )}
                  <button onClick={() => setShowCreatePeriodModal(true)} className="codex-button codex-button-secondary flex items-center gap-1.5 px-3 py-2 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add New Period
                  </button>
                  {selectedPeriod && (
                    <button onClick={handleSaveChanges} disabled={isSavingRow || !hasUnsavedChanges} className={`codex-button flex items-center gap-1.5 px-3 py-2 text-xs disabled:opacity-50 ${hasUnsavedChanges ? 'codex-button-primary' : 'codex-button-secondary'}`}>
                      {isSavingRow ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                      )}
                      {hasUnsavedChanges ? 'Save Changes *' : 'Saved'}
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-5">
                {currentRow && Object.keys(currentRow).filter(k => !['Company Id', 'Company Name', 'State', 'Year', 'Month', 'painters_count', 'panel_beaters_count', 'admin_count', 'estimators_count', 'managers_count', 'booths_count'].includes(k)).map(key => (
                  <div key={key} className="flex flex-col">
                    <label className="text-[9px] text-surface-400 uppercase tracking-wider mb-1.5 truncate" title={key}>{key}</label>
                    <input type="text" value={currentRow[key]} onChange={(e) => handleDataEdit(key, e.target.value)}
                      className="codex-input px-2.5 py-2 text-xs" />
                  </div>
                ))}
              </div>
            </section>
            )}

            {activeTab === 'leaderboards' && data.length > 0 && currentUser.role === 'ADMIN' && (
              <section className="codex-surface mb-8 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-base">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Gamified Leaderboard Configuration</h3>
                    <p className="text-xs text-surface-400">Select which companies are participating in the competitive ranking system.</p>
                  </div>
                </div>
                
                {savedGroups.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-surface-300 mb-3">Saved Groups</h4>
                    <div className="flex flex-wrap gap-2">
                      {savedGroups.map(group => (
                        <div key={group.id} className="group relative flex cursor-pointer items-center rounded-lg border border-white/[0.07] bg-white/[0.025] py-1 pl-3 pr-1 transition-colors hover:bg-white/[0.05]"
                          onClick={() => setLeaderboardCohort(group.shops)}>
                          <span className="text-xs text-surface-200 mr-2 font-medium">{group.name} <span className="text-surface-500 font-normal">({group.shops.length})</span></span>
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await deleteLeaderboardGroup(group.id);
                              setSavedGroups(prev => prev.filter(g => g.id !== group.id));
                            } catch (err) {
                              console.error("Failed to delete group:", err);
                              showAppNotice("Failed to delete group: " + err.message);
                            }
                          }} className="w-5 h-5 rounded-full flex items-center justify-center text-surface-500 hover:bg-danger-500/20 hover:text-danger-400 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                          
                          {/* Tooltip Popover */}
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-surface-800 border border-surface-700 shadow-xl rounded-lg p-3 z-50 pointer-events-none">
                            <p className="text-[10px] uppercase tracking-wider text-surface-400 mb-2 font-semibold border-b border-surface-700 pb-1">Shops in {group.name}</p>
                            <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                              {group.shops.map(s => (
                                <li key={s} className="text-xs text-surface-200 truncate">{s}</li>
                              ))}
                            </ul>
                            <div className="absolute left-4 top-full w-2 h-2 bg-surface-800 border-r border-b border-surface-700 transform rotate-45 -mt-1"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {companies.map(comp => (
                    <div key={comp} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.045]"
                      onClick={() => {
                        setLeaderboardCohort(prev => 
                          prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
                        );
                      }}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${leaderboardCohort.includes(comp) ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-500'}`}>
                        {leaderboardCohort.includes(comp) && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-surface-200">{comp}</span>
                    </div>
                  ))}
                </div>
                
                {leaderboardCohort.length === 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm">
                    Select at least two companies to activate the ranking system on their KPI cards.
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-surface-700/50 flex flex-col sm:flex-row sm:items-center gap-3">
                  <input type="text" value={groupNameInput} onChange={(e) => setGroupNameInput(e.target.value)} placeholder="Enter group name (e.g. OEM Tier 1)"
                    className="codex-input w-full px-3 py-2 text-sm sm:w-64" />
                  <button 
                    onClick={async () => {
                      if (groupNameInput.trim() && leaderboardCohort.length > 0 && currentUser?.id) {
                        try {
                          const newGroup = await createLeaderboardGroup(currentUser.id, groupNameInput.trim(), leaderboardCohort);
                          setSavedGroups(prev => [...prev, { id: newGroup.id, name: newGroup.name, shops: newGroup.shops }]);
                          setGroupNameInput('');
                        } catch (err) {
                          console.error("Failed to create group:", err);
                          showAppNotice("Failed to create group: " + err.message);
                        }
                      }
                    }}
                    disabled={!groupNameInput.trim() || leaderboardCohort.length === 0}
                    className="codex-button codex-button-primary flex-shrink-0 px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50">
                    Save Selection as Group
                  </button>
                </div>
              </section>
            )}
          </main>

          <footer className="border-t border-surface-800 py-6 text-center text-xs text-surface-500">
            <p>CPR Analytics · Automotive Refinishing Consultancy Dashboard</p>
          </footer>

          {appNotice ? (
            <div
              role={appNotice.tone === 'error' ? 'alert' : 'status'}
              className={`fixed bottom-5 right-5 z-[90] max-w-sm rounded-xl border bg-[#191b1e] px-4 py-3 text-xs font-medium shadow-2xl ${appNotice.tone === 'success' ? 'border-success-500/25 text-success-400' : 'border-danger-500/25 text-danger-400'}`}
            >
              {appNotice.message}
            </div>
          ) : null}
          
          {/* Shop Profile Modal */}
          {showShopProfileModal && (
            <div className="codex-dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="codex-dialog relative w-full max-w-md p-6">
                <button 
                  onClick={() => setShowShopProfileModal(false)}
                  className="absolute top-4 right-4 text-surface-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h3 className="text-xl font-bold text-white mb-2">Edit Shop Profile</h3>
                <p className="text-surface-400 text-sm mb-6">Update the staff and facility metrics for this location.</p>
                
                <form onSubmit={handleSaveShopProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">Painters</label>
                      <input type="number" min="0" required value={shopProfileForm.painters_count} onChange={e => setShopProfileForm({...shopProfileForm, painters_count: e.target.value})} className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">Panel Beaters</label>
                      <input type="number" min="0" required value={shopProfileForm.panel_beaters_count} onChange={e => setShopProfileForm({...shopProfileForm, panel_beaters_count: e.target.value})} className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">Booths</label>
                      <input type="number" min="0" required value={shopProfileForm.booths_count} onChange={e => setShopProfileForm({...shopProfileForm, booths_count: e.target.value})} className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">Estimators</label>
                      <input type="number" min="0" required value={shopProfileForm.estimators_count} onChange={e => setShopProfileForm({...shopProfileForm, estimators_count: e.target.value})} className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">Prod. Managers</label>
                      <input type="number" min="0" required value={shopProfileForm.managers_count} onChange={e => setShopProfileForm({...shopProfileForm, managers_count: e.target.value})} className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">Admin Staff</label>
                      <input type="number" min="0" required value={shopProfileForm.admin_count} onChange={e => setShopProfileForm({...shopProfileForm, admin_count: e.target.value})} className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowShopProfileModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-surface-300 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(0,168,150,0.3)] transition-all">Save Profile</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </div>
        </div>
      );
    }

    // Mount
  export default App;
