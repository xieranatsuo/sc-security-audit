'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Audit Contract', href: '/audit', icon: '🔍' },
  { name: 'Contract Registry', href: '/contracts', icon: '📋' },
  { name: 'Monitor', href: '/monitor', icon: '📡' },
  { name: 'Market Data', href: '/market', icon: '📊' },
  { name: 'Risk Dashboard', href: '/risk', icon: '⚠️' },
  { name: 'Block Explorer', href: '/explorer', icon: '🔗' },
  { name: 'Audit History', href: '/history', icon: '📜' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-1 border-r border-gray-600/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-600/10">
        <Link href="/audit" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">Audit Platform</h1>
            <p className="text-gray-500 text-xs">Multi-Chain Security</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  : 'text-gray-400 hover:text-white hover:bg-surface-2'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-600/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-surface-3 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xs">GA</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Garok</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
          <span className="ml-auto w-2 h-2 bg-accent-green rounded-full" />
        </div>
      </div>
    </aside>
  );
}
