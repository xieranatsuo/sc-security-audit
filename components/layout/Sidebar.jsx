'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState } from 'react';

const navigation = [
  {
    section: 'Security',
    items: [
      { name: 'Audit Contract', href: '/audit', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { name: 'Batch Scanner', href: '/audit/batch', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { name: 'Vulnerability DB', href: '/vulnerabilities', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
    ],
  },
  {
    section: 'Explorer',
    items: [
      { name: 'Contract Registry', href: '/contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { name: 'Block Explorer', href: '/explorer', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
      { name: 'Transaction Monitor', href: '/transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { name: 'Dashboard', href: '/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { name: 'Risk Analysis', href: '/risk', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { name: 'Gas Tracker', href: '/gas', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { name: 'Market Data', href: '/market', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    section: 'Monitoring',
    items: [
      { name: 'Live Monitor', href: '/monitor', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
      { name: 'Alert Rules', href: '/monitor/alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],
  },
  {
    section: 'System',
    items: [
      { name: 'Audit History', href: '/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { name: 'Settings', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { name: 'API Docs', href: '/docs', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    ],
  },
];

function SvgIcon({ path, className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-screen bg-surface-1 border-r border-gray-600/10 flex flex-col transition-all duration-300 z-50',
      sidebarCollapsed ? 'w-[68px]' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-600/10 shrink-0">
        <Link href="/audit" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-white font-semibold text-sm truncate">Audit Platform</h1>
              <p className="text-gray-500 text-[10px] truncate">Multi-Chain Security</p>
            </div>
          )}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={clsx(
            'w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-surface-2 transition-colors shrink-0',
            sidebarCollapsed && 'mx-auto mt-2'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {navigation.map((group) => (
          <div key={group.section}>
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleSection(group.section)}
                className="flex items-center justify-between w-full px-2 mb-1"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {group.section}
                </span>
                <svg
                  className={clsx('w-3 h-3 text-gray-600 transition-transform', collapsed[group.section] && '-rotate-90')}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {(!collapsed[group.section] || sidebarCollapsed) && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/audit' && pathname.startsWith(item.href + '/'));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={clsx(
                        'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                        sidebarCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2',
                        isActive
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-surface-2 border border-transparent'
                      )}
                    >
                      <SvgIcon
                        path={item.icon}
                        className={clsx('w-[18px] h-[18px] shrink-0', isActive ? 'text-blue-400' : 'text-gray-500')}
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                      {!sidebarCollapsed && item.href === '/audit/batch' && (
                        <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-semibold">PRO</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Chain Status */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t border-gray-600/10">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2 px-1">Chain Status</p>
          <div className="space-y-1.5">
            {[
              { name: 'Ethereum', status: 'connected', block: '19.2M' },
              { name: 'BNB Chain', status: 'connected', block: '38.1M' },
              { name: 'Polygon', status: 'connected', block: '55.4M' },
              { name: 'Arbitrum', status: 'connected', block: '210.8M' },
            ].map((chain) => (
              <div key={chain.name} className="flex items-center justify-between px-2 py-1.5 rounded bg-surface-2/50">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs text-gray-400">{chain.name}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{chain.block}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-600/10 shrink-0">
        <div className={clsx('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">Admin</p>
                <p className="text-gray-500 text-[10px] truncate">Enterprise · Unlimited</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
