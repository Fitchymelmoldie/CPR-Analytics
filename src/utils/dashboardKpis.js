export const DASHBOARD_KPI_DEFINITIONS = [
  {
    title: 'Total Sales', valueKey: 'totalSales', format: 'currency', varianceArgs: ['Total Sales'], benchmarkType: 'min', rankKey: 'totalSales', targetable: false, category: 'business', pulseEligible: false, defaultVisible: false,
    iconPath: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Completed RO', valueKey: 'completedRO', format: 'number', varianceArgs: ['Completed RO'], benchmarkType: 'min', rankKey: 'completedRO', category: 'operations', pulseEligible: true, defaultVisible: true,
    iconPath: 'M9 3.75H6.75A2.25 2.25 0 004.5 6v13.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H15M9 3.75a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 5.25v-1.5zm0 9.75 2.25 2.25 4.5-4.5'
  },
  {
    title: 'Paint Sales', valueKey: 'paintSales', format: 'currency', varianceArgs: ['Paint Sales'], benchmarkType: 'min', rankKey: 'paintSales', targetable: false, category: 'business', pulseEligible: false, defaultVisible: false,
    iconPath: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763'
  },
  {
    title: 'Paint Cost / RO', valueKey: 'paintCostPerRO', format: 'currency', varianceArgs: ['Paint Cost per RO'], benchmarkType: 'max', rankKey: 'paintCostPerRO', category: 'paint', pulseEligible: true, defaultVisible: true,
    iconPath: 'M3 6h18v12H3V6zm3 3h.01M18 15h.01M9 12a3 3 0 106 0 3 3 0 00-6 0z'
  },
  {
    title: 'Paint Cost / Total Sales', valueKey: 'paintCostToTotalSales', format: 'percent', varianceArgs: [null, true, 'paintCostToTotalSales'], benchmarkType: 'max', rankKey: 'paintCostToTotalSales', category: 'paint', pulseEligible: true, defaultVisible: true,
    iconPath: 'M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z'
  },
  {
    title: 'VPD / Per Booth', valueKey: 'vpdPerBooth', format: 'number', varianceArgs: ['Vehicles per Day per Booth'], benchmarkType: 'min', rankKey: 'vpdPerBooth', category: 'operations', pulseEligible: true, defaultVisible: true,
    iconPath: 'M4.5 19.5v-12a3 3 0 013-3h9a3 3 0 013 3v12M7.5 19.5v-9h9v9M7.5 13.5h9M7.5 16.5h9'
  },
  {
    title: 'Booth Cycle Time', valueKey: 'boothCycleTime', format: 'number', varianceArgs: ['Booth Cycle Time'], benchmarkType: 'max', rankKey: 'boothCycleTime', category: 'operations', pulseEligible: true, defaultVisible: true,
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Return on Paint Labour', valueKey: 'returnOnPaintLabour', format: 'percentWhole', varianceArgs: [null, true, 'return'], benchmarkType: 'min', rankKey: 'returnOnPaintLabour', category: 'labour', pulseEligible: true, defaultVisible: true,
    iconPath: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z'
  },
  {
    title: 'Liquid Cost to Refinish', valueKey: 'liquidCostRatio', format: 'percent', varianceArgs: [null, true, 'liquidCostRatio'], benchmarkType: 'max', rankKey: 'liquidCostRatio', category: 'paint', pulseEligible: true, defaultVisible: true,
    iconPath: 'M12 2.25s-7.5 7.5-7.5 11.25a7.5 7.5 0 0015 0C19.5 9.75 12 2.25 12 2.25zm3.5 11.25A3.5 3.5 0 0013 10'
  },
  {
    title: 'Paint Revenue P/V', valueKey: 'paintRevPerVehicle', format: 'currency', varianceArgs: [null, true, 'revPerVehicle'], benchmarkType: 'min', rankKey: 'paintRevPerVehicle', category: 'paint', pulseEligible: true, defaultVisible: true,
    iconPath: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5v12H3.75v-12zM15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
  },
  {
    title: 'Panel Sales', format: 'currency', varianceArgs: ['Panel Sales'], benchmarkType: 'min', targetable: false, category: 'revenue', pulseEligible: false, defaultVisible: false,
    iconPath: 'M3.75 4.5h16.5v15H3.75v-15zm3.75 3h9m-9 4.5h6m-6 4.5h4.5'
  },
  {
    title: 'Part Sales', format: 'currency', varianceArgs: ['Part Sales'], benchmarkType: 'min', targetable: false, category: 'revenue', pulseEligible: false, defaultVisible: false,
    iconPath: 'M4.5 7.5 12 3l7.5 4.5v9L12 21l-7.5-4.5v-9zM12 12l7.5-4.5M12 12 4.5 7.5M12 12v9'
  },
  {
    title: 'Other Sales', format: 'currency', varianceArgs: ['Other Sales'], benchmarkType: 'min', targetable: false, category: 'revenue', pulseEligible: false, defaultVisible: false,
    iconPath: 'M12 6v12m-6-6h12M4.5 4.5h15v15h-15v-15z'
  },
  {
    title: 'Sales per RO', format: 'currency', varianceArgs: ['Sales per RO'], benchmarkType: 'min', targetable: false, category: 'revenue', pulseEligible: false, defaultVisible: false,
    iconPath: 'M6 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75zm3 4.5h6m-6 3.75h6m-6 3.75h3'
  },
  {
    title: 'Effective Labour Rate', format: 'currency', varianceArgs: ['Effective Labour Rate'], benchmarkType: 'min', targetable: false, category: 'labour', pulseEligible: false, defaultVisible: false,
    iconPath: 'M12 6v6l3.75 2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Effective Labour Cost', format: 'currency', varianceArgs: ['Effective Labour Cost'], benchmarkType: 'max', targetable: false, category: 'labour', pulseEligible: false, defaultVisible: false,
    iconPath: 'M12 8.25c-1.657 0-3 .84-3 1.875S10.343 12 12 12s3 .84 3 1.875S13.657 15.75 12 15.75m0-7.5V6.75m0 9v1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Total Gross Profit $', format: 'currency', varianceArgs: ['Total Gross Profit $'], benchmarkType: 'min', targetable: false, category: 'profitability', pulseEligible: false, defaultVisible: false,
    iconPath: 'M3.75 18.75 9 13.5l3.75 3.75 7.5-9M15.75 8.25h4.5v4.5'
  },
  {
    title: 'Total Gross Profit %', format: 'percent', varianceArgs: ['Total Gross Profit %'], benchmarkType: 'min', targetable: false, category: 'profitability', pulseEligible: false, defaultVisible: false,
    iconPath: 'M7.5 16.5 16.5 7.5M8.25 7.5h.008v.008H8.25V7.5zm7.5 9h.008v.008h-.008V16.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Overall Efficiency', format: 'percent', varianceArgs: ['Overall Efficiency'], benchmarkType: 'min', targetable: false, category: 'efficiency', pulseEligible: false, defaultVisible: false,
    iconPath: 'M4.5 19.5v-3.75m5 3.75V12m5 7.5V8.25m5 11.25V4.5'
  },
  {
    title: 'Panel Utilisation', format: 'percent', varianceArgs: ['Panel Utilisation'], benchmarkType: 'min', targetable: false, category: 'efficiency', pulseEligible: false, defaultVisible: false,
    iconPath: 'M3.75 12a8.25 8.25 0 1016.5 0 8.25 8.25 0 00-16.5 0zm8.25 0 4.5-4.5'
  },
  {
    title: 'Paint Utilisation', format: 'percent', varianceArgs: ['Paint Utilisation'], benchmarkType: 'min', targetable: false, category: 'efficiency', pulseEligible: false, defaultVisible: false,
    iconPath: 'M12 2.25s-6.75 7.03-6.75 11.25a6.75 6.75 0 0013.5 0C18.75 9.28 12 2.25 12 2.25z'
  },
  {
    title: 'Panel Productive Efficiency', format: 'percent', varianceArgs: ['Panel Productive Efficiency'], benchmarkType: 'min', targetable: false, category: 'efficiency', pulseEligible: false, defaultVisible: false,
    iconPath: 'M3.75 18.75 9 13.5l3.75 3.75 7.5-9M15.75 8.25h4.5v4.5'
  },
  {
    title: 'Paint Productive Efficiency', format: 'percent', varianceArgs: ['Paint Productive Efficiency'], benchmarkType: 'min', targetable: false, category: 'efficiency', pulseEligible: false, defaultVisible: false,
    iconPath: 'M3.75 18.75 9 13.5l3.75 3.75 7.5-9M15.75 8.25h4.5v4.5'
  },
  {
    title: 'Cycle Time Total (K2K)', format: 'number', varianceArgs: ['Cycle Time Total (K2K)'], benchmarkType: 'max', targetable: false, category: 'operations', pulseEligible: false, defaultVisible: false,
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Paint Hours per RO', format: 'number', varianceArgs: ['Paint Hours per RO'], benchmarkType: 'min', targetable: false, category: 'paint', pulseEligible: false, defaultVisible: false,
    iconPath: 'M6.75 3.75h10.5A2.25 2.25 0 0119.5 6v12a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V6a2.25 2.25 0 012.25-2.25zM8.25 8.25h7.5m-7.5 3.75h7.5m-7.5 3.75h4.5'
  },
  {
    title: 'Paint Consumables', format: 'currency', varianceArgs: ['Paint Consumables'], benchmarkType: 'max', targetable: false, category: 'paint', pulseEligible: false, defaultVisible: false,
    iconPath: 'M9.75 3.75h4.5v3h-4.5v-3zM8.25 6.75h7.5l1.5 3v10.5H6.75V9.75l1.5-3z'
  }
];

export const MAX_DASHBOARD_KPI_CARDS = 12;

export const DEFAULT_DASHBOARD_KPI_TITLES = DASHBOARD_KPI_DEFINITIONS
  .filter(definition => definition.defaultVisible)
  .map(definition => definition.title);

export function normalizeDashboardKpiTitles(titles, fallback = DEFAULT_DASHBOARD_KPI_TITLES) {
  if (!Array.isArray(titles)) return [...fallback];

  const knownTitles = new Set(DASHBOARD_KPI_DEFINITIONS.map(definition => definition.title));
  return [...new Set(titles)]
    .filter(title => typeof title === 'string' && knownTitles.has(title))
    .slice(0, MAX_DASHBOARD_KPI_CARDS);
}

export function targetIsMet(item) {
  if (item.targetable === false) return false;
  if (item.benchmark === undefined || item.benchmark === null) return false;
  return item.benchmarkType === 'max' ? item.value <= item.benchmark : item.value >= item.benchmark;
}

export function directionalVariance(item) {
  if (!item || !Number.isFinite(item.variance)) return null;
  return item.benchmarkType === 'max' ? -item.variance : item.variance;
}
