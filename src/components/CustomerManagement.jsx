import React, { useState, useEffect } from 'react';
import { getProfiles, getCompanies, inviteCustomer, createCompany, deleteCompany, deleteCustomer } from '../services/db';
import { useAuth } from './AuthProvider';

export default function CustomerManagement({ onOpenDashboard }) {
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

  // User Delete state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteUserStatus, setDeleteUserStatus] = useState({ loading: false, error: null });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

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

    setInviteStatus({ loading: true, error: null, success: false, inviteLink: null });
    try {
      if (isNewCompany) {
        await createCompany(newCompanyId, newCompanyName);
      }
      
      // Pass the JWT token so the edge function can verify ADMIN status
      const response = await inviteCustomer(email, targetCompanyId, session.access_token);
      
      setInviteStatus({ loading: false, error: null, success: true, inviteLink: response.inviteLink });
      setEmail('');
      setNewCompanyId('');
      setNewCompanyName('');
      setIsNewCompany(false);
      setSelectedCompanyId('');
      
      // Refresh list
      fetchData();
    } catch (error) {
      console.error("Invite error:", error);
      // Try to extract more details if it's a generic error
      let errMsg = error.message;
      if (errMsg === 'Edge Function returned a non-2xx status code' && error.context) {
        errMsg = `Edge function error: ${JSON.stringify(error.context)}`;
      }
      setInviteStatus({ loading: false, error: errMsg, success: false, inviteLink: null });
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

  const executeDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleteUserStatus({ loading: true, error: null });
    try {
      await deleteCustomer(deleteConfirmUser.id, session.access_token);
      setDeleteConfirmUser(null);
      setSelectedProfile(null);
      fetchData(); // refresh list
    } catch (err) {
      setDeleteUserStatus({ loading: false, error: err.message });
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const search = searchQuery.toLowerCase();
    const email = (p.email || '').toLowerCase();
    const role = (p.role || '').toLowerCase();
    const company = (p.companies?.name || p.company_id || '').toLowerCase();
    return email.includes(search) || role.includes(search) || company.includes(search);
  });

  return (
    <div className="codex-page customer-management animate-fade-in">
      <div className="codex-page-heading">
        <div>
          <h2>Customer Management</h2>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="codex-button codex-button-primary h-9 gap-2 px-3 text-xs"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite Customer
        </button>
      </div>

      <div className="codex-toolbar">
        <p className="text-xs text-surface-500">{filteredProfiles.length} {filteredProfiles.length === 1 ? 'account' : 'accounts'}</p>
        <div className="relative w-full sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by email, role, or company..."
          className="codex-input block w-full py-2.5 pl-10 pr-3 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        </div>
      </div>

      <div className="codex-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-surface-400">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="codex-table text-left">
              <thead className="bg-surface-800/50 text-xs uppercase text-surface-400 font-semibold border-b border-surface-700/50">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Actions</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-white">{profile.companies?.name || (profile.role === 'ADMIN' ? 'CPR Analytics' : profile.company_id || 'Unassigned')}</p>
                      <p className="mt-1 font-mono text-[10px] text-surface-600" title={profile.id}>{profile.id.substring(0, 8)}...{profile.id.substring(profile.id.length - 4)}</p>
                    </td>
                    <td className="px-6 py-4 text-surface-300">
                      {profile.email || <span className="text-surface-600 italic">No email</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between group">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.role === 'ADMIN' ? 'bg-danger-500/20 text-danger-400' : 'bg-brand-500/20 text-brand-400'
                        }`}>
                          {profile.role}
                        </span>
                        {profile.id !== session?.user?.id && (
                          <button 
                            onClick={() => setDeleteConfirmUser({ id: profile.id })} 
                            className="text-surface-600 hover:text-danger-400 transition-colors p-1.5 rounded hover:bg-danger-500/10"
                            title="Delete User Account"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between group">
                        <span>{profile.role === 'ADMIN' ? 'System Administrator' : (profile.companies?.name || profile.company_id || 'Unassigned')}</span>
                        {profile.company_id && profile.role !== 'ADMIN' && (
                          <button 
                            onClick={() => setDeleteConfirmCompany({ id: profile.company_id, name: profile.companies?.name || profile.company_id })} 
                            className="text-surface-600 hover:text-danger-400 transition-colors p-1.5 rounded hover:bg-danger-500/10"
                            title="Delete Company & Data"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                      {profile.company_id && profile.role !== 'ADMIN' && onOpenDashboard ? (
                        <button
                          type="button"
                          onClick={() => onOpenDashboard(profile.company_id)}
                          className="text-xs font-semibold text-brand-300 transition-colors hover:text-white"
                          aria-label={`Open ${profile.companies?.name || profile.company_id} dashboard`}
                        >
                          Open dashboard
                        </button>
                      ) : (
                        <span className="text-surface-600">—</span>
                      )}
                      <button type="button" onClick={() => setSelectedProfile(profile)} className="text-xs font-semibold text-surface-400 transition-colors hover:text-white" aria-label={`View ${profile.email || profile.id} details`}>Details</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-surface-500 whitespace-nowrap">
                      {new Date(profile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {filteredProfiles.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-surface-500">
                      {profiles.length === 0 ? 'No users found.' : 'No users match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProfile ? (
        <>
          <button type="button" aria-label="Dismiss customer details" className="fixed inset-0 z-[59] bg-black/45 lg:bg-transparent" onClick={() => setSelectedProfile(null)} />
          <aside className="fixed bottom-0 right-0 top-14 z-[60] flex w-full max-w-96 flex-col border-l border-white/[0.08] bg-[#15171a] shadow-[-20px_0_60px_rgba(0,0,0,0.32)]" aria-labelledby="customer-details-title">
            <div className="flex items-start justify-between border-b border-white/[0.07] p-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-500">Customer account</p>
                <h3 id="customer-details-title" className="mt-1 truncate text-base font-semibold text-white">{selectedProfile.companies?.name || selectedProfile.email || selectedProfile.id}</h3>
              </div>
              <button type="button" onClick={() => setSelectedProfile(null)} className="codex-icon-button grid h-8 w-8 place-items-center" aria-label="Close customer details">×</button>
            </div>
            <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-4 p-4 text-xs">
              <dt className="text-surface-500">Email</dt><dd className="break-all text-surface-200">{selectedProfile.email || 'No email recorded'}</dd>
              <dt className="text-surface-500">Role</dt><dd className="text-surface-200">{selectedProfile.role}</dd>
              <dt className="text-surface-500">Company</dt><dd className="text-surface-200">{selectedProfile.companies?.name || selectedProfile.company_id || 'Unassigned'}</dd>
              <dt className="text-surface-500">Joined</dt><dd className="text-surface-200">{new Date(selectedProfile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</dd>
              <dt className="text-surface-500">User ID</dt><dd className="break-all font-mono text-[10px] text-surface-400">{selectedProfile.id}</dd>
            </dl>
            <div className="mt-auto space-y-2 border-t border-white/[0.07] p-4">
              {selectedProfile.company_id && selectedProfile.role !== 'ADMIN' && onOpenDashboard ? <button type="button" onClick={() => onOpenDashboard(selectedProfile.company_id)} className="codex-button codex-button-primary w-full px-3 py-2.5 text-xs">Open customer workspace</button> : null}
              {selectedProfile.id !== session?.user?.id ? <button type="button" onClick={() => setDeleteConfirmUser({ id: selectedProfile.id })} className="codex-button codex-button-danger w-full px-3 py-2.5 text-xs">Delete user account</button> : null}
              {selectedProfile.company_id && selectedProfile.role !== 'ADMIN' ? <button type="button" onClick={() => setDeleteConfirmCompany({ id: selectedProfile.company_id, name: selectedProfile.companies?.name || selectedProfile.company_id })} className="w-full px-3 py-2 text-xs font-medium text-danger-400 hover:text-danger-300">Delete company and data</button> : null}
            </div>
          </aside>
        </>
      ) : null}

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="codex-dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="codex-dialog relative w-full max-w-md p-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-danger-500/20 flex items-center justify-center mb-4 text-danger-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Delete User Account?</h3>
            <p className="text-surface-300 text-sm mb-6 text-center">
              Are you absolutely sure you want to delete the user <strong className="text-white font-mono">{deleteConfirmUser.id}</strong>? 
              This will permanently revoke their access.
            </p>
            
            {deleteUserStatus.error && (
              <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm p-3 rounded-lg mb-6 break-words">
                {deleteUserStatus.error}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirmUser(null)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:text-white transition-colors border border-surface-700 hover:bg-surface-800"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteUser}
                disabled={deleteUserStatus.loading}
                className="bg-danger-600 hover:bg-danger-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deleteUserStatus.loading ? 'Deleting...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCompany && (
        <div className="codex-dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="codex-dialog relative w-full max-w-md p-6">
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
        <div className="codex-dialog-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="codex-dialog relative w-full max-w-md p-6">
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
            
            {inviteStatus.success ? (
              <div className="bg-brand-900/50 border border-brand-500 text-brand-400 p-4 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Invitation sent successfully!</h4>
                    <p className="text-xs text-brand-300/80 mb-3">An email has been dispatched to the customer containing a secure link to set their password.</p>
                  </div>
                </div>
              </div>
            ) : (
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
                    <p className="text-xs text-surface-500 mt-1">Select an existing company from the database.</p>
                  </div>
                )}
              </div>

              {inviteStatus.error && (
                <div className="bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm p-3 rounded-lg mt-4">
                  {inviteStatus.error}
                </div>
              )}

              {!inviteStatus.success && (
                <div className="pt-2 flex justify-end gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-surface-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={inviteStatus.loading || !email || (!isNewCompany && !selectedCompanyId) || (isNewCompany && (!newCompanyId || !newCompanyName))}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(0,168,150,0.4)] hover:shadow-[0_0_25px_rgba(0,168,150,0.6)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteStatus.loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Invite'
                    )}
                  </button>
                </div>
              )}
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
