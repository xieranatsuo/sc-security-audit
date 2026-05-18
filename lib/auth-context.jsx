'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.data?.user) {
          setUser(data.data.user);
        }
      }
    } catch {}
    setLoading(false);
  };

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No wallet detected. Install MetaMask or another Web3 wallet.');
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // Create SIWE message
    const domain = window.location.host;
    const uri = window.location.origin;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const nonce = Math.random().toString(36).slice(2, 10);

    const message = [
      `${domain} wants you to sign in with your Ethereum account:`,
      address,
      '',
      'Sign in to Smart Contract Audit Platform',
      '',
      `URI: ${uri}`,
      `Chain ID: ${parseInt(chainId)}`,
      `Nonce: ${nonce}`,
      `Issued At: ${new Date().toISOString()}`,
    ].join('\n');

    // Sign message
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });

    // Send to backend
    const res = await fetch('/api/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature, message, chainId: parseInt(chainId) }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, connectWallet, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
