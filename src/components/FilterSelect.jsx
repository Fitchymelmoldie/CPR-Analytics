import React from 'react';
export default     function FilterSelect({ id, label, value, onChange, options, formatLabel }) {
      return (
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="text-xs font-medium text-surface-400 uppercase tracking-wider whitespace-nowrap">{label}</label>
          <div className="relative">
            <select
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="bg-surface-800/80 border border-surface-700/60 rounded-lg pl-3 pr-8 py-2 text-sm text-white appearance-none cursor-pointer hover:border-surface-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 min-w-[180px]"
            >
              {options.map(o => (
                <option key={o} value={o}>{formatLabel ? formatLabel(o) : o}</option>
              ))}
            </select>
            <svg className="w-4 h-4 text-surface-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      );
    }

