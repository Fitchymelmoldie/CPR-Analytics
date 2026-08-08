import React from 'react';
import ThreeLogo from './ThreeLogo';

const ICON_PATHS = {
  dashboard: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  profile: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  data: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7 M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4 M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  leaderboards: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  customers: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  reviews: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  logout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
};

const WORKSPACE_ITEMS = [
  { id: 'dashboard', label: 'Visual Dashboard', icon: 'dashboard' },
  { id: 'profile', label: 'Shop Profile', icon: 'profile' }
];

const ADMIN_ITEMS = [
  { id: 'raw-data', label: 'Data & Imports', icon: 'data' },
  { id: 'leaderboards', label: 'Gamified Leaderboards', icon: 'leaderboards' },
  { id: 'customers', label: 'Customer Management', icon: 'customers' }
];

function SidebarIcon({ name, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

function NavButton({ item, active, collapsed, onClick, notification }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
        collapsed ? 'lg:justify-center lg:gap-0 lg:px-3 lg:py-3' : ''
      } ${
        active
          ? 'border-brand-500/35 bg-brand-500/[0.12] text-white shadow-[0_8px_24px_rgba(0,168,150,0.10)]'
          : 'border-transparent text-surface-400 hover:border-white/5 hover:bg-white/[0.04] hover:text-surface-100'
      }`}
    >
      <span className={`relative shrink-0 ${active ? 'text-brand-300' : 'text-surface-500 group-hover:text-surface-300'}`}>
        <SidebarIcon name={item.icon} />
        {notification && collapsed && (
          <span className="absolute -right-1 -top-1 hidden h-2.5 w-2.5 rounded-full border-2 border-surface-900 bg-danger-500 lg:block" />
        )}
      </span>
      <span className={`min-w-0 flex-1 truncate text-left ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
      {notification && <span className={`h-2.5 w-2.5 rounded-full bg-danger-500 shadow-[0_0_12px_rgba(239,68,68,0.75)] ${collapsed ? 'lg:hidden' : ''}`} />}
      {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-brand-400" />}
    </button>
  );
}

export default function AppSidebar({
  activeTab,
  onNavigate,
  currentUser,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  onOpenReviews,
  hasNotification,
  onLogout
}) {
  const isAdmin = currentUser?.role === 'ADMIN';
  const navigate = (tab) => {
    onNavigate(tab);
    onCloseMobile();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-black/65 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-white/[0.07] bg-surface-900/95 shadow-2xl backdrop-blur-xl transition-[transform,width] duration-300 lg:visible lg:sticky lg:top-0 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        <div className={`flex h-20 items-center justify-between border-b border-white/[0.06] px-5 ${collapsed ? 'lg:justify-center lg:px-3' : ''}`}>
          <div className="flex min-w-0 items-center gap-3">
            <ThreeLogo />
            <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <div className="text-base font-bold tracking-tight">
                <span className="gradient-text">CPR</span>
                <span className="ml-1.5 font-medium text-surface-200">Analytics</span>
              </div>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-500">Bodyshop intelligence</p>
            </div>
          </div>

          <button type="button" onClick={onCloseMobile} className="rounded-lg p-2 text-surface-500 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Close navigation">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Primary navigation">
          <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-surface-600 ${collapsed ? 'lg:hidden' : ''}`}>Workspace</p>
          <div className="space-y-1">
            {WORKSPACE_ITEMS.map(item => (
              <NavButton key={item.id} item={item} active={activeTab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
            ))}
            <NavButton
              item={{ id: 'reviews', label: 'Consultant Reviews', icon: 'reviews' }}
              active={false}
              collapsed={collapsed}
              notification={hasNotification}
              onClick={() => { onOpenReviews(); onCloseMobile(); }}
            />
          </div>

          {isAdmin && (
            <div className="mt-7 border-t border-white/[0.06] pt-5">
              <p className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-surface-600 ${collapsed ? 'lg:hidden' : ''}`}>Administration</p>
              <div className="space-y-1">
                {ADMIN_ITEMS.map(item => (
                  <NavButton key={item.id} item={item} active={activeTab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <div className={`mb-2 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 ${collapsed ? 'lg:p-2' : ''}`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center lg:gap-0' : ''}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-xs font-bold text-brand-300 ring-1 ring-brand-500/25">
                {currentUser?.role === 'ADMIN' ? 'AD' : (currentUser?.companyName || 'BS').slice(0, 2).toUpperCase()}
              </div>
              <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
                <p className="truncate text-xs font-semibold text-surface-100">{currentUser?.role === 'ADMIN' ? 'Administrator' : currentUser?.companyName}</p>
                <p className="truncate text-[10px] text-surface-500">{currentUser?.email}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-sm font-medium text-danger-400 transition-colors hover:border-danger-500/20 hover:bg-danger-500/10 hover:text-danger-300 ${collapsed ? 'lg:justify-center lg:gap-0 lg:p-3' : ''}`}
          >
            <SidebarIcon name="logout" />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>

          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="mt-2 hidden w-full items-center justify-center rounded-xl border border-white/[0.06] py-2 text-surface-500 transition-colors hover:bg-white/[0.04] hover:text-white lg:flex"
          >
            <svg className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
