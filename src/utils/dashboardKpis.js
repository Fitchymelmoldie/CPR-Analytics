export const DASHBOARD_KPI_DEFINITIONS = [
  {
    title: 'Total Sales', valueKey: 'totalSales', format: 'currency', varianceArgs: ['Total Sales'], benchmarkType: 'min', rankKey: 'totalSales', targetable: false, category: 'business',
    iconPath: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Completed RO', valueKey: 'completedRO', format: 'number', varianceArgs: ['Completed RO'], benchmarkType: 'min', rankKey: 'completedRO',
    iconPath: 'M9 3.75H6.75A2.25 2.25 0 004.5 6v13.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H15M9 3.75a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 5.25v-1.5zm0 9.75 2.25 2.25 4.5-4.5'
  },
  {
    title: 'Paint Sales', valueKey: 'paintSales', format: 'currency', varianceArgs: ['Paint Sales'], benchmarkType: 'min', rankKey: 'paintSales', targetable: false, category: 'business',
    iconPath: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763'
  },
  {
    title: 'Paint Cost / RO', valueKey: 'paintCostPerRO', format: 'currency', varianceArgs: ['Paint Cost per RO'], benchmarkType: 'max', rankKey: 'paintCostPerRO',
    iconPath: 'M3 6h18v12H3V6zm3 3h.01M18 15h.01M9 12a3 3 0 106 0 3 3 0 00-6 0z'
  },
  {
    title: 'Paint Cost / Total Sales', valueKey: 'paintCostToTotalSales', format: 'percent', varianceArgs: [null, true, 'paintCostToTotalSales'], benchmarkType: 'max', rankKey: 'paintCostToTotalSales',
    iconPath: 'M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z'
  },
  {
    title: 'VPD / Per Booth', valueKey: 'vpdPerBooth', format: 'number', varianceArgs: ['Vehicles per Day per Booth'], benchmarkType: 'min', rankKey: 'vpdPerBooth',
    iconPath: 'M4.5 19.5v-12a3 3 0 013-3h9a3 3 0 013 3v12M7.5 19.5v-9h9v9M7.5 13.5h9M7.5 16.5h9'
  },
  {
    title: 'Booth Cycle Time', valueKey: 'boothCycleTime', format: 'number', varianceArgs: ['Booth Cycle Time'], benchmarkType: 'max', rankKey: 'boothCycleTime',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Return on Paint Labour', valueKey: 'returnOnPaintLabour', format: 'percentWhole', varianceArgs: [null, true, 'return'], benchmarkType: 'min', rankKey: 'returnOnPaintLabour',
    iconPath: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z'
  },
  {
    title: 'Liquid Cost to Refinish', valueKey: 'liquidCostRatio', format: 'percent', varianceArgs: [null, true, 'liquidCostRatio'], benchmarkType: 'max', rankKey: 'liquidCostRatio',
    iconPath: 'M12 2.25s-7.5 7.5-7.5 11.25a7.5 7.5 0 0015 0C19.5 9.75 12 2.25 12 2.25zm3.5 11.25A3.5 3.5 0 0013 10'
  },
  {
    title: 'Paint Revenue P/V', valueKey: 'paintRevPerVehicle', format: 'currency', varianceArgs: [null, true, 'revPerVehicle'], benchmarkType: 'min', rankKey: 'paintRevPerVehicle',
    iconPath: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5v12H3.75v-12zM15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
  }
];

export function targetIsMet(item) {
  if (item.targetable === false) return false;
  if (item.benchmark === undefined || item.benchmark === null) return false;
  return item.benchmarkType === 'max' ? item.value <= item.benchmark : item.value >= item.benchmark;
}

export function directionalVariance(item) {
  if (!Number.isFinite(item.variance)) return null;
  return item.benchmarkType === 'max' ? -item.variance : item.variance;
}
