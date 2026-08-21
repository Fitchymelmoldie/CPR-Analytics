import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function SetPasswordScreen({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    
    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      // Successfully set password, tell parent component to move on
      setLoading(false);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#101112] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      <div className="codex-dialog w-full max-w-sm p-6 sm:p-7 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl border border-brand-400/20 bg-brand-400/[0.08] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Set Your Password
          </h1>
          <p className="text-surface-400 text-sm text-center">Please secure your account to access the CPR Analytics Dashboard.</p>
        </div>
        
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">New Password</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="codex-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                className="codex-input w-full px-3 py-2.5 text-sm"
              />
            </div>

            {error && <p className="text-danger-400 text-xs text-center font-medium m-0">{error}</p>}
            
            <button 
              type="submit"
              disabled={loading}
              className="codex-button codex-button-primary mt-2 w-full gap-2 px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Save and Continue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
