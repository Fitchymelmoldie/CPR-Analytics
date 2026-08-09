import React from 'react';
import KpiCard from './KpiCard';
import PerformanceInsights from './PerformanceInsights';
import PerformancePulse from './PerformancePulse';
import PerformanceRhythm from './PerformanceRhythm';

function ContextSelect({ id, label, value, options, onChange, formatLabel, readOnlyValue }) {
  return (
    <div className="dashboard-context-card min-w-0 rounded-2xl px-4 py-3.5">
      <label htmlFor={readOnlyValue ? undefined : id} className="block text-[9px] font-bold uppercase tracking-[0.17em] text-surface-600">
        {label}
      </label>
      {readOnlyValue ? (
        <p className="mt-1.5 truncate text-sm font-semibold text-surface-200">{readOnlyValue}</p>
      ) : (
        <div className="relative mt-1">
          <select
            id={id}
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full appearance-none truncate bg-transparent py-0.5 pr-7 text-sm font-semibold text-surface-200 outline-none transition-colors hover:text-white focus:text-white"
          >
            {options.length === 0 ? <option value="">No options available</option> : null}
            {options.map(option => <option key={option} value={option}>{formatLabel ? formatLabel(option) : option}</option>)}
          </select>
          <svg className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m7 10 5 5 5-5" />
          </svg>
        </div>
      )}
    </div>
  );
}

function DataStatusCard({ label, tone = 'current', demoMode }) {
  const dotClass = tone === 'current' ? 'bg-success-400' : tone === 'historical' ? 'bg-amber-300' : 'bg-surface-500';
  return (
    <div className="dashboard-context-card min-w-0 rounded-2xl px-4 py-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-surface-600">Data status</p>
      <div className="mt-1.5 flex min-w-0 items-center gap-2 text-sm font-semibold text-surface-200">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
        <span className="truncate">{label}</span>
        {demoMode ? <span className="ml-auto shrink-0 rounded-full bg-brand-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-brand-300">Demo</span> : null}
      </div>
    </div>
  );
}

function CurrentBodyshop({ company, statusTone }) {
  const name = company?.name || company?.id || 'Selected bodyshop';
  const statusLabel = statusTone === 'current' ? 'Data current' : statusTone === 'historical' ? 'Historical view' : 'Awaiting data';
  const statusClass = statusTone === 'current'
    ? 'bg-success-500/10 text-success-400'
    : statusTone === 'historical'
      ? 'bg-amber-300/10 text-amber-300'
      : 'bg-white/[0.04] text-surface-400';

  return (
    <div className="dashboard-shop-strip flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-400">Current bodyshop</p>
        <p className="mt-1 flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className="font-semibold text-white">{name}</span>
          <span className="text-sm font-normal text-surface-500">
            {Number(company?.painters_count || 0)} painters · {Number(company?.panel_beaters_count || 0)} panel beaters · {Number(company?.booths_count || 0)} booths
          </span>
        </p>
      </div>
      <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${statusClass}`}>{statusLabel}</span>
    </div>
  );
}

function KpiCardGuide() {
  return (
    <aside className="dashboard-shop-strip rounded-2xl px-4 py-3" aria-labelledby="kpi-card-guide-title">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="shrink-0">
          <p id="kpi-card-guide-title" className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-400">KPI card guide</p>
          <p className="mt-1 text-[11px] text-surface-500">Each marker answers a different question.</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 xl:max-w-4xl xl:grid-cols-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-black/10 px-3 py-2">
            <span aria-hidden="true" className="rounded-full bg-success-500/10 px-2 py-0.5 text-[9px] font-bold text-success-400">↗ 4.2%</span>
            <span aria-hidden="true" className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-400">↘ 3.6%</span>
            <span className="basis-full text-[10px] font-medium text-surface-400">Favourable or unfavourable change</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-black/10 px-3 py-2">
            <span aria-hidden="true" className="rounded-full bg-success-500/10 px-2 py-0.5 text-[9px] font-bold text-success-400">✓ Target met</span>
            <span aria-hidden="true" className="rounded-full bg-amber-300/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">! Target missed</span>
            <span className="basis-full text-[10px] font-medium text-surface-400">Current result compared with target</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2">
            <span aria-hidden="true" className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[9px] font-bold text-amber-300">1st / 8</span>
            <span className="text-[10px] font-medium text-surface-400">Peer-group rank</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2">
            <span aria-hidden="true" className="h-0.5 w-8 shrink-0 rounded-full bg-brand-400" />
            <span className="text-[10px] font-medium text-surface-400">Selected for the chart</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardWorkspace({
  companies = [],
  selectedCompany,
  onCompanyChange,
  formatCompanyLabel,
  isAdmin,
  periods = [],
  selectedPeriod,
  onPeriodChange,
  formatPeriodLabel,
  company,
  items,
  selectedKpi,
  onSelectKpi,
  onSetBenchmark,
  dailyActual,
  dailyTarget,
  rollingMonths,
  reportingPeriod,
  dataStatusLabel,
  dataStatusTone,
  trendData,
  timeframe,
  onTimeframeChange,
  comparisonLabel,
  demoMode = false
}) {
  const selectedItem = items.find(item => item.title === selectedKpi) || items[0];

  return (
    <div className="space-y-4 pt-6" data-testid="dashboard-workspace">
      <section className="grid gap-2.5 sm:grid-cols-3 animate-float-in" aria-label="Dashboard context">
        <ContextSelect
          id="filter-company"
          label="Bodyshop"
          value={selectedCompany}
          options={companies}
          onChange={onCompanyChange}
          formatLabel={formatCompanyLabel}
          readOnlyValue={isAdmin ? null : (company?.name || company?.id)}
        />
        <ContextSelect
          id="filter-period"
          label="Reporting period"
          value={selectedPeriod}
          options={periods}
          onChange={onPeriodChange}
          formatLabel={formatPeriodLabel}
        />
        <DataStatusCard label={dataStatusLabel} tone={dataStatusTone} demoMode={demoMode} />
      </section>

      <CurrentBodyshop company={company} statusTone={dataStatusTone} />

      <PerformancePulse
        items={items}
        dailyActual={dailyActual}
        dailyTarget={dailyTarget}
        rollingMonths={rollingMonths}
        reportingPeriod={reportingPeriod}
      />

      <KpiCardGuide />

      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5" aria-label="Bodyshop key performance indicators">
        {items.map(item => (
          <KpiCard
            key={item.title}
            {...item}
            isActive={selectedKpi === item.title}
            onClick={() => onSelectKpi(item.title)}
            onSetBenchmark={onSetBenchmark}
            isAdmin={isAdmin}
          />
        ))}
      </section>

      <section className="pb-4" id="charts">
        {trendData ? (
          <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,.7fr)]">
            <div className="min-w-0 overflow-x-auto rounded-[28px]">
              <PerformanceRhythm
                key={`${selectedKpi}-${timeframe}`}
                data={trendData}
                title={selectedKpi}
                timeframe={timeframe}
                onTimeframeChange={onTimeframeChange}
                benchmark={selectedItem?.benchmark}
                benchmarkType={selectedItem?.benchmarkType}
                comparisonLabel={comparisonLabel}
              />
            </div>
            <PerformanceInsights items={items} selectedTitle={selectedKpi} />
          </div>
        ) : (
          <div className="glass card-appear card-appear-1 flex min-h-[300px] flex-col items-center justify-center rounded-[28px] p-10 text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-800/50 text-brand-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Trend visualization locked</h3>
            <p className="mt-2 max-w-md text-sm text-surface-400">Add another reporting period to unlock monthly performance trends.</p>
          </div>
        )}
      </section>
    </div>
  );
}
