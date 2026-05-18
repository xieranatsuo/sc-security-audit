'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading, logout } = useAuth();

  return (
    <header className="h-16 bg-surface-1/80 backdrop-blur-xl border-b border-gray-600/10 sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Left — Search */}
      <div className="flex items-center gap-4 flex-1">
        {searchOpen ? (
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts, addresses, tx hashes..."
              className="bg-transparent text-white text-sm placeholder-gray-500 outline-none flex-1"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 border border-gray-600/30 rounded text-[10px] text-gray-500 font-mono">ESC</kbd>
            <button onClick={() => setSearchOpen(false)} className="text-gray-500 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-gray-600/20 hover:border-gray-600/40 transition-colors text-gray-500 text-sm w-72"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search anything...</span>
            <kbd className="ml-auto inline-flex items-center px-1.5 py-0.5 border border-gray-600/30 rounded text-[10px] font-mono">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Right — Auth / User */}
      <div className="flex items-center gap-2">
        {!loading && user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-white font-medium leading-tight">{user.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{user.email || user.wallet_address?.slice(0, 10) + '...'}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-surface-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : !loading ? (
          <>
            <Link href="/login" className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-xs px-3 py-1.5">
              Sign Up
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
