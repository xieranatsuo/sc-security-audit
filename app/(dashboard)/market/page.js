'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function MarketPage() {
  const { data, isLoading } = useSWR('/api/market/data?symbols=ETH,BNB,MATIC,ARB', fetcher, {
    refreshInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Data</h1>
        <p className="text-gray-500 mt-1">Live token prices from Binance</p>
      </div>

      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data?.prices && (
        <div className="grid grid-cols-2 gap-4">
          {data.prices.map((token) => (
            <div key={token.symbol} className="card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{token.symbol}</h3>
                  <p className="text-gray-500 text-sm">Source: Binance</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm font-medium ${token.change24h >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600/10 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">24h High</p>
                  <p className="text-sm text-white">${token.high24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">24h Low</p>
                  <p className="text-sm text-white">${token.low24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">24h Volume</p>
                  <p className="text-sm text-white">${(token.volume24h / 1e6).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
