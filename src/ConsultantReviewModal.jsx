import React, { useState, useEffect } from 'react';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ConsultantReviewModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  selectedCompany, 
  selectedPeriod, 
  companyReviews, // Object mapping period -> { trendAnalysis, improvements, timestamp }
  onSaveReview
}) {
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const [trendAnalysis, setTrendAnalysis] = useState('');
  const [improvements, setImprovements] = useState('');

  // Sync local state when period changes or modal opens
  useEffect(() => {
    if (isOpen && selectedPeriod) {
      const currentReview = companyReviews?.[selectedPeriod];
      setTrendAnalysis(currentReview?.trendAnalysis || '');
      setImprovements(currentReview?.improvements || '');
      setActiveTab('current');
    }
  }, [isOpen, selectedPeriod, companyReviews]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveReview(selectedPeriod, trendAnalysis, improvements);
    onClose();
  };

  const hasHistory = companyReviews && Object.keys(companyReviews).length > 0;
  
  // Sort history newest first
  const sortedHistoryPeriods = hasHistory 
    ? Object.keys(companyReviews).sort((a, b) => {
        const [yA, mA] = a.split('-').map(Number);
        const [yB, mB] = b.split('-').map(Number);
        return (yB * 12 + mB) - (yA * 12 + mA);
      })
    : [];

  const formatPeriod = (p) => {
    if (!p) return '';
    const [year, month] = p.split('-');
    return `${MONTH_NAMES[parseInt(month)]} ${year}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 border border-surface-700/50 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-700/50 glass">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Consultant Review</h2>
              <p className="text-sm text-surface-400">
                {selectedCompany} • {formatPeriod(selectedPeriod)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-700/50 px-6 bg-surface-800/20">
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'current' ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
            onClick={() => setActiveTab('current')}
          >
            Current Period
          </button>
          <button 
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-brand-500 text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-200'}`}
            onClick={() => setActiveTab('history')}
          >
            Historical Log
            {sortedHistoryPeriods.length > 0 && (
              <span className="bg-surface-700 text-xs py-0.5 px-2 rounded-full text-white">{sortedHistoryPeriods.length}</span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'current' ? (
            <div className="space-y-6 animate-float-in">
              {currentUser.role === 'ADMIN' ? (
                <p className="text-sm text-brand-400/80 mb-2">Edit your analysis and recommendations below. Click Save when finished.</p>
              ) : (
                <p className="text-sm text-surface-400 mb-2">Review the consultant's analysis below.</p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Trend Analysis</label>
                  {currentUser.role === 'ADMIN' ? (
                    <textarea 
                      rows={5} 
                      value={trendAnalysis} 
                      onChange={(e) => setTrendAnalysis(e.target.value)}
                      placeholder="Summarise the key performance trends observed in the data..."
                      className="w-full bg-surface-800/60 border border-surface-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-500 resize-y transition-all duration-200 hover:border-surface-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                    />
                  ) : (
                    <div className="w-full bg-surface-800/40 border border-surface-700/40 rounded-xl px-4 py-3 min-h-[120px]">
                      <p className="text-sm text-surface-200 whitespace-pre-wrap leading-relaxed">
                        {trendAnalysis || <span className="text-surface-500 italic">No trend analysis provided for this period.</span>}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Actionable Improvements</label>
                  {currentUser.role === 'ADMIN' ? (
                    <textarea 
                      rows={5} 
                      value={improvements} 
                      onChange={(e) => setImprovements(e.target.value)}
                      placeholder="List specific, actionable recommendations for the bodyshop..."
                      className="w-full bg-surface-800/60 border border-surface-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-surface-500 resize-y transition-all duration-200 hover:border-surface-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                    />
                  ) : (
                    <div className="w-full bg-surface-800/40 border border-surface-700/40 rounded-xl px-4 py-3 min-h-[120px]">
                      <p className="text-sm text-surface-200 whitespace-pre-wrap leading-relaxed">
                        {improvements || <span className="text-surface-500 italic">No actionable improvements provided for this period.</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-float-in">
              {!hasHistory ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-surface-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-surface-400">No historical reviews available for this bodyshop yet.</p>
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-700 before:to-transparent">
                  {sortedHistoryPeriods.map((periodKey, index) => {
                    const review = companyReviews[periodKey];
                    return (
                      <div key={periodKey} className="relative flex items-start gap-5 sm:gap-6 group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-900 bg-brand-500 text-white shrink-0 shadow-lg z-10 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 glass p-5 sm:p-6 rounded-xl border border-surface-700/50 shadow-xl transition-all hover:-translate-y-1 hover:shadow-brand-500/10">
                          <div className="flex items-center justify-between mb-4 border-b border-surface-700/50 pb-3">
                            <h3 className="font-bold text-white text-lg">{formatPeriod(periodKey)}</h3>
                            <span className="text-xs text-surface-500 uppercase tracking-wider">{new Date(review.timestamp).toLocaleDateString()}</span>
                          </div>
                          {review.trendAnalysis && (
                            <div className="mb-5">
                              <h4 className="text-xs font-semibold text-brand-400/80 uppercase tracking-wider mb-2">Trend Analysis</h4>
                              <p className="text-sm text-surface-200 whitespace-pre-wrap leading-relaxed">{review.trendAnalysis}</p>
                            </div>
                          )}
                          {review.improvements && (
                            <div>
                              <h4 className="text-xs font-semibold text-brand-400/80 uppercase tracking-wider mb-2">Actionable Improvements</h4>
                              <p className="text-sm text-surface-200 whitespace-pre-wrap leading-relaxed">{review.improvements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'current' && currentUser.role === 'ADMIN' && (
          <div className="p-6 border-t border-surface-700/50 bg-surface-900/50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-surface-300 hover:text-white hover:bg-surface-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-[0_0_15px_rgba(0,168,150,0.4)] transition-all">
              Save Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
