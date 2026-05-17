'use client';

export function RiskScoreCard({ riskScore }) {
  const { score, label, color, breakdown, formula } = riskScore;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Risk Score</h3>
          <p className="text-gray-500 text-xs font-mono mt-1">{formula}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold" style={{ color }}>{score}</p>
          <p className="text-sm font-medium mt-1" style={{ color }}>{label}</p>
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="space-y-3">
          {Object.entries(breakdown).map(([key, data]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-40">
                <p className="text-sm text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.contribution || 0)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
              <div className="w-20 text-right">
                <span className="text-sm text-white font-mono">
                  {data.contribution?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  (w={data.weight})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
