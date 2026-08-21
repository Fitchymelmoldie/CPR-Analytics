import React, { useEffect, useRef, useState } from 'react';
import { fmt } from '../utils/metrics';

function editorValue(target, format) {
  if (target === undefined || target === null) return '';
  if (format === 'percent' || format === 'percentWhole') return String(Number(target) * 100);
  return String(target);
}

function storedValue(value, format) {
  return format === 'percent' || format === 'percentWhole' ? value / 100 : value;
}

function inputStep(format) {
  if (format === 'currency') return '1';
  if (format === 'percent' || format === 'percentWhole') return '0.01';
  return '0.1';
}

export default function BenchmarkTargetModal({
  isOpen,
  metric,
  companyName,
  currentTarget,
  benchmarkType,
  format,
  isSaving,
  error,
  onSave,
  onRemove,
  onClose
}) {
  const [draft, setDraft] = useState('');
  const [validationError, setValidationError] = useState('');
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const inputRef = useRef(null);
  const hasTarget = currentTarget !== undefined && currentTarget !== null;

  useEffect(() => {
    if (!isOpen) return undefined;
    setDraft(editorValue(currentTarget, format));
    setValidationError('');
    setConfirmingRemoval(false);
    inputRef.current?.focus();
    return undefined;
  }, [currentTarget, format, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !metric) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    const parsed = Number(trimmed);

    if (!trimmed || !Number.isFinite(parsed) || parsed < 0) {
      setValidationError('Enter a valid target of zero or more.');
      return;
    }

    setValidationError('');
    onSave(storedValue(parsed, format));
  };

  const directionCopy = benchmarkType === 'max'
    ? 'This KPI is on target when the result is at or below this number.'
    : 'This KPI is on target when the result is at or above this number.';
  const isPercentage = format === 'percent' || format === 'percentWhole';
  const helperCopy = isPercentage
    ? 'Enter the percentage exactly as you want to see it. For example, enter 25 for 25%.'
    : 'Enter the result you want this bodyshop to work towards.';

  return (
    <div
      className="codex-dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="benchmark-target-title"
        aria-describedby="benchmark-target-description"
        className="codex-dialog relative w-full max-w-lg p-6 sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="codex-icon-button absolute right-4 top-4 grid h-9 w-9 place-items-center disabled:opacity-40"
          aria-label="Close target editor"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-4 pr-10">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 1 0 9 9M12 3v9l6-6M12 12h9" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400">Performance target</p>
            <h2 id="benchmark-target-title" className="mt-1 text-xl font-bold tracking-tight text-white">
              {hasTarget ? 'Edit' : 'Create'} target for {metric}
            </h2>
            <p id="benchmark-target-description" className="mt-1 text-sm text-surface-400">
              {companyName || 'Selected bodyshop'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="benchmark-target-value" className="block text-xs font-bold uppercase tracking-[0.14em] text-surface-400">
            Target value
          </label>
          <div className="relative mt-2">
            {format === 'currency' ? <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">$</span> : null}
            <input
              ref={inputRef}
              id="benchmark-target-value"
              name="benchmark-target-value"
              type="number"
              min="0"
              step={inputStep(format)}
              inputMode="decimal"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setValidationError('');
              }}
              disabled={isSaving}
              className={`w-full rounded-2xl border bg-surface-900/80 py-3.5 text-lg font-semibold text-white outline-none transition-colors placeholder:text-surface-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 ${format === 'currency' ? 'pl-8 pr-4' : isPercentage ? 'pl-4 pr-10' : 'px-4'}`}
              placeholder="Enter target"
              aria-invalid={Boolean(validationError || error)}
              aria-describedby="benchmark-target-help benchmark-target-error"
            />
            {isPercentage ? <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-surface-500">%</span> : null}
          </div>

          <div id="benchmark-target-help" className="mt-3 rounded-2xl bg-black/15 p-4 text-xs leading-relaxed text-surface-400">
            <p className="font-semibold text-surface-300">{directionCopy}</p>
            <p className="mt-1">{helperCopy}</p>
            {hasTarget ? <p className="mt-2 text-surface-500">Current target: <span className="font-semibold text-surface-300">{fmt(currentTarget, format)}</span></p> : null}
          </div>

          <div id="benchmark-target-error" aria-live="polite" className="min-h-6 pt-2 text-sm text-danger-400">
            {validationError || error || ''}
          </div>

          {confirmingRemoval ? (
            <div className="mt-2 rounded-2xl border border-danger-500/20 bg-danger-500/5 p-4">
              <p className="text-sm font-semibold text-white">Remove this target?</p>
              <p className="mt-1 text-xs text-surface-400">The KPI will stay on the dashboard, but it will no longer count towards the Performance Pulse target score.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={isSaving}
                  className="rounded-xl bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger-500 disabled:opacity-50"
                >
                  {isSaving ? 'Removing…' : 'Confirm removal'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingRemoval(false)}
                  disabled={isSaving}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-surface-300 hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                >
                  Keep target
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {hasTarget ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingRemoval(true)}
                    disabled={isSaving}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-danger-400 transition-colors hover:bg-danger-500/10 hover:text-danger-300 disabled:opacity-50"
                  >
                    Remove target
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-surface-300 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,168,150,.2)] transition-colors hover:bg-brand-500 disabled:cursor-wait disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : hasTarget ? 'Update target' : 'Create target'}
                </button>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
