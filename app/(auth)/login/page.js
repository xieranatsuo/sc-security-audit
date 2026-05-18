'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, connectWallet } = useAuth();
  const [method, setMethod] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/audit');
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setIsLoading(false); }
  };

  const handleWalletLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await connectWallet();
      router.push('/audit');
    } catch (err) {
      if (err.code === 4001) setError('Signature rejected.');
      else setError(err.message || 'Wallet connection failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
      </div>

      {!method && (
        <div className="space-y-3">
          <button onClick={() => setMethod('wallet')} className="w-full card-hover flex items-center gap-4 p-4 text-left group">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1" /></svg>
            </div>
            <div><p className="text-white font-medium">Connect Wallet</p><p className="text-gray-500 text-xs mt-0.5">Sign in with MetaMask</p></div>
            <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          <button onClick={() => setMethod('email')} className="w-full card-hover flex items-center gap-4 p-4 text-left group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div><p className="text-white font-medium">Email & Password</p><p className="text-gray-500 text-xs mt-0.5">Sign in with credentials</p></div>
            <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600/20" /></div>
            <div className="relative flex justify-center"><span className="bg-surface-0 px-3 text-[10px] text-gray-500 uppercase tracking-wider">or</span></div>
          </div>
          <Link href="/audit" className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">Continue without account →</Link>
        </div>
      )}

      {method === 'email' && (
        <div className="card animate-fade-in">
          <button onClick={() => { setMethod(null); setError(''); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
          </button>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div><label className="block text-xs text-gray-400 mb-1.5">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input w-full text-sm" /></div>
            <div><label className="block text-xs text-gray-400 mb-1.5">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required className="input w-full text-sm" /></div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-red-400 text-xs">{error}</p></div>}
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>
      )}

      {method === 'wallet' && (
        <div className="card animate-fade-in">
          <button onClick={() => { setMethod(null); setError(''); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
          </button>
          <div className="text-center py-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1" /></svg>
            </div>
            <p className="text-white font-medium">Connect & Sign</p>
            <p className="text-gray-500 text-xs mt-1">Sign a message to verify wallet ownership</p>
          </div>
          <button onClick={handleWalletLogin} disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting...</> : 'Connect Wallet'}
          </button>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4"><p className="text-red-400 text-xs">{error}</p></div>}
        </div>
      )}

      <p className="text-center text-xs text-gray-500 mt-6">
        Don't have an account? <Link href="/register" className="text-blue-400 hover:underline">Create one</Link>
      </p>
    </div>
  );
}
