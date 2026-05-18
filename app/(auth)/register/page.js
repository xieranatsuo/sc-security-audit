'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register, connectWallet } = useAuth();
  const [method, setMethod] = useState(null); // null = choose, 'email' | 'wallet'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletStep, setWalletStep] = useState('connect'); // 'connect' | 'signing' | 'done'

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, name);
      router.push('/audit');
    } catch (err) { setError(err.message || 'Registration failed'); }
    finally { setIsLoading(false); }
  };

  const handleWalletConnect = async () => {
    setError('');
    setIsLoading(true);
    try {
      setWalletStep('signing');
      const user = await connectWallet();
      setWalletAddress(user?.wallet_address || '');
      setWalletStep('done');
      setTimeout(() => router.push('/audit'), 800);
    } catch (err) {
      if (err.code === 4001) { setError('Signature rejected. Please sign the message to continue.'); }
      else { setError(err.message || 'Wallet connection failed'); }
      setWalletStep('connect');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="text-gray-500 text-sm mt-1">Start auditing smart contracts</p>
      </div>

      {/* Method Selector */}
      {!method && (
        <div className="space-y-3">
          {/* Wallet Option */}
          <button onClick={() => setMethod('wallet')} className="w-full card-hover flex items-center gap-4 p-4 text-left group">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:border-orange-500/40">
              <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1" />
                <path d="M12 12h9m-4-4l4 4-4 4" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Connect Wallet</p>
              <p className="text-gray-500 text-xs mt-0.5">MetaMask, Rabby, WalletConnect</p>
            </div>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Email Option */}
          <button onClick={() => setMethod('email')} className="w-full card-hover flex items-center gap-4 p-4 text-left group">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:border-indigo-500/40">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Email & Password</p>
              <p className="text-gray-500 text-xs mt-0.5">Create account with email</p>
            </div>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600/20" /></div>
            <div className="relative flex justify-center"><span className="bg-surface-0 px-3 text-[10px] text-gray-500 uppercase tracking-wider">or</span></div>
          </div>

          {/* Skip */}
          <Link href="/audit" className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Continue without account →
          </Link>
        </div>
      )}

      {/* Email Form */}
      {method === 'email' && (
        <div className="card animate-fade-in">
          <button onClick={() => { setMethod(null); setError(''); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white mb-4 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="input w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} className="input w-full text-sm" />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-red-400 text-xs">{error}</p></div>}
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {/* Wallet Flow */}
      {method === 'wallet' && (
        <div className="card animate-fade-in">
          <button onClick={() => { setMethod(null); setError(''); setWalletStep('connect'); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white mb-4 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>

          {walletStep === 'connect' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1" />
                  </svg>
                </div>
                <p className="text-white font-medium">Connect Your Wallet</p>
                <p className="text-gray-500 text-xs mt-1">Sign a message to verify ownership</p>
              </div>

              {/* Wallet Options */}
              <div className="space-y-2">
                {[
                  { name: 'MetaMask', icon: '🦊', detect: () => window.ethereum?.isMetaMask && !window.ethereum?.isRabby },
                  { name: 'Rabby', icon: '🐰', detect: () => window.ethereum?.isRabby },
                  { name: 'Browser Wallet', icon: '🌐', detect: () => !!window.ethereum },
                ].map((wallet) => (
                  <button key={wallet.name} onClick={handleWalletConnect} disabled={isLoading} className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-gray-600/20 hover:border-orange-500/30 transition-colors text-left">
                    <span className="text-xl">{wallet.icon}</span>
                    <span className="text-sm text-gray-300">{wallet.name}</span>
                    <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-gray-500 text-center">No wallet? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Install MetaMask</a></p>
            </div>
          )}

          {walletStep === 'signing' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Check your wallet</p>
              <p className="text-gray-500 text-xs mt-1">Sign the message to verify your identity</p>
              {walletAddress && <p className="text-gray-500 text-xs font-mono mt-2">{walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}</p>}
            </div>
          )}

          {walletStep === 'done' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-emerald-400 font-medium">Connected!</p>
              <p className="text-gray-500 text-xs mt-1">Redirecting to dashboard...</p>
            </div>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4"><p className="text-red-400 text-xs">{error}</p></div>}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-500 mt-6">
        Already have an account? <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
