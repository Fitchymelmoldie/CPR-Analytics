import { describe, it, expect } from 'vitest';
import { parseNum, fmt, KPI_CONFIG, MONTH_NAMES } from './metrics';

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

    it('formats percentages', () => {
      expect(fmt(0.5, 'percent')).toBe('50.0%');
      expect(fmt(0.055, 'percent')).toBe('5.5%');
      expect(fmt(1, 'percent')).toBe('100.0%');
    });

    it('formats standard numbers', () => {
      expect(fmt(1234.56)).toBe('1,234.6');
      expect(fmt(1234)).toBe('1,234');
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
