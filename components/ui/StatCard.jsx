'use client';

export default function StatCard({ icon, label, value, change, trend, loading = false }) {
  const isPositive = trend === 'up';
  const trendColor = change === 0 ? 'text-zinc-500' : isPositive ? 'text-emerald-500' : 'text-red-400';

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-800" />
          <div className="h-4 w-24 rounded bg-zinc-800" />
        </div>
        <div className="h-8 w-32 rounded bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-zinc-700 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#5e9eff] group-hover:border-zinc-700 transition-colors">
          {icon}
        </div>
        <span className="text-sm text-zinc-500 font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {value}
        </span>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {isPositive ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            ) : change === 0 ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            )}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
