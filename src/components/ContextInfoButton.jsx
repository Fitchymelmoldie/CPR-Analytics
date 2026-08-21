import React from 'react';

export default function ContextInfoButton({
  label,
  expanded = false,
  controls,
  describedBy,
  title,
  onClick,
  onMouseEnter,
  onFocus,
  onBlur,
  className = ''
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-describedby={describedBy}
      title={title}
      data-context-info-button="true"
      className={`group/context-info relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-surface-400 outline-none transition-colors hover:text-brand-200 focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 ${className}`}
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border bg-surface-800/80 transition-colors group-hover/context-info:border-brand-400/50 group-hover/context-info:bg-brand-400/[0.10] group-focus-visible/context-info:border-brand-400/60 group-focus-visible/context-info:bg-brand-400/[0.12] ${expanded ? 'border-brand-400/60 bg-brand-400/[0.12] text-brand-200' : 'border-surface-600/80'}`}
      >
        <svg data-context-info-icon="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="10" cy="10" r="7.25" />
          <path strokeLinecap="round" d="M10 8.75v4.5" />
          <circle cx="10" cy="6.35" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      </span>
    </button>
  );
}
