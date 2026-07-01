import React from 'react';
import ThreeLogo from './ThreeLogo';
export default     function Header({ onReset, showReset, onLogout, currentUser, onExport, showExport, hasNotification, onNotificationClick }) {
      return (
        <header className="sticky top-0 z-50 glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThreeLogo />
              <div>
                <h1 className="text-base font-bold tracking-tight">
                  <span className="gradient-text" title="Correct Protect Restore">CPR</span>
                  <span className="text-surface-300 font-medium ml-1.5">Analytics</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-surface-300">
                    {currentUser.role} {currentUser.role === 'CUSTOMER' ? `(${currentUser.companyName})` : ''}
                  </span>
                </div>
              )}
              {currentUser && (
                <button onClick={onNotificationClick} className="relative p-2 text-surface-400 hover:text-white transition-colors" title="Consultant Reviews">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {hasNotification && (
                    <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-danger-500 border-2 border-surface-900 rounded-full animate-pulse"></span>
                  )}
                </button>
              )}
              {showExport && currentUser?.role === 'ADMIN' && (
                <button onClick={onExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/50 text-surface-300 hover:text-white text-sm font-medium transition-all duration-200"
                  title="Export Data">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
              {showReset && currentUser?.role === 'ADMIN' && (
                <button onClick={onReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-800/60 hover:bg-surface-700/60 border border-surface-700/50 text-surface-300 hover:text-white text-sm font-medium transition-all duration-200"
                  title="New Upload">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  <span className="hidden sm:inline">New Upload</span>
                </button>
              )}
              {onLogout && (
                <button onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger-500/10 hover:bg-danger-500/20 border border-danger-500/20 text-danger-400 hover:text-danger-300 text-sm font-medium transition-all duration-200"
                  title="Logout">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </header>
      );
    }

