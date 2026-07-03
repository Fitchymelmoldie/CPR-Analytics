import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense, lazy } from 'react';
import Papa from 'papaparse';
import ConsultantReviewModal from './ConsultantReviewModal';
import { parseNum, fmt, MONTH_NAMES, KPI_CONFIG } from './utils/metrics';
import { MOCK_HISTORICAL, MOCK_SINGLE } from './utils/mockData';
import KpiCard from './components/KpiCard';
import FilterSelect from './components/FilterSelect';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import SetPasswordScreen from './components/SetPasswordScreen';
import CustomerManagement from './components/CustomerManagement';
import { useAuth } from './components/AuthProvider';
import { uploadAnalytics, getAnalytics, updateShopProfile, deleteAnalyticsPeriod } from './services/db';

const ChartCanvas = lazy(() => import('./components/ChartCanvas'));

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

      const handleLogout = async () => {
        await signOut();
        setData([]);
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
      
      useEffect(() => {
        if (currentUser) {
          getAnalytics(currentUser.role === 'CUSTOMER' ? currentUser.companyId : null)
            .then(fetched => setData(fetched))
            .catch(err => console.error("DB Fetch Error:", err));
        }
      }, [currentUser]);
      const [selectedCompany, setSelectedCompany] = useState('');
      const [selectedPeriod, setSelectedPeriod] = useState('');
      const [activeTab, setActiveTab] = useState('dashboard');
      const [selectedKpi, setSelectedKpi] = useState('Completed RO');
      const [chartTimeframe, setChartTimeframe] = useState('YTD');
      const [dragOver, setDragOver] = useState(false);
      const [benchmarks, setBenchmarks] = useState({});
      const [leaderboardCohort, setLeaderboardCohort] = useState([]);
      const [savedGroups, setSavedGroups] = useState(() => {
        const saved = localStorage.getItem('bodyshop_saved_groups');
        return saved ? JSON.parse(saved) : [];
      });
      const [groupNameInput, setGroupNameInput] = useState('');
      
      const [showShopProfileModal, setShowShopProfileModal] = useState(false);
      const [shopProfileForm, setShopProfileForm] = useState({
        painters_count: 0, panel_beaters_count: 0, admin_count: 0, estimators_count: 0, managers_count: 0, booths_count: 0
      });

      const handleEditShopProfile = useCallback(() => {
        const comp = data.find(r => r['Company Id'] === selectedCompany);
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
      }, [data, selectedCompany]);

      const handleSaveShopProfile = async (e) => {
        e.preventDefault();
        try {
          await updateShopProfile(selectedCompany, shopProfileForm);
          setData(prev => prev.map(r => r['Company Id'] === selectedCompany ? { ...r, ...shopProfileForm } : r));
          setShowShopProfileModal(false);
        } catch (err) {
          console.error(err);
          window.alert("Failed to save profile: " + err.message);
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

      const [savedReviews, setSavedReviews] = useState(() => {
        const saved = localStorage.getItem('cpr_reviews');
        return saved ? JSON.parse(saved) : {};
      });
      const [showReviewModal, setShowReviewModal] = useState(false);

      useEffect(() => {
        localStorage.setItem('bodyshop_saved_groups', JSON.stringify(savedGroups));
      }, [savedGroups]);
      
      
      useEffect(() => {
        localStorage.setItem('cpr_reviews', JSON.stringify(savedReviews));
      }, [savedReviews]);
      
      const handleSaveReview = (period, trendAnalysis, improvements) => {
        if (!selectedCompany || !period) return;
        setSavedReviews(prev => ({
          ...prev,
          [selectedCompany]: {
            ...prev[selectedCompany],
            [period]: { trendAnalysis, improvements, timestamp: new Date().toISOString() }
          }
        }));
      };

      const fileInputRef = useRef(null);

      const handleSetBenchmark = (kpiTitle) => {
        const currentVal = benchmarks[kpiTitle]?.target !== undefined ? benchmarks[kpiTitle].target : '';
        const input = window.prompt(`Set benchmark target for ${kpiTitle}:`, currentVal);
        if (input !== null) {
          const val = parseFloat(input);
          if (!isNaN(val)) {
            setBenchmarks(prev => ({ ...prev, [kpiTitle]: { target: val } }));
          } else if (input.trim() === '') {
            setBenchmarks(prev => {
              const next = { ...prev };
              delete next[kpiTitle];
              return next;
            });
          }
        }
      };

      // Force selectedCompany for CUSTOMER role
      useEffect(() => {
        if (currentUser && currentUser.role === 'CUSTOMER') {
          const matchedRow = data.find(r => r['Company Id'] === currentUser.companyId);
          if (matchedRow) {
            setSelectedCompany(matchedRow['Company Id']);
          }
        }
      }, [currentUser, data]);

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
              window.alert('CSV Parsing errors:\\n' + errs);
            }
            if (results.data && results.data.length > 0) {
              const requiredCols = ['Company Id', 'Company Name', 'Year', 'Month', 'Total Sales', 'Paint Sales', 'Paint Labour Costs', 'Completed RO'];
              const firstRow = results.data[0];
              const missingCols = requiredCols.filter(col => !(col in firstRow));
              if (missingCols.length > 0) {
                window.alert('Missing required columns:\\n' + missingCols.join(', '));
                return;
              }

              uploadAnalytics(results.data).then(() => {
                 return getAnalytics(currentUser.role === 'CUSTOMER' ? currentUser.companyId : null);
              }).then(fetchedData => {
                 setData(fetchedData);
              }).catch(err => {
                 console.error(err);
                 window.alert('Upload to Supabase failed: ' + err.message);
              });
            }
          },
        });
      }, []);

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
      }, [data]);

      const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFile(file);
      }, [handleFile]);

      const onFileSelect = useCallback((e) => { handleFile(e.target.files?.[0]); }, [handleFile]);

      const loadMock = useCallback((type) => {
        setData(type === 'historical' ? [...MOCK_HISTORICAL] : [...MOCK_SINGLE]);
        setSelectedCompany('');
        setSelectedPeriod('');
      }, []);

      const resetDashboard = useCallback(() => {
        setData([]);
        setSelectedCompany('');
        setSelectedPeriod('');
      }, []);

      // Derived: unique companies
      const companies = useMemo(() => {
        const set = new Set(data.map(r => r['Company Id']).filter(Boolean));
        return [...set].sort();
      }, [data]);

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

      const handleDataEdit = (key, val) => {
        if (!currentRow) return;
        setData(prev => prev.map(row => 
          (row['Company Id'] === currentRow['Company Id'] && parseNum(row['Year']) === parseNum(currentRow['Year']) && parseNum(row['Month']) === parseNum(currentRow['Month']))
            ? { ...row, [key]: val }
            : row
        ));
      };

      const handleCreatePeriod = useCallback(() => {
        if (!selectedCompany) {
          window.alert('Please select a company first.');
          return;
        }
        const newYear = window.prompt('Enter Year (e.g. 2025):', '2025');
        if (!newYear || isNaN(parseInt(newYear))) return;
        const newMonth = window.prompt('Enter Month number (1-12):', '');
        if (!newMonth || isNaN(parseInt(newMonth)) || parseInt(newMonth) < 1 || parseInt(newMonth) > 12) return;
        
        const y = parseInt(newYear);
        const m = parseInt(newMonth);
        
        // Check if already exists
        const exists = data.some(r => r['Company Id'] === selectedCompany && parseNum(r['Year']) === y && parseNum(r['Month']) === m);
        if (exists) {
          window.alert('This period already exists for ' + selectedCompany);
          return;
        }
        
        // Find existing row to copy structure (with 0 values)
        const templateRow = data.find(r => r['Company Id'] === selectedCompany) || (data[0] || {});
        const newRow = { ...templateRow, 'Year': y, 'Month': m };
        Object.keys(newRow).forEach(k => {
          if (!['Company Id', 'Company Name', 'State', 'Year', 'Month'].includes(k)) {
            newRow[k] = 0;
          }
        });
        
        setData(prev => [...prev, newRow]);
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
            curr = parseNum(currentRow['Paint Labour Costs']) > 0 ? (parseNum(currentRow['Paint Sales']) / parseNum(currentRow['Paint Labour Costs'])) : 0;
            prev = parseNum(prevRow['Paint Labour Costs']) > 0 ? (parseNum(prevRow['Paint Sales']) / parseNum(prevRow['Paint Labour Costs'])) : 0;
          } else if (derivedType === 'revPerVehicle') {
            curr = parseNum(currentRow['Completed RO']) > 0 ? parseNum(currentRow['Paint Sales']) / parseNum(currentRow['Completed RO']) : 0;
            prev = parseNum(prevRow['Completed RO']) > 0 ? parseNum(prevRow['Paint Sales']) / parseNum(prevRow['Completed RO']) : 0;
          } else if (derivedType === 'dailyBudget') {
            curr = (parseNum(currentRow['Paint Labour Costs']) * 3.3) / 19.33;
            prev = (parseNum(prevRow['Paint Labour Costs']) * 3.3) / 19.33;
          } else {
            return null;
          }
        } else {
          curr = parseNum(currentRow[field]);
          prev = parseNum(prevRow[field]);
        }
        if (prev === 0 || isNaN(prev)) return null;
        return ((curr - prev) / Math.abs(prev)) * 100;
      }



      const trendChartData = useMemo(() => {
        if (!selectedPeriod || !isMultiMonth) return null;
        
        const parts = selectedPeriod.split('-');
        const targetYear = parseInt(parts[0]);
        const targetMonth = parseInt(parts[1]);
        const targetTotalMonths = targetYear * 12 + targetMonth;
        
        const chartPeriods = uniquePeriods.filter(p => {
          const pParts = p.split('-');
          const py = parseInt(pParts[0]);
          const pm = parseInt(pParts[1]);
          const pTotalMonths = py * 12 + pm;
          
          if (pTotalMonths > targetTotalMonths) return false;
          
          if (chartTimeframe === 'YTD') {
            return py === targetYear;
          } else if (chartTimeframe === '3M') {
            return (targetTotalMonths - pTotalMonths) < 3;
          } else if (chartTimeframe === '6M') {
            return (targetTotalMonths - pTotalMonths) < 6;
          } else if (chartTimeframe === '12M') {
            return (targetTotalMonths - pTotalMonths) < 12;
          } else { // ALL
            return true;
          }
        });

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
          dataPoints.push(row ? config.getValue(row) : 0);
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
              tension: 0.35,
              pointRadius: 5,
              pointBackgroundColor: '#00a896',
              pointBorderWidth: 0,
              pointHoverRadius: 7,
              borderWidth: 2.5,
            }
          ]
        };
      }, [selectedPeriod, isMultiMonth, uniquePeriods, companyData, selectedKpi, chartTimeframe]);

      // KPIs
      const kpis = useMemo(() => {
        if (!currentRow) {
          return {
            paintSales: 0,
            paintLabourCosts: 0,
            completedRO: 0,
            returnOnLabour: 0,
            paintRevPerVehicle: 0,
            actualDailyRevenue: 0,
            dailyBudget: 0,
            rollingMonths: 0
          };
        }
        const paintSales = parseNum(currentRow['Paint Sales']);
        const paintLabourCosts = parseNum(currentRow['Paint Labour Costs']);

        // Calculate Rolling Quarter for Daily Budget & Actual Revenue
        let rollingPaintSales = 0;
        let rollingPaintLabourCosts = 0;
        let monthsFound = 0;
        
        if (selectedPeriod && companyData.length > 0) {
          const parts = selectedPeriod.split('-');
          const targetTotalMonths = parseInt(parts[0]) * 12 + parseInt(parts[1]);
          
          companyData.forEach(r => {
            const rowTotalMonths = parseNum(r['Year']) * 12 + parseNum(r['Month']);
            if (rowTotalMonths <= targetTotalMonths && rowTotalMonths > targetTotalMonths - 3) {
              rollingPaintSales += parseNum(r['Paint Sales']);
              rollingPaintLabourCosts += parseNum(r['Paint Labour Costs']);
              monthsFound++;
            }
          });
        }
        
        if (monthsFound === 0) {
          rollingPaintSales = paintSales;
          rollingPaintLabourCosts = paintLabourCosts;
          monthsFound = 1;
        }

        return {
          totalSales: parseNum(currentRow['Total Sales']),
          completedRO: parseNum(currentRow['Completed RO']),
          paintSales: paintSales,
          paintCostPerRO: parseNum(currentRow['Paint Cost per RO']),
          paintCostToTotalSales: parseNum(currentRow['Paint Cost to Total Sales']),
          vpdPerBooth: parseNum(currentRow['Vehicles per Day per Booth']),
          boothCycleTime: parseNum(currentRow['Booth Cycle Time']),
          returnOnPaintLabour: paintLabourCosts > 0 ? (paintSales / paintLabourCosts) : 0,
          liquidCostRatio: parseNum(currentRow['Liquid Cost to Refinish Labour Sales']),
          paintRevPerVehicle: parseNum(currentRow['Completed RO']) > 0 ? paintSales / parseNum(currentRow['Completed RO']) : 0,
          dailyBudget: (rollingPaintLabourCosts * 3.3) / (monthsFound * 19.33),
          actualDailyRevenue: rollingPaintSales / (monthsFound * 19.33),
          rollingMonths: monthsFound
        };
      }, [currentRow, companyData, selectedPeriod]);

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
          case 'Return on Paint Labour': avg = ranks.returnOnPaintLabour?.avgVal; format = 'percent'; break;
          case 'Liquid Cost to Refinish': avg = ranks.liquidCostRatio?.avgVal; format = 'percent'; break;
          case 'Total Sales': avg = ranks.totalSales?.avgVal; format = 'currency'; break;
          case 'Paint Revenue P/V': avg = ranks.paintRevPerVehicle?.avgVal; format = 'currency'; break;
        }
        if (avg === null || avg === undefined) return null;
        if (format === 'currency') return '$' + avg.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
        if (format === 'percent') return avg.toFixed(1) + '%';
        return avg.toFixed(1);
      }, [ranks, selectedKpi]);

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
      const UploadUI = (
        <div className="flex-1 flex items-center justify-center px-4 py-16 w-full animate-float-in">
          <div className="w-full max-w-2xl">
            <div
              className={"relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer " +
                (dragOver ? 'drag-over border-brand-500' : 'border-surface-700 hover:border-surface-500')}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              id="upload-zone"
            >
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={onFileSelect} id="file-input" />
              <div className={"text-brand-400 mb-5 flex justify-center " + (dragOver ? '' : 'upload-pulse')}>
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{dragOver ? 'Drop your CSV here' : 'Upload Performance Data'}</h2>
              <p className="text-surface-400 text-sm max-w-md mx-auto">
                Drag and drop your bodyshop CSV file here, or click to browse.
              </p>
              <p className="text-surface-500 text-xs mt-2">Supports single-month and historical multi-month data.</p>
            </div>
          </div>
        </div>
      );

      // â”€â”€â”€â”€â”€â”€ Render: Dashboard â”€â”€â”€â”€â”€â”€
      return (
        <div className="min-h-screen flex flex-col">
          <Header 
            onReset={resetDashboard} 
            showReset 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onExport={handleExport} 
            showExport={data.length > 0} 
            hasNotification={selectedPeriod && savedReviews[selectedCompany]?.[selectedPeriod]}
            onNotificationClick={() => setShowReviewModal(true)}
          />
          <ConsultantReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            currentUser={currentUser}
            selectedCompany={selectedCompany}
            selectedPeriod={selectedPeriod}
            companyReviews={savedReviews[selectedCompany] || {}}
            onSaveReview={handleSaveReview}
          />

          {/* Delete Period Confirmation Modal */}
          {deleteConfirmPeriod && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass rounded-2xl w-full max-w-md p-6 border border-danger-500/30 shadow-2xl relative animate-scale-in">
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

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 relative">
            {/* ────── Render: Empty State Overlay for Customers ────── */}
            {data.length === 0 && currentUser.role === 'CUSTOMER' && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-md rounded-2xl mb-16 mt-6 border border-white/5 pointer-events-auto">
                <div className="glass rounded-2xl p-12 text-center border border-white/10 shadow-2xl max-w-lg w-full animate-float-in">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-800 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Awaiting Data</h2>
                  <p className="text-surface-400 text-sm max-w-md mx-auto">
                    Your consultancy dashboard is currently empty. Please wait for an administrator to upload the latest performance report for {currentUser.companyId}.
                  </p>
                </div>
              </div>
            )}
            
            {/* Filters */}
            {true && (
              <section className="flex flex-wrap items-center gap-4 my-6 animate-float-in" id="filters">
                {currentUser.role === 'ADMIN' && (
                  <FilterSelect id="filter-company" label="Company" value={selectedCompany}
                    onChange={(v) => { setSelectedCompany(v); setSelectedPeriod(''); }} options={companies} 
                    formatLabel={(compId) => {
                      const row = data.find(r => r['Company Id'] === compId);
                      return row ? `${row['Company Id']} - ${row['Company Name']}` : compId;
                    }} />
                )}
                <FilterSelect id="filter-period" label="Period" value={selectedPeriod}
                  onChange={setSelectedPeriod} options={uniquePeriods}
                  formatLabel={(p) => { const parts = p.split('-'); return MONTH_NAMES[parseInt(parts[1])] + ' ' + parts[0]; }} />
                <div className="ml-auto flex items-center gap-4 text-sm text-surface-400">
                  {currentUser.role === 'ADMIN' && (
                    <div className="flex items-center gap-1.5" title="Total customers on the platform">
                      <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <span><strong className="text-white">{companies.length}</strong> Customers</span>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
                      {isMultiMonth ? uniquePeriods.length + ' months loaded' : 'Single month loaded'}
                    </div>
                    <span className="text-[10px] text-surface-500 uppercase tracking-wider font-medium">All comparisons vs prev month</span>
                  </div>
                </div>
              </section>
            )}

            {/* Navigation Tabs and Shop Profile */}
            <div className="flex flex-col xl:flex-row xl:items-stretch justify-between gap-4 mb-8">
              <div className="flex space-x-2 glass rounded-xl p-1.5 w-max">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-brand-600/30 text-white shadow-lg border border-brand-500/50'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/80 border border-transparent'
                }`}
              >
                Visual Dashboard
              </button>
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('raw-data')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'raw-data'
                      ? 'bg-brand-600/30 text-white shadow-lg border border-brand-500/50'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/80 border border-transparent'
                  }`}
                >
                  Raw Data Adjustment
                </button>
              )}
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('leaderboards')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'leaderboards'
                      ? 'bg-brand-600/30 text-white shadow-lg border border-brand-500/50'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/80 border border-transparent'
                  }`}
                >
                  Gamified Leaderboards
                </button>
              )}
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'customers'
                      ? 'bg-brand-600/30 text-white shadow-lg border border-brand-500/50'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/80 border border-transparent'
                  }`}
                >
                  Customer Management
                </button>
              )}
              </div>
              
              {/* Shop Profile Banner */}
              {(activeTab === 'dashboard' || activeTab === 'raw-data') && selectedCompany && (
                <div className="glass rounded-xl p-1.5 flex items-stretch border border-surface-700/50 shadow-lg animate-fade-in w-max hide-scrollbar">
                  {(() => {
                    const comp = data.find(r => r['Company Id'] === selectedCompany);
                    if (!comp) return null;
                    
                    const stats = [
                      {
                        label: 'Painters',
                        value: comp.painters_count || 0,
                        icon: (
                          <svg className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 7V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4" />
                            <rect x="5" y="7" width="14" height="4" rx="1" />
                            <path d="M19 8h2a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-2" />
                            <path d="M9 11l-2 9h4l2-9" />
                            <path d="M12 11s1 2 1 3" />
                            <path d="M9 20v2" />
                          </svg>
                        )
                      },
                      {
                        label: 'Panel Beaters',
                        value: comp.panel_beaters_count || 0,
                        icon: (
                          <svg className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                        )
                      },
                      {
                        label: 'Booths',
                        value: comp.booths_count || 0,
                        icon: (
                          <svg className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-6 9 6" />
                            <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
                            <path d="M8 21v-7h8v7" />
                            <path d="M8 17h8" />
                          </svg>
                        )
                      },
                      {
                        label: 'Estimators',
                        value: comp.estimators_count || 0,
                        icon: (
                          <svg className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        )
                      },
                      {
                        label: 'Prod. Mgrs',
                        value: comp.managers_count || 0,
                        icon: (
                          <svg className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )
                      },
                      {
                        label: 'Admin',
                        value: comp.admin_count || 0,
                        icon: (
                          <svg className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )
                      }
                    ];

                    return (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1 border-r border-surface-700/50 hidden sm:flex">
                          <div className="p-1.5 bg-surface-700/50 rounded-lg">
                            <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-white leading-tight">Shop Profile</h3>
                            <p className="text-[9px] text-surface-400 uppercase tracking-wider">Facility & Staff</p>
                          </div>
                        </div>

                        <div className="grid grid-rows-2 grid-flow-col gap-x-4 gap-y-0.5 px-3 my-auto items-center justify-center">
                          {stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-surface-700/50 transition-all group cursor-default" title={stat.label}>
                              <div className="text-brand-400 group-hover:scale-110 transition-transform duration-300">
                                {stat.icon}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-white leading-none">{stat.value}</span>
                                <span className="text-[10px] text-surface-400 uppercase font-semibold tracking-wider group-hover:text-surface-300 transition-colors hidden md:block whitespace-nowrap">{stat.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pl-1 pr-0.5 py-1 ml-auto flex items-center justify-center border-l border-surface-700/50">
                          <button onClick={handleEditShopProfile} className="flex items-center justify-center p-1.5 rounded-lg hover:bg-brand-600/20 text-surface-400 hover:text-brand-300 transition-colors group" title="Edit Profile">
                            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {activeTab === 'customers' && currentUser.role === 'ADMIN' && (
              <CustomerManagement />
            )}

            {(activeTab === 'dashboard' || activeTab === 'raw-data') && data.length === 0 && currentUser.role === 'ADMIN' && UploadUI}

            {activeTab === 'leaderboards' && data.length === 0 && currentUser.role === 'ADMIN' && (
               <div className="glass rounded-2xl p-16 text-center border border-white/10 shadow-xl max-w-2xl mx-auto mt-8 animate-float-in">
                  <h2 className="text-2xl font-bold text-white mb-3">No Data Available</h2>
                  <p className="text-surface-400 text-sm">Upload data to generate Gamified Leaderboards.</p>
               </div>
            )}

            {activeTab === 'dashboard' && (
              <>
                {/* Daily Budget Reminder Banner */}
                {kpis && (
                  <div className="bg-gradient-to-r from-surface-800 to-surface-800/50 border border-brand-500/30 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg animate-float-in">
                     <div className="flex items-center gap-4 flex-1 w-full">
                       <div className="p-4 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(0,168,150,0.15)] hidden sm:block">
                         <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                         </svg>
                       </div>
                       
                       <div className="flex flex-col sm:flex-row gap-6 w-full justify-around items-center">
                         {/* Actual Daily Revenue */}
                         <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
                           <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider mb-1">Current Daily Actual</p>
                           <div className="flex items-baseline gap-2">
                             <p className={`text-3xl font-bold tracking-tight ${kpis.actualDailyRevenue >= kpis.dailyBudget ? 'text-success-400' : 'text-danger-400'}`}>
                               ${kpis.actualDailyRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                             </p>
                             <p className={`text-sm font-medium ${kpis.actualDailyRevenue >= kpis.dailyBudget ? 'text-success-400' : 'text-danger-400'}`}>/ day</p>
                           </div>
                           <p className={`text-xs mt-1 max-w-[200px] ${kpis.actualDailyRevenue >= kpis.dailyBudget ? 'text-success-400/80' : 'text-danger-400/80'}`}>Based on {kpis.rollingMonths}-month rolling paint sales.</p>
                         </div>
                         
                         {/* Separator */}
                         <div className="hidden sm:block w-px h-16 bg-surface-700/50"></div>

                         {/* Target Daily Budget */}
                         <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 pl-0 sm:pl-6">
                           <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider mb-1">3.3x Daily Target</p>
                           <div className="flex items-baseline gap-2">
                             <p className="text-3xl font-bold text-white tracking-tight">
                               ${kpis.dailyBudget.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                             </p>
                             <p className="text-sm font-medium text-brand-400">/ day</p>
                           </div>
                           <p className="text-xs text-brand-400/80 mt-1 max-w-[200px]">Based on {kpis.rollingMonths}-month rolling 3.3x profitability benchmark.</p>
                         </div>
                       </div>
                     </div>
                  </div>
                )}
                {/* KPI Scorecards */}
            {kpis && (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8" id="kpi-cards">
                <KpiCard title="Total Sales" value={kpis.totalSales} format="currency"
                  variance={calcVariance('Total Sales')} delayClass="card-appear-1"
                  isActive={selectedKpi === 'Total Sales'} onClick={() => setSelectedKpi('Total Sales')}
                  benchmark={benchmarks['Total Sales']?.target} benchmarkType="min" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.totalSales} cohortSize={ranks?.cohortSize}
                  iconPath="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <KpiCard title="Completed RO" value={kpis.completedRO} format="number"
                  variance={calcVariance('Completed RO')} delayClass="card-appear-1"
                  isActive={selectedKpi === 'Completed RO'} onClick={() => setSelectedKpi('Completed RO')}
                  benchmark={benchmarks['Completed RO']?.target} benchmarkType="min" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.completedRO} cohortSize={ranks?.cohortSize}
                  iconPath="M9 3.75H6.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H15M9 3.75A1.5 1.5 0 0110.5 2.25h3a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-1.5zm0 9.75l2.25 2.25 4.5-4.5" />
                <KpiCard title="Paint Sales" value={kpis.paintSales} format="currency"
                  variance={calcVariance('Paint Sales')} delayClass="card-appear-2"
                  isActive={selectedKpi === 'Paint Sales'} onClick={() => setSelectedKpi('Paint Sales')}
                  benchmark={benchmarks['Paint Sales']?.target} benchmarkType="min" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.paintSales} cohortSize={ranks?.cohortSize}
                  iconPath="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                <KpiCard title="Paint Cost / RO" value={kpis.paintCostPerRO} format="currency"
                  variance={calcVariance('Paint Cost per RO')} delayClass="card-appear-3"
                  isActive={selectedKpi === 'Paint Cost / RO'} onClick={() => setSelectedKpi('Paint Cost / RO')}
                  benchmark={benchmarks['Paint Cost / RO']?.target} benchmarkType="max" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.paintCostPerRO} cohortSize={ranks?.cohortSize}
                  iconPath="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                <KpiCard title="Paint Cost / Total Sales" value={kpis.paintCostToTotalSales} format="percent"
                  variance={calcVariance('Paint Cost to Total Sales')} delayClass="card-appear-4"
                  isActive={selectedKpi === 'Paint Cost / Total Sales'} onClick={() => setSelectedKpi('Paint Cost / Total Sales')}
                  benchmark={benchmarks['Paint Cost / Total Sales']?.target} benchmarkType="max" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.paintCostToTotalSales} cohortSize={ranks?.cohortSize}
                  iconPath="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                <KpiCard title="VPD / Per Booth" value={kpis.vpdPerBooth} format="number"
                  variance={calcVariance('Vehicles per Day per Booth')} delayClass="card-appear-1"
                  isActive={selectedKpi === 'VPD / Per Booth'} onClick={() => setSelectedKpi('VPD / Per Booth')}
                  benchmark={benchmarks['VPD / Per Booth']?.target} benchmarkType="min" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.vpdPerBooth} cohortSize={ranks?.cohortSize}
                  iconPath="M4.5 19.5v-12a3 3 0 013-3h9a3 3 0 013 3v12M7.5 19.5v-9h9v9M7.5 13.5h9M7.5 16.5h9" />
                <KpiCard title="Booth Cycle Time" value={kpis.boothCycleTime} format="number"
                  variance={calcVariance('Booth Cycle Time')} delayClass="card-appear-2"
                  isActive={selectedKpi === 'Booth Cycle Time'} onClick={() => setSelectedKpi('Booth Cycle Time')}
                  benchmark={benchmarks['Booth Cycle Time']?.target} benchmarkType="max" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.boothCycleTime} cohortSize={ranks?.cohortSize}
                  iconPath="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                <KpiCard title="Return on Paint Labour" value={kpis.returnOnPaintLabour} format="percent"
                  variance={calcVariance(null, true, 'return')} delayClass="card-appear-3"
                  isActive={selectedKpi === 'Return on Paint Labour'} onClick={() => setSelectedKpi('Return on Paint Labour')}
                  benchmark={benchmarks['Return on Paint Labour']?.target} benchmarkType="min" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.returnOnPaintLabour} cohortSize={ranks?.cohortSize}
                  iconPath="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                <KpiCard title="Liquid Cost to Refinish" value={kpis.liquidCostRatio} format="percent"
                  variance={calcVariance('Liquid Cost to Refinish Labour Sales')} delayClass="card-appear-4"
                  isActive={selectedKpi === 'Liquid Cost to Refinish'} onClick={() => setSelectedKpi('Liquid Cost to Refinish')}
                  benchmark={benchmarks['Liquid Cost to Refinish']?.target} benchmarkType="max" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.liquidCostRatio} cohortSize={ranks?.cohortSize}
                  iconPath="M12 2.25s-7.5 7.5-7.5 11.25a7.5 7.5 0 0015 0c0-3.75-7.5-11.25-7.5-11.25z M15.5 13.5a3.5 3.5 0 00-2.5-3.5" />
                <KpiCard title="Paint Revenue P/V" value={kpis.paintRevPerVehicle} format="currency"
                  variance={calcVariance(null, true, 'revPerVehicle')} delayClass="card-appear-1"
                  isActive={selectedKpi === 'Paint Revenue P/V'} onClick={() => setSelectedKpi('Paint Revenue P/V')}
                  benchmark={benchmarks['Paint Revenue P/V']?.target} benchmarkType="min" onSetBenchmark={handleSetBenchmark} isAdmin={currentUser?.role === 'ADMIN'}
                  rank={ranks?.paintRevPerVehicle} cohortSize={ranks?.cohortSize}
                  iconPath="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </section>
            )}

            {/* Charts */}
            <section className="mb-8" id="charts">
              {isMultiMonth && trendChartData ? (
                <div className="glass rounded-2xl p-6 card-appear card-appear-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                        {selectedKpi} Trend
                      </h3>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-surface-500">Historical timeline for {selectedKpi}</p>
                        {activeRankAvgFormatted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-800/80 border border-surface-700/50 text-[10px] font-medium text-brand-400 uppercase tracking-wider">
                            3M Avg: {activeRankAvgFormatted}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center bg-surface-800/80 rounded-lg p-1 border border-surface-700/50">
                      {['YTD', '3M', '6M', '12M', 'ALL'].map(tf => (
                        <button key={tf} onClick={() => setChartTimeframe(tf)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${chartTimeframe === tf ? 'bg-brand-600 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200'}`}>
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ChartCanvas type="line" data={trendChartData}
                    options={{
                      _yFormat: (v) => {
                        if (trendChartData.format === 'currency') return '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v);
                        if (trendChartData.format === 'percent') return (v * 100).toFixed(1) + '%';
                        return v;
                      },
                      _tooltipCallbacks: {
                        label: (ctx) => {
                          let val = ctx.raw;
                          if (trendChartData.format === 'currency') val = '$' + val.toLocaleString();
                          if (trendChartData.format === 'percent') val = (val * 100).toFixed(1) + '%';
                          return ctx.dataset.label + ': ' + val;
                        }
                      }
                    }}
                    height="320px" />
                </div>
              ) : (
                <div className="glass rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[300px] card-appear card-appear-1">
                  <div className="w-16 h-16 rounded-2xl bg-brand-800/50 flex items-center justify-center mb-5 text-brand-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Trend Visualization Locked</h3>
                  <p className="text-surface-400 text-sm max-w-md">
                    Upload historical data to unlock trend visualization.
                  </p>
                  <p className="text-surface-500 text-xs mt-1">Charts will show revenue trends, profitability, and efficiency comparisons over time.</p>
                  <button onClick={() => loadMock('historical')}
                    className="mt-6 px-5 py-2.5 bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 rounded-xl text-sm font-medium transition-all duration-200 border border-brand-600/30 hover:border-brand-500/50">
                    Load Mock Historical Data to Preview
                  </button>
                </div>
              )}
            </section>
              </>
            )}

            {activeTab === 'raw-data' && data.length > 0 && (
              <section className="glass rounded-2xl p-6 sm:p-8 card-appear card-appear-1 mb-8">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-700/60 flex items-center justify-center">
                    <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                  </div>
                  <h3 className="text-base font-semibold text-white">Manual Data Entry <span className="text-surface-400 font-normal text-sm ml-2">({selectedPeriod ? (MONTH_NAMES[parseInt(selectedPeriod.split('-')[1])] + ' ' + selectedPeriod.split('-')[0]) : 'None'})</span></h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPeriod && (
                    <button onClick={() => setDeleteConfirmPeriod(selectedPeriod)} className="px-3 py-1.5 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5" title="Delete current period">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete Period
                    </button>
                  )}
                  <button onClick={handleCreatePeriod} className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add New Period
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-5">
                {currentRow && Object.keys(currentRow).filter(k => !['Company Id', 'Company Name', 'State', 'Year', 'Month'].includes(k)).map(key => (
                  <div key={key} className="flex flex-col">
                    <label className="text-[9px] text-surface-400 uppercase tracking-wider mb-1.5 truncate" title={key}>{key}</label>
                    <input type="text" value={currentRow[key]} onChange={(e) => handleDataEdit(key, e.target.value)}
                      className="bg-surface-800/80 border border-surface-700/60 rounded-md px-2.5 py-1.5 text-xs text-white focus:border-brand-500 focus:outline-none transition-colors" />
                  </div>
                ))}
              </div>
            </section>
            )}

            {activeTab === 'leaderboards' && data.length > 0 && (
              <section className="glass rounded-2xl p-6 sm:p-8 card-appear card-appear-1 mb-8">
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
                        <div key={group.id} className="group relative flex items-center bg-surface-800/80 border border-surface-700 hover:border-brand-500/50 rounded-full pl-3 pr-1 py-1 transition-colors cursor-pointer"
                          onClick={() => setLeaderboardCohort(group.shops)}>
                          <span className="text-xs text-surface-200 mr-2 font-medium">{group.name} <span className="text-surface-500 font-normal">({group.shops.length})</span></span>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setSavedGroups(prev => prev.filter(g => g.id !== group.id));
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
                    <div key={comp} className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700/50 hover:bg-surface-700/50 transition-colors cursor-pointer"
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
                    className="bg-surface-800/80 border border-surface-700/60 rounded-md px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none transition-colors w-full sm:w-64" />
                  <button 
                    onClick={() => {
                      if (!groupNameInput.trim() || leaderboardCohort.length === 0) return;
                      setSavedGroups(prev => [...prev, { id: Date.now(), name: groupNameInput.trim(), shops: [...leaderboardCohort] }]);
                      setGroupNameInput('');
                    }}
                    disabled={!groupNameInput.trim() || leaderboardCohort.length === 0}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors flex-shrink-0">
                    Save Selection as Group
                  </button>
                </div>
              </section>
            )}
          </main>

          <footer className="border-t border-surface-800 py-6 text-center text-xs text-surface-500">
            <p>CPR Analytics Â· Automotive Refinishing Consultancy Dashboard</p>
          </footer>
          
          {/* Shop Profile Modal */}
          {showShopProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass rounded-2xl w-full max-w-md p-6 border border-surface-700 shadow-2xl relative animate-scale-in">
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
      );
    }

    // â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â•  Mount â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
  export default App;
