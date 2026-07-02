import React, { useState, useEffect } from 'react';
import { getProfiles, getCompanies, inviteCustomer, createCompany, deleteCompany } from '../services/db';
import { useAuth } from './AuthProvider';

export default function CustomerManagement() {
  const [profiles, setProfiles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [inviteStatus, setInviteStatus] = useState({ loading: false, error: null, success: false });
  
  // Delete state
  const [deleteConfirmCompany, setDeleteConfirmCompany] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, error: null });

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
    if (!email) return;

    let targetCompanyId = selectedCompanyId;

    if (isNewCompany) {
      if (!newCompanyId || !newCompanyName) return;
      targetCompanyId = newCompanyId;
    } else {
      if (!selectedCompanyId) return;
    }

    setInviteStatus({ loading: true, error: null, success: false });
    try {
      if (isNewCompany) {
        await createCompany(newCompanyId, newCompanyName);
      }
      
      // Pass the JWT token so the edge function can verify ADMIN status
      await inviteCustomer(email, targetCompanyId, session.access_token);
      setInviteStatus({ loading: false, error: null, success: true });
      setShowInviteModal(false);
      setEmail('');
      setNewCompanyId('');
      setNewCompanyName('');
      setIsNewCompany(false);
      setSelectedCompanyId('');
      
      // Refresh list
      fetchData();
    } catch (error) {
      setInviteStatus({ loading: false, error: error.message, success: false });
    }
  };

  const executeDeleteCompany = async () => {
    if (!deleteConfirmCompany) return;
    setDeleteStatus({ loading: true, error: null });
    try {
      await deleteCompany(deleteConfirmCompany.id);
      setDeleteConfirmCompany(null);
      fetchData(); // refresh list
    } catch (err) {
      setDeleteStatus({ loading: false, error: err.message });
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
                    <td className="px-6 py-4 flex items-center justify-between group">
                      <span>{profile.companies?.name || profile.company_id || 'Unassigned'}</span>
                      {profile.company_id && profile.role !== 'ADMIN' && (
                        <button 
                          onClick={() => setDeleteConfirmCompany({ id: profile.company_id, name: profile.companies?.name || profile.company_id })} 
                          className="opacity-0 group-hover:opacity-100 text-surface-500 hover:text-danger-400 transition-all p-1.5 rounded hover:bg-danger-500/10" 
                          title="Delete Company & Data"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl w-full max-w-md p-6 border border-danger-500/30 shadow-2xl relative animate-scale-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-danger-500/20 flex items-center justify-center mb-4 text-danger-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Delete Company?</h3>
            <p className="text-surface-300 text-sm mb-6 text-center">
              Are you absolutely sure you want to delete <strong className="text-white">{deleteConfirmCompany.name}</strong>? 
              This will permanently delete all of their analytics data and configuration. This action cannot be undone.
            </p>
            
            {deleteStatus.error && (
              <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm p-3 rounded-lg mb-6">
                {deleteStatus.error}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirmCompany(null)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:text-white transition-colors border border-surface-700 hover:bg-surface-800"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteCompany}
                disabled={deleteStatus.loading}
                className="bg-danger-600 hover:bg-danger-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deleteStatus.loading ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider">Company Assignment</label>
                  <button 
                    type="button" 
                    onClick={() => setIsNewCompany(!isNewCompany)}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    {isNewCompany ? 'Select Existing Company' : '+ Add New Company'}
                  </button>
                </div>
                
                {isNewCompany ? (
                  <div className="space-y-3 bg-surface-800/50 p-4 rounded-lg border border-surface-700/50">
                    <div>
                      <label className="block text-xs text-surface-400 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        required={isNewCompany}
                        placeholder="e.g. Elite Smash Repairs"
                        value={newCompanyName}
                        onChange={e => setNewCompanyName(e.target.value)}
                        className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-surface-400 mb-1">Company ID (Unique)</label>
                      <input 
                        type="text" 
                        required={isNewCompany}
                        placeholder="e.g. 1234.au"
                        value={newCompanyId}
                        onChange={e => setNewCompanyId(e.target.value)}
                        className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <select 
                      required={!isNewCompany}
                      value={selectedCompanyId}
                      onChange={e => setSelectedCompanyId(e.target.value)}
                      className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a company...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                      ))}
                    </select>
                    <p className="text-xs text-surface-500 mt-1">Select from companies created via data upload.</p>
                  </div>
                )}
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
