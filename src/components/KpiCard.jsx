import React from 'react';
import { fmt } from '../utils/metrics';
export default     function KpiCard({ title, value, format, variance, iconPath, delayClass, isActive, onClick, benchmark, benchmarkType, onSetBenchmark, isAdmin, rank: rankProp, cohortSize }) {
      const rank = typeof rankProp === 'object' && rankProp !== null ? rankProp.rank : rankProp;
      let rankAvg = typeof rankProp === 'object' && rankProp !== null ? rankProp.avgVal : undefined;
      if (rankAvg !== undefined && (title === 'Paint Cost / Total Sales' || title === 'Liquid Cost to Refinish')) {
        rankAvg = rankAvg * 100;
      }

      const displayVal = format === 'currency' ? fmt(value, 'currency')
        : format === 'percent' ? fmt(value, 'percent')
        : fmt(value);

      const hasVariance = variance !== null && variance !== undefined;
      const isGood = hasVariance && (benchmarkType === 'max' ? variance <= 0 : variance >= 0);
      const isUp = hasVariance && variance > 0;
      
      const activeStyle = isActive 
        ? "border-brand-500 shadow-[0_0_15px_rgba(0,168,150,0.3)] bg-brand-900/10 scale-[1.02]" 
        : "hover:scale-[1.02] hover:border-brand-500/30";

      // Evaluate benchmark
      let hasBenchmark = benchmark !== undefined && benchmark !== null;
      let hitsBenchmark = false;
      if (hasBenchmark) {
        if (benchmarkType === 'min') {
          hitsBenchmark = value >= benchmark;
        } else if (benchmarkType === 'max') {
          hitsBenchmark = value <= benchmark;
        }
      }

      return (
        <div onClick={onClick} className={`group card-appear ${delayClass || ''} glass rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-transparent ${activeStyle} relative overflow-hidden`}>
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex items-start gap-2 text-surface-300 text-sm font-medium tracking-wide uppercase relative z-10 flex-1 min-w-0">
              <svg className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
              </svg>
              <span className="leading-tight break-words" title={title}>{title}</span>
            </div>
            
            <div className="flex items-center gap-2 relative z-10 flex-shrink-0">
              {isAdmin && (
                <button onClick={(e) => { e.stopPropagation(); onSetBenchmark(title); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-surface-400 hover:text-brand-400 hover:bg-brand-500/20 rounded-md"
                  title="Set Benchmark Target">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between relative z-10 mt-auto">
            <div className="flex flex-col gap-2">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{displayVal}</div>
              {hasVariance && (
                <div className="flex items-center gap-2 mt-1">
                  <div className={"flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold " +
                    (isGood ? 'bg-success-500/15 text-success-400' : 'bg-danger-500/15 text-danger-400')}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d={isUp ? "M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" : "M19.5 4.5l-15 15m0 0h11.25M4.5 19.5V8.25"} />
                    </svg>
                    <span>{Math.abs(variance).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
            
            {(rank || hasBenchmark) && (
              <div className="flex flex-col items-end justify-end gap-2 animate-float-in">
                {rank && (
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-surface-700/50 text-surface-300'}`}>
                    {rank === 1 && <span className="text-[12px] leading-none">🏆</span>}
                    <span>{rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'}</span>
                  </div>
                )}
                {hasBenchmark && (
                  hitsBenchmark ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(0,168,150,0.2)]">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Target Met
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-danger-500/15 border border-danger-500/30 text-danger-400 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Missed Target
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

