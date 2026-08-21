import React from 'react';

const PROFILE_STATS = [
  { key: 'painters_count', label: 'Painters', shortLabel: 'PA' },
  { key: 'panel_beaters_count', label: 'Panel Beaters', shortLabel: 'PB' },
  { key: 'booths_count', label: 'Paint Booths', shortLabel: 'BO' },
  { key: 'estimators_count', label: 'Estimators', shortLabel: 'ES' },
  { key: 'managers_count', label: 'Production Managers', shortLabel: 'PM' },
  { key: 'admin_count', label: 'Administration', shortLabel: 'AD' }
];

export default function ShopProfilePanel({ company, onEdit }) {
  if (!company) {
    return (
      <section className="glass rounded-2xl border border-white/[0.08] p-10 text-center">
        <h2 className="text-lg font-semibold text-white">Select a company to view its shop profile</h2>
        <p className="mt-2 text-sm text-surface-400">The facility and staffing details will appear here.</p>
      </section>
    );
  }

  return (
    <section className="animate-float-in space-y-5">
      <div className="codex-surface relative overflow-hidden p-5 sm:p-6">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/[0.12] text-brand-300 shadow-[0_0_30px_rgba(0,168,150,0.12)]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Facility profile</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{company.name || company.id}</h2>
              <p className="mt-1 text-sm text-surface-400">Shop ID: {company.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="codex-button codex-button-primary gap-2 px-3 py-2.5 text-xs"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit shop profile
          </button>
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white">Facility and staffing</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {PROFILE_STATS.map(stat => (
            <div key={stat.key} className="codex-surface p-4 transition-colors hover:border-white/[0.14]">
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-[9px] font-semibold tracking-wider text-surface-400">
                {stat.shortLabel}
              </div>
              <p className="text-2xl font-bold tracking-tight text-white">{company[stat.key] || 0}</p>
              <p className="mt-1 text-xs font-medium text-surface-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
