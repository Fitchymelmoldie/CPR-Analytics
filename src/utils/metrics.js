export function parseNum(v) {
  if (v == null || String(v).trim() === '') return null;
  const s = String(v).replace(/[,\$]/g, '').trim();
  const isPercent = s.endsWith('%');
  let n = parseFloat(s.replace('%', ''));
  if (isNaN(n)) return null;
  if (isPercent) n = n / 100;
  return n;
}

export function fmt(v, type) {
  if (v === null || v === undefined) return '';
  const n = Number(v);
  if (type === 'currency') return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (type === 'percent') return (n * 100).toFixed(2) + '%';
  return n.toLocaleString('en-AU', { maximumFractionDigits: 1 });
}

export const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const KPI_CONFIG = {
  'Total Sales': {
    format: 'currency',
    getValue: (row) => parseNum(row['Total Sales']),
    benchmarkType: 'min',
    description: 'Total revenue generated across all departments'
  },
  'Sales per RO': {
    format: 'currency',
    getValue: (row) => parseNum(row['Sales per RO']),
    benchmarkType: 'min',
    description: 'Average revenue generated per Repair Order'
  },
  'Completed RO': {
    format: 'number',
    getValue: (row) => parseNum(row['Completed RO']),
    benchmarkType: 'min',
    description: 'Total number of Repair Orders completed in the period'
  },
  'Overall Efficiency': {
    format: 'percent',
    getValue: (row) => parseNum(row['Overall Efficiency']),
    benchmarkType: 'min',
    description: 'Combined productive efficiency across panel and paint'
  },
  'Total Gross Profit %': {
    format: 'percent',
    getValue: (row) => parseNum(row['Total Gross Profit %']),
    benchmarkType: 'min',
    description: 'Total gross profit margin as a percentage of sales'
  },
  'Paint Sales': {
    format: 'currency',
    getValue: (row) => parseNum(row['Paint Sales']),
    benchmarkType: 'min',
    description: 'Total paint sales revenue'
  },
  'Paint Cost / Total Sales': {
    format: 'percent',
    getValue: (row) => {
      const paintCost = (parseNum(row['Paint Cost per RO']) || 0) * (parseNum(row['Completed RO']) || 0);
      const totalSales = parseNum(row['Total Sales']) || 0;
      return totalSales > 0 ? (paintCost / totalSales) : 0;
    },
    benchmarkType: 'max',
    description: 'Ratio of paint costs to total business revenue'
  },
  'Paint Cost / RO': {
    format: 'currency',
    getValue: (row) => parseNum(row['Paint Cost per RO']),
    benchmarkType: 'max',
    description: 'Average cost of paint materials per Repair Order'
  },
  'Booth Cycle Time': {
    format: 'number',
    getValue: (row) => parseNum(row['Booth Cycle Time']),
    benchmarkType: 'max',
    description: 'Average hours a vehicle spends in the spray booth'
  },
  'Liquid Cost to Refinish': {
    format: 'percent',
    getValue: (row) => {
      const paintCost = (parseNum(row['Paint Cost per RO']) || 0) * (parseNum(row['Completed RO']) || 0);
      const paintSales = parseNum(row['Paint Sales']) || 0;
      return paintSales > 0 ? (paintCost / paintSales) : 0;
    },
    benchmarkType: 'max',
    description: 'Cost of paint liquids relative to refinish labour sales'
  },
  'VPD / Per Booth': {
    format: 'number',
    getValue: (row) => parseNum(row['Vehicles per Day per Booth']),
    benchmarkType: 'min',
    description: 'Average number of vehicles processed through each booth daily'
  },
  'Return on Paint Labour': {
    format: 'percent',
    getValue: (row) => {
      const pSales = parseNum(row['Paint Sales']);
      const pCost = parseNum(row['Paint Labour Costs']);
      return pCost > 0 ? (pSales / pCost) : 0;
    },
    benchmarkType: 'min',
    description: 'Return on investment for paint labour'
  },
  'Paint Revenue P/V': {
    format: 'currency',
    getValue: (row) => {
      const pSales = parseNum(row['Paint Sales']);
      const cRO = parseNum(row['Completed RO']);
      return cRO > 0 ? (pSales / cRO) : 0;
    },
    benchmarkType: 'min',
    description: 'Paint revenue per completed vehicle'
  }
};
