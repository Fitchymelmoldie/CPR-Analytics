import React from 'react';
import PillSelect from './PillSelect';

export default function FilterSelect({ id, label, value, onChange, options, formatLabel }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="whitespace-nowrap text-xs font-medium uppercase tracking-wider text-surface-400">{label}</label>
      <PillSelect id={id} label={label} value={value} onChange={onChange} options={options} formatLabel={formatLabel} variant="filter" />
    </div>
  );
}
