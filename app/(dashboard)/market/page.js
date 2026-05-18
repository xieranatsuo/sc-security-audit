'use client';

const MARKET_DATA = [
  { name: 'Ethereum', symbol: 'ETH', price: '$3,245.80', change24h: '+2.4%', marketCap: '$390B', volume: '$12.8B', color: '#627EEA', trend: 'up' },
  { name: 'BNB', symbol: 'BNB', price: '$598.20', change24h: '-0.8%', marketCap: '$89B', volume: '$1.9B', color: '#F0B90B', trend: 'down' },
  { name: 'Polygon', symbol: 'MATIC', price: '$0.72', change24h: '+1.2%', marketCap: '$7.2B', volume: '$320M', color: '#8247E5', trend: 'up' },
  { name: 'Arbitrum', symbol: 'ARB', price: '$1.15', change24h: '+3.8%', marketCap: '$3.1B', volume: '$480M', color: '#28A0F0', trend: 'up' },
  { name: 'Optimism', symbol: 'OP', price: '$2.45', change24h: '-1.2%', marketCap: '$2.8B', volume: '$210M', color: '#FF0420', trend: 'down' },
  { name: 'Avalanche', symbol: 'AVAX', price: '$35.80', change24h: '+0.5%', marketCap: '$13.7B', volume: '$520M', color: '#E84142', trend: 'up' },
  { name: 'Base', symbol: 'ETH', price: '$3,245.80', change24h: '+2.4%', marketCap: 'L2', volume: '$890M', color: '#0052FF', trend: 'up' },
];

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-gray-400">Dashboard</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-400">Blockchain Tools</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-white">Market Data</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Market Data</h1>
          <p className="text-gray-500 text-sm mt-1">Token prices and market activity for supported chains</p>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-semibold">DEMO DATA</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header"><tr>
            <th className="px-4 py-2.5 text-left text-[10px]">Asset</th>
            <th className="px-4 py-2.5 text-right text-[10px]">Price</th>
            <th className="px-4 py-2.5 text-right text-[10px]">24h Change</th>
            <th className="px-4 py-2.5 text-right text-[10px]">Market Cap</th>
            <th className="px-4 py-2.5 text-right text-[10px]">Volume (24h)</th>
          </tr></thead>
          <tbody>
            {MARKET_DATA.map((token, i) => (
              <tr key={i} className="table-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: token.color }} />
                    <div>
                      <p className="text-white text-sm font-medium">{token.name}</p>
                      <p className="text-gray-500 text-[10px]">{token.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-white text-sm font-mono">{token.price}</td>
                <td className={`px-4 py-3 text-right text-sm font-mono ${token.change24h.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{token.change24h}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-sm">{token.marketCap}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-sm">{token.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <p className="text-gray-500 text-xs">Data powered by Binance public API. Prices are indicative and may differ from actual trading prices. Not financial advice.</p>
      </div>
    </div>
  );
}
