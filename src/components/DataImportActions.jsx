import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ANALYTICS_INPUT_FIELDS } from '../services/db';
import { MONTH_NAMES, parseNum } from '../utils/metrics';
import PillSelect from './PillSelect';

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function periodLabel(period) {
  const [year, month] = String(period || '').split('-').map(Number);
  if (!year || !month) return 'Selected month';
  return `${MONTH_NAMES[month]} ${year}`;
}

function hasSavedValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function normalizeInputValue(rawValue, format) {
  const parsed = parseNum(rawValue);
  if (!Number.isFinite(parsed)) return null;
  if (format === 'percent' && !String(rawValue).trim().endsWith('%') && Math.abs(parsed) > 2) {
    return parsed / 100;
  }
  return parsed;
}

function formatRawValue(value, format) {
  if (!hasSavedValue(value)) return 'No value saved';
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  if (format === 'currency') return number.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 2 });
  if (format === 'percent') {
    const percentage = Math.abs(number) <= 2 ? number * 100 : number;
    return `${percentage.toLocaleString('en-AU', { maximumFractionDigits: 2 })}%`;
  }
  return number.toLocaleString('en-AU', { maximumFractionDigits: 2 });
}

function parsePeriodValue(period) {
  const [year, month] = String(period || '').split('-').map(Number);
  return {
    year: Number.isInteger(year) ? year : new Date().getFullYear(),
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : new Date().getMonth() + 1
  };
}

function MonthPicker({ id, value, onChange }) {
  const pickerRef = useRef(null);
  const { year, month } = parsePeriodValue(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);

  useEffect(() => {
    setViewYear(year);
  }, [year]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={pickerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Reporting month"
        onClick={() => setOpen(current => !current)}
        className="codex-input flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm"
      >
        <span>{periodLabel(value)}</span>
        <svg className={`h-4 w-4 shrink-0 text-surface-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
      </button>

      {open ? (
        <div role="dialog" aria-label="Choose reporting month" className="absolute left-0 top-[calc(100%+0.55rem)] z-50 w-full min-w-[250px] rounded-xl border border-white/[0.10] bg-[#17191c] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.62)] sm:min-w-[270px]">
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-1 pb-3">
            <button type="button" aria-label={`Previous year, ${viewYear - 1}`} onClick={() => setViewYear(current => Math.max(2000, current - 1))} disabled={viewYear <= 2000} className="grid h-8 w-8 place-items-center rounded-lg text-surface-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="text-sm font-semibold text-white">{viewYear}</span>
            <button type="button" aria-label={`Next year, ${viewYear + 1}`} onClick={() => setViewYear(current => Math.min(2100, current + 1))} disabled={viewYear >= 2100} className="grid h-8 w-8 place-items-center rounded-lg text-surface-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" /></svg>
            </button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5" role="group" aria-label={`${viewYear} months`}>
            {MONTH_NAMES.slice(1).map((monthName, index) => {
              const monthNumber = index + 1;
              const selected = viewYear === year && monthNumber === month;
              return (
                <button
                  key={monthName}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => { onChange(`${viewYear}-${String(monthNumber).padStart(2, '0')}`); setOpen(false); }}
                  className={`rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors ${selected ? 'bg-brand-400/15 text-brand-200 ring-1 ring-brand-300/30' : 'text-surface-300 hover:bg-white/[0.07] hover:text-white'}`}
                >
                  {monthName}
                </button>
              );
            })}
          </div>
          <p className="mt-3 border-t border-white/[0.06] px-1 pt-3 text-[10px] leading-relaxed text-surface-500">Choose the month this KPI value belongs to.</p>
        </div>
      ) : null}
    </div>
  );
}

function QuickKpiEntry({ companyId, companyName, selectedPeriod, latestPeriod, rows, onSave, disabled = false }) {
  const [period, setPeriod] = useState(selectedPeriod || latestPeriod || currentMonthValue());
  const [metricKey, setMetricKey] = useState(ANALYTICS_INPUT_FIELDS.find(field => field.key === 'Completed RO')?.key || ANALYTICS_INPUT_FIELDS[0]?.key || '');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState({ saving: false, error: '', success: '' });
  const previousCompanyRef = useRef(companyId);

  useEffect(() => {
    const nextPeriod = selectedPeriod || latestPeriod || currentMonthValue();
    const companyChanged = previousCompanyRef.current !== companyId;
    previousCompanyRef.current = companyId;
    if (companyChanged || nextPeriod !== period) {
      setPeriod(nextPeriod);
      setValue('');
      setStatus({ saving: false, error: '', success: '' });
    }
    // This effect intentionally follows external reporting context changes;
    // local month-picker changes are handled directly by the field event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, latestPeriod, selectedPeriod]);

  const selectedField = useMemo(
    () => ANALYTICS_INPUT_FIELDS.find(field => field.key === metricKey) || ANALYTICS_INPUT_FIELDS[0],
    [metricKey]
  );
  const existingRow = useMemo(() => {
    const [year, month] = period.split('-').map(Number);
    return rows.find(row => Number(row.Year) === year && Number(row.Month) === month) || null;
  }, [period, rows]);
  const existingValue = existingRow?.[metricKey];
  const isUpdate = hasSavedValue(existingValue);
  const isNewPeriod = Boolean(period) && !existingRow;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedValue = normalizeInputValue(value, selectedField?.format);
    if (!companyId) {
      setStatus({ saving: false, error: 'Select a bodyshop before entering a KPI value.', success: '' });
      return;
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      setStatus({ saving: false, error: 'Choose a valid reporting month.', success: '' });
      return;
    }
    if (!selectedField || !Number.isFinite(normalizedValue)) {
      setStatus({ saving: false, error: 'Enter a valid numeric KPI value.', success: '' });
      return;
    }

    setStatus({ saving: true, error: '', success: '' });
    try {
      await onSave({ period, metricKey: selectedField.key, value: normalizedValue });
      setValue('');
      setStatus({
        saving: false,
        error: '',
        success: `${selectedField.label} was ${isUpdate ? 'updated' : 'added'} for ${periodLabel(period)}.`
      });
    } catch (error) {
      setStatus({ saving: false, error: error.message || 'The KPI value could not be saved.', success: '' });
    }
  };

  const inputHint = selectedField?.format === 'currency'
    ? 'AUD value'
    : selectedField?.format === 'percent'
      ? 'Enter 85 or 85%'
      : 'Numeric value';

  return (
    <article className="codex-surface flex min-h-full flex-col p-5 sm:p-6" aria-labelledby="quick-kpi-entry-title">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-brand-500/15 bg-brand-500/10 text-brand-300" aria-hidden="true">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12M4.5 4.5h15v15h-15z" /></svg>
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-400">Single value</p>
          <h2 id="quick-kpi-entry-title" className="mt-1 text-base font-semibold text-white">Quick KPI entry</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quick-entry-period" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-surface-400">Reporting month</label>
            <div className="mt-2">
              <MonthPicker id="quick-entry-period" value={period} onChange={nextPeriod => { setPeriod(nextPeriod); setValue(''); setStatus({ saving: false, error: '', success: '' }); }} />
            </div>
          </div>
          <div>
            <label htmlFor="quick-entry-metric" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-surface-400">KPI</label>
            <PillSelect
              id="quick-entry-metric"
              label="KPI"
              value={metricKey}
              options={ANALYTICS_INPUT_FIELDS.map(field => field.key)}
              formatLabel={option => ANALYTICS_INPUT_FIELDS.find(field => field.key === option)?.label || option}
              onChange={nextMetric => { setMetricKey(nextMetric); setValue(''); setStatus({ saving: false, error: '', success: '' }); }}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="quick-entry-value" className="block text-[10px] font-bold uppercase tracking-[0.14em] text-surface-400">Value</label>
            <span className="truncate text-[10px] text-surface-500" title={companyName || companyId}>{companyName || companyId || 'No bodyshop selected'}</span>
          </div>
          <input
            id="quick-entry-value"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={event => { setValue(event.target.value); setStatus(current => ({ ...current, error: '', success: '' })); }}
            placeholder={inputHint}
            className="codex-input mt-2 w-full px-3 py-2.5 text-sm"
          />
        </div>

        <div className={`mt-4 rounded-lg border px-3.5 py-3 text-xs ${isUpdate ? 'border-amber-300/15 bg-amber-300/[0.05]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
          <div className="flex items-center justify-between gap-4">
            <span className="text-surface-500">{isUpdate ? 'Saved value' : isNewPeriod ? 'Month status' : 'Status'}</span>
            <strong className={isUpdate ? 'text-amber-200' : 'text-surface-300'}>{isUpdate ? formatRawValue(existingValue, selectedField?.format) : isNewPeriod ? '1 KPI entered' : 'Not entered'}</strong>
          </div>
          <p className="mt-1.5 leading-relaxed text-surface-500">
            {isUpdate
              ? 'Only this KPI will change.'
              : isNewPeriod
                ? 'This starts the month. Add other KPIs later or use CSV.'
                : 'Only this KPI will be added.'}
          </p>
        </div>

        <p className={`mt-3 min-h-5 text-xs ${status.error ? 'text-danger-400' : 'text-success-400'}`} role={status.error ? 'alert' : 'status'} aria-live="polite">
          {status.error || status.success}
        </p>

        <button
          type="submit"
          disabled={disabled || status.saving || !companyId || !period || !metricKey || String(value).trim() === ''}
          className="codex-button codex-button-primary mt-auto w-full justify-center px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-45"
        >
          {status.saving ? 'Saving KPI…' : isUpdate ? 'Update KPI value' : 'Add KPI value'}
        </button>
      </form>
    </article>
  );
}

export default function DataImportActions({ companyId, companyName, selectedPeriod, periods = [], rows = [], onFile, onQuickSave, disabled = false }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const latestPeriod = periods[periods.length - 1] || '';

  const submitFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setFileError('Choose a CSV file exported from your spreadsheet.');
      return;
    }
    setFileError('');
    onFile(file);
  };

  return (
    <section className="mb-6" aria-labelledby="add-monthly-data-title">
      <div className="mb-4">
        <h2 id="add-monthly-data-title" className="mt-1 text-lg font-semibold tracking-tight text-white">Add monthly data</h2>
      </div>
      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <article
          className={`codex-surface flex min-h-full flex-col border-dashed p-5 transition-colors sm:p-6 ${dragOver ? 'border-brand-400 bg-brand-500/[0.035]' : ''}`}
          onDragOver={event => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={event => { event.preventDefault(); setDragOver(false); submitFile(event.dataTransfer?.files?.[0]); }}
          aria-labelledby="bulk-import-title"
        >
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={event => { submitFile(event.target.files?.[0]); event.target.value = ''; }}
          />
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.035] text-surface-300" aria-hidden="true">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0-12-4 4m4-4 4 4M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" /></svg>
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-surface-500">Multiple values</p>
              <h2 id="bulk-import-title" className="mt-1 text-base font-semibold text-white">Import CSV spreadsheet</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="mt-5 flex min-h-36 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.09] bg-black/10 px-6 py-7 text-center transition-colors hover:border-white/[0.16] hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <strong className="text-sm font-semibold text-white">{dragOver ? 'Drop CSV to import' : 'Choose CSV file'}</strong>
            <span className="mt-1.5 text-xs leading-relaxed text-surface-500">CSV only · drag and drop supported</span>
          </button>
          <p className={`mt-3 min-h-5 text-xs ${fileError ? 'text-danger-400' : 'text-surface-500'}`} role={fileError ? 'alert' : undefined}>{fileError || 'Existing months update by company and month.'}</p>
        </article>

        <QuickKpiEntry
          companyId={companyId}
          companyName={companyName}
          selectedPeriod={selectedPeriod}
          latestPeriod={latestPeriod}
          rows={rows}
          onSave={onQuickSave}
          disabled={disabled}
        />
      </div>
    </section>
  );
}
