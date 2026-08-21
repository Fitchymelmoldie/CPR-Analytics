import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      let friendlyMsg = signInError.message;
      if (friendlyMsg.toLowerCase().includes('invalid login credentials')) {
        friendlyMsg = 'The email or password you entered is incorrect. Please try again.';
      } else if (friendlyMsg.toLowerCase().includes('email not confirmed')) {
        friendlyMsg = 'Please verify your email address before logging in.';
      } else if (friendlyMsg.toLowerCase().includes('failed to fetch')) {
        friendlyMsg = 'We could not reach the login service. Check your connection and try again.';
      }
      setError(friendlyMsg);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#101112] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      <div className="codex-dialog w-full max-w-sm p-6 sm:p-7 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl border border-brand-400/20 bg-brand-400/[0.08] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-5 3.5 11 2.5-6h6" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white mb-1">
            <span className="gradient-text">CPR</span> Analytics
          </h1>
          <p className="text-surface-400 text-sm">Consultancy Dashboard Access</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Email</label>
              <input 
                id="login-email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="codex-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Secure Login
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
