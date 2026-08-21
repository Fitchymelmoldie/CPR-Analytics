import React, { useEffect, useId, useRef, useState } from 'react';

export default function PillSelect({ id, label, value, onChange, options = [], formatLabel, variant = 'context' }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.indexOf(value)));
  const rootRef = useRef(null);
  const listboxId = useId();
  const optionValues = options.length > 0 ? options : [''];
  const currentIndex = Math.max(0, optionValues.indexOf(value));
  const getOptionLabel = (option) => (option && formatLabel ? formatLabel(option) : option);
  const displayValue = getOptionLabel(value);
  const isFilter = variant === 'filter';
  const isToolbar = variant === 'toolbar';

  useEffect(() => setActiveIndex(currentIndex), [currentIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const selectOption = (nextValue) => {
    if (nextValue !== value) onChange(nextValue);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setOpen(true);
      setActiveIndex(index => (index + direction + optionValues.length) % optionValues.length);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      selectOption(optionValues[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className={isFilter || isToolbar ? 'relative' : 'relative mt-1'}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${listboxId}-${activeIndex}` : undefined}
        onClick={() => setOpen(current => !current)}
        onKeyDown={handleKeyDown}
        className={isToolbar
          ? 'flex min-w-[150px] items-center justify-between gap-3 rounded-xl border border-surface-700/60 bg-surface-800/65 px-3 py-2 text-left text-xs font-medium text-surface-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition hover:border-surface-500 hover:bg-surface-700/60 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
          : isFilter
            ? 'flex min-w-[180px] items-center justify-between gap-3 rounded-full border border-surface-700/60 bg-surface-800/80 px-4 py-2 text-left text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition hover:border-surface-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
          : 'flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-left text-sm font-semibold text-surface-200 outline-none transition hover:border-brand-400/40 hover:bg-white/[0.05] focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'}
      >
        <span className="min-w-0 truncate">{displayValue || 'No options available'}</span>
        <svg className={`h-4 w-4 shrink-0 text-surface-500 transition-transform ${open ? 'rotate-180 text-brand-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m7 10 5 5 5-5" />
        </svg>
      </button>

      {open ? (
        <div id={listboxId} role="listbox" aria-label={`${label} options`} className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full min-w-full overflow-auto rounded-2xl border border-white/[0.11] bg-[#111a22]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
          {optionValues.map((option, index) => {
            const selected = option === value;
            const optionLabel = getOptionLabel(option);
            return (
              <button
                key={option || `empty-${index}`}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${selected ? 'bg-brand-500/15 text-brand-200' : 'text-surface-300 hover:bg-white/[0.07] hover:text-white'} ${activeIndex === index ? 'ring-1 ring-brand-400/30' : ''}`}
              >
                <span className="min-w-0 truncate">{optionLabel || 'No options available'}</span>
                {selected ? <span className="ml-3 shrink-0 text-brand-300" aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
