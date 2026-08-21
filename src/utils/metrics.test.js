import { describe, it, expect } from 'vitest';
import { parseNum, fmt, filterPeriodsByTimeframe, KPI_CONFIG } from './metrics';

describe('metrics utils', () => {
  describe('parseNum', () => {
    it('handles null and undefined', () => {
      expect(parseNum(null)).toBeNull();
      expect(parseNum(undefined)).toBeNull();
    });

    it('handles blank cells (empty strings or whitespace)', () => {
      expect(parseNum('')).toBeNull();
      expect(parseNum('   ')).toBeNull();
      expect(parseNum('\t\n')).toBeNull();
    });

    it('parses standard numbers', () => {
      expect(parseNum(123)).toBe(123);
      expect(parseNum('123')).toBe(123);
      expect(parseNum('123.45')).toBe(123.45);
      expect(parseNum(0)).toBe(0);
      expect(parseNum('0')).toBe(0);
      expect(parseNum('-50')).toBe(-50);
    });

    it('parses currency strings, removing $ and commas', () => {
      expect(parseNum('$1,234.56')).toBe(1234.56);
      expect(parseNum(' $1,000 ')).toBe(1000);
      expect(parseNum('1,234,567')).toBe(1234567);
      expect(parseNum('$-50.5')).toBe(-50.5);
    });

    it('parses percentage strings, converting them correctly', () => {
      expect(parseNum('50%')).toBe(0.5);
      expect(parseNum('100%')).toBe(1);
      expect(parseNum('5.5%')).toBe(0.055);
      expect(parseNum(' 0.1% ')).toBe(0.001);
      expect(parseNum('-10%')).toBe(-0.1);
    });

    it('returns null for non-numeric strings', () => {
      expect(parseNum('abc')).toBeNull();
      expect(parseNum('$abc')).toBeNull();
      expect(parseNum('abc%')).toBeNull();
    });
    
    it('edge cases of parseFloat', () => {
      // parseFloat stops parsing when it hits a non-numeric character
      expect(parseNum('123abc')).toBe(123);
    });
  });

  describe('fmt', () => {
    it('handles null and undefined', () => {
      expect(fmt(null)).toBe('');
      expect(fmt(undefined)).toBe('');
    });

    it('formats currency', () => {
      // toLocaleString varies by locale, we are using 'en-AU' 
      // with minimumFractionDigits: 0, maximumFractionDigits: 0
      expect(fmt(1234.56, 'currency')).toBe('$1,235'); // rounding
      expect(fmt(1000, 'currency')).toBe('$1,000');
    });

    it('formats percentages to exactly two decimal places', () => {
      expect(fmt(0.5, 'percent')).toBe('50.00%');
      expect(fmt(0.055, 'percent')).toBe('5.50%');
      expect(fmt(1, 'percent')).toBe('100.00%');
      expect(fmt(5.073507, 'percent')).toBe('507.35%');
    });

    it('formats whole percentages for Return on Paint Labour', () => {
      expect(fmt(5.35, 'percentWhole')).toBe('535%');
      expect(fmt(5.354, 'percentWhole')).toBe('535%');
    });

    it('formats standard numbers', () => {
      expect(fmt(1234.56)).toBe('1,234.6');
      expect(fmt(1234)).toBe('1,234');
    });
  });

  describe('filterPeriodsByTimeframe', () => {
    const periods = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

    it('anchors every window to the selected reporting period', () => {
      expect(filterPeriodsByTimeframe(periods, '2026-08', 'YTD')).toEqual([
        '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'
      ]);
      expect(filterPeriodsByTimeframe(periods, '2026-08', '3M')).toEqual(['2026-06', '2026-07', '2026-08']);
      expect(filterPeriodsByTimeframe(periods, '2026-08', '6M')).toEqual(['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08']);
      expect(filterPeriodsByTimeframe(periods, '2026-08', '12M')).toEqual(periods.slice(0, 10));
      expect(filterPeriodsByTimeframe(periods, '2026-08', 'ALL')).toEqual(periods.slice(0, 10));
    });

    it('uses the Australian financial year for FYTD', () => {
      const financialYearPeriods = [
        '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
        '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'
      ];

      expect(filterPeriodsByTimeframe(financialYearPeriods, '2026-05', 'FYTD')).toEqual([
        '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
        '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'
      ]);
      expect(filterPeriodsByTimeframe(financialYearPeriods, '2026-08', 'FYTD')).toEqual(['2026-07', '2026-08']);
    });

    it('applies an inclusive custom month range and normalizes reversed endpoints', () => {
      expect(filterPeriodsByTimeframe(periods, '2026-08', 'CUSTOM', { from: '2026-02', to: '2026-05' })).toEqual([
        '2026-02', '2026-03', '2026-04', '2026-05'
      ]);
      expect(filterPeriodsByTimeframe(periods, '2026-08', 'CUSTOM', { from: '2026-05', to: '2026-02' })).toEqual([
        '2026-02', '2026-03', '2026-04', '2026-05'
      ]);
    });

    it('falls back to the latest valid period and ignores malformed entries', () => {
      expect(filterPeriodsByTimeframe(['bad-period', '2026-06', '2026-07'], null, '3M')).toEqual(['2026-06', '2026-07']);
    });
  });

  describe('KPI_CONFIG', () => {
    it('has expected config properties', () => {
      expect(KPI_CONFIG['Total Sales'].format).toBe('currency');
      expect(KPI_CONFIG['Total Sales'].benchmarkType).toBe('min');
    });

    it('getValue for Total Sales parses number correctly', () => {
      const row = { 'Total Sales': '$1,000' };
      expect(KPI_CONFIG['Total Sales'].getValue(row)).toBe(1000);
    });

    it('getValue handles derived fields gracefully: Return on Paint Labour', () => {
      expect(KPI_CONFIG['Return on Paint Labour'].getValue({
        'Paint Sales': '$1,000',
        'Paint Labour Costs': '$500'
      })).toBe(2);

      expect(KPI_CONFIG['Return on Paint Labour'].getValue({
        'Paint Sales': '$1,000',
        'Paint Labour Costs': '$0'
      })).toBe(0);

      expect(KPI_CONFIG['Return on Paint Labour'].getValue({
        'Paint Sales': '$1,000',
        'Paint Labour Costs': '' // parseNum returns null
      })).toBe(0);
    });
    
    it('getValue handles derived fields gracefully: Paint Revenue P/V', () => {
      expect(KPI_CONFIG['Paint Revenue P/V'].getValue({
        'Paint Sales': '$1,000',
        'Completed RO': '5'
      })).toBe(200);

      expect(KPI_CONFIG['Paint Revenue P/V'].getValue({
        'Paint Sales': '$1,000',
        'Completed RO': '0'
      })).toBe(0);
    });
  });
});
