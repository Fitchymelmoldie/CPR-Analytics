import React from 'react';
export default function ThreeLogo() {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-danger-500 shadow-lg shadow-brand-500/30 flex items-center justify-center relative overflow-hidden group">
          {/* Subtle pulse animation behind the icon */}
          <div className="absolute inset-0 bg-white/20 animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
          
          <svg className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-5 3.5 11 2.5-6h6" />
          </svg>
        </div>
      );
    }

