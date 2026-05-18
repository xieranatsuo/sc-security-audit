'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading, logout } = useAuth();
  const [wallet, setWallet] = useState({ connected: false, address: '', connecting: false, error: '' });

  // Check localStorage for saved wallet
  useEffect(() => {
    try {
      const saved = localStorage.getItem('connected_wallet');
      if (saved) setWallet({ connected: true, address: saved, connecting: false, error: '' });
    } catch {}
  }, []);

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, connecting: true, error: '' }));
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const addr = accounts[0];
        localStorage.setItem('connected_wallet', addr);
        setWallet({ connected: true, address: addr, connecting: false, error: '' });
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accs) => {
          if (accs.length === 0) {
            localStorage.removeItem('connected_wallet');
            setWallet({ connected: false, address: '', connecting: false, error: '' });
          } else {
            localStorage.setItem('connected_wallet', accs[0]);
            setWallet(prev => ({ ...prev, address: accs[0] }));
          }
        });
      } else {
        // Mock wallet mode
        const mockAddr = '0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
        localStorage.setItem('connected_wallet', mockAddr);
        localStorage.setItem('wallet_mode', 'mock');
        setWallet({ connected: true, address: mockAddr, connecting: false, error: '' });
      }
    } catch (err) {
      if (err.code === 4001) {
        setWallet(prev => ({ ...prev, connecting: false, error: 'Connection rejected' }));
      } else {
        // Fallback to mock
        const mockAddr = '0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
        localStorage.setItem('connected_wallet', mockAddr);
        localStorage.setItem('wallet_mode', 'mock');
        setWallet({ connected: true, address: mockAddr, connecting: false, error: '' });
      }
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('wallet_mode');
    setWallet({ connected: false, address: '', connecting: false, error: '' });
  };

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

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Wallet Connect */}
        {wallet.connected ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-gray-600/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-gray-300 font-mono">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
              {localStorage.getItem('wallet_mode') === 'mock' && (
                <span className="text-[9px] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded">MOCK</span>
              )}
            </div>
            <button onClick={disconnectWallet} className="text-gray-500 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors" title="Disconnect wallet">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={wallet.connecting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-colors text-xs"
          >
            <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1" />
            </svg>
            <span className="text-orange-400 font-medium">{wallet.connecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-600/30 mx-1" />

        {/* Auth / User */}
        {!loading && user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
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
