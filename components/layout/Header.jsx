'use client';

import { useState } from 'react';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-surface-1/80 backdrop-blur-xl border-b border-gray-600/10 sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Left — Breadcrumb + Search */}
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
        {/* Chain Selector */}
        <ChainSelector />

        {/* Quick Actions */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-2 transition-colors relative">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-surface-1" />
        </button>

        {/* Docs */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-2 transition-colors">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-600/30 mx-1" />

        {/* User Menu */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">G</span>
          </div>
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function ChainSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('all');

  const chains = [
    { id: 'all', name: 'All Chains', icon: '🌐' },
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA' },
    { id: 'bsc', name: 'BNB Chain', icon: '◆', color: '#F0B90B' },
    { id: 'polygon', name: 'Polygon', icon: '⬡', color: '#8247E5' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', color: '#28A0F0' },
  ];

  const current = chains.find(c => c.id === selected);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-gray-600/20 hover:border-gray-600/40 transition-colors text-sm"
      >
        <span>{current?.icon}</span>
        <span className="text-gray-300">{current?.name}</span>
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-surface-2 border border-gray-600/20 rounded-lg shadow-xl py-1 z-50">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => { setSelected(chain.id); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-surface-3 transition-colors ${selected === chain.id ? 'text-blue-400' : 'text-gray-400'}`}
            >
              <span>{chain.icon}</span>
              <span>{chain.name}</span>
              {selected === chain.id && (
                <svg className="w-4 h-4 ml-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
