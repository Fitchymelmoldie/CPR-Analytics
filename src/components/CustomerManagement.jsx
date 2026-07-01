import React, { useState, useEffect } from 'react';
import { getProfiles, getCompanies, inviteCustomer } from '../services/db';
import { useAuth } from './AuthProvider';

export default function CustomerManagement() {
  const [profiles, setProfiles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [inviteStatus, setInviteStatus] = useState({ loading: false, error: null, success: false });

  const { session } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesData, companiesData] = await Promise.all([
        getProfiles(),
        getCompanies()
      ]);
      setProfiles(profilesData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !selectedCompanyId) return;

    setInviteStatus({ loading: true, error: null, success: false });
    try {
      // Pass the JWT token so the edge function can verify ADMIN status
      await inviteCustomer(email, selectedCompanyId, session.access_token);
      setInviteStatus({ loading: false, error: null, success: true });
      setShowInviteModal(false);
      setEmail('');
      setSelectedCompanyId('');
      fetchData(); // Refresh list
    } catch (error) {
      setInviteStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Customer Management</h2>
          <p className="text-surface-400 text-sm">Manage user access and onboard new clients.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium shadow-[0_0_15px_rgba(0,168,150,0.3)] transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite Customer
        </button>
      </div>

      <div className="glass rounded-xl border border-surface-700/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-surface-400">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-surface-300">
              <thead className="bg-surface-800/50 text-xs uppercase text-surface-400 font-semibold border-b border-surface-700/50">
                <tr>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs truncate max-w-[150px]" title={profile.id}>
                      {profile.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.role === 'ADMIN' ? 'bg-danger-500/20 text-danger-400' : 'bg-brand-500/20 text-brand-400'
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {profile.companies?.name || profile.company_id || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-surface-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-surface-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl w-full max-w-md p-6 border border-surface-700 shadow-2xl relative animate-scale-in">
            <button 
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2">Invite New Customer</h3>
            <p className="text-surface-400 text-sm mb-6">They will receive an email with a secure link to set their password.</p>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="client@bodyshop.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Assign to Company</label>
                <select 
                  required
                  value={selectedCompanyId}
                  onChange={e => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                >
                  <option value="" disabled>Select a company...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
                <p className="text-xs text-surface-500 mt-1">Make sure the company has been created via data upload first.</p>
              </div>

              {inviteStatus.error && (
                <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm p-3 rounded-lg">
                  {inviteStatus.error}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-surface-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={inviteStatus.loading}
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(0,168,150,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {inviteStatus.loading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
