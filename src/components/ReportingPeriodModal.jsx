import React, { useEffect, useRef, useState } from 'react';
import { MONTH_NAMES } from '../utils/metrics';

function nextPeriod(period) {
  if (!period) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const [year, month] = period.split('-').map(Number);
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export default function ReportingPeriodModal({ isOpen, companyName, latestPeriod, existingPeriods, onCreate, onClose }) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [error, setError] = useState('');
  const yearRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const suggested = nextPeriod(latestPeriod);
    setYear(String(suggested.year));
    setMonth(String(suggested.month));
    setError('');
    yearRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, latestPeriod, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsedYear = Number(year);
    const parsedMonth = Number(month);
    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100 || !Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      setError('Choose a valid month and a year between 2000 and 2100.');
      return;
    }

    const period = `${parsedYear}-${String(parsedMonth).padStart(2, '0')}`;
    if (existingPeriods.includes(period)) {
      setError(`${MONTH_NAMES[parsedMonth]} ${parsedYear} already exists for this bodyshop.`);
      return;
    }

    setError('');
    onCreate(parsedYear, parsedMonth);
  };

  return (
    <div
      className="codex-dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="reporting-period-title" className="codex-dialog relative w-full max-w-md p-6 sm:p-7">
        <button type="button" onClick={onClose} className="codex-icon-button absolute right-4 top-4 grid h-9 w-9 place-items-center" aria-label="Close reporting period editor">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">Data & imports</p>
        <h2 id="reporting-period-title" className="mt-1 text-xl font-bold tracking-tight text-white">Add a reporting period</h2>
        <p className="mt-1 text-sm text-surface-400">{companyName || 'Selected bodyshop'}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reporting-period-month" className="block text-xs font-bold uppercase tracking-[0.14em] text-surface-400">Month</label>
              <select id="reporting-period-month" value={month} onChange={(event) => { setMonth(event.target.value); setError(''); }} className="codex-input mt-2 w-full px-4 py-3 text-sm font-semibold">
                {MONTH_NAMES.slice(1).map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="reporting-period-year" className="block text-xs font-bold uppercase tracking-[0.14em] text-surface-400">Year</label>
              <input ref={yearRef} id="reporting-period-year" type="number" min="2000" max="2100" step="1" value={year} onChange={(event) => { setYear(event.target.value); setError(''); }} className="codex-input mt-2 w-full px-4 py-3 text-sm font-semibold" />
            </div>
          </div>
          <p className="min-h-5 text-sm text-danger-400" aria-live="polite">{error}</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="codex-button codex-button-secondary px-4 py-2.5 text-xs">Cancel</button>
            <button type="submit" className="codex-button codex-button-primary px-4 py-2.5 text-xs">Add period</button>
          </div>
        </form>
      </section>
    </div>
  );
}
