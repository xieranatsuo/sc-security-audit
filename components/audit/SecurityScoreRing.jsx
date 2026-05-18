'use client';

export function SecurityScoreRing({ score, size = 160, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#16a34a', bg: 'rgba(22,163,74,0.1)', text: 'text-emerald-400', label: 'Safe' };
    if (s >= 50) return { stroke: '#ca8a04', bg: 'rgba(202,138,4,0.1)', text: 'text-yellow-400', label: 'Moderate Risk' };
    return { stroke: '#dc2626', bg: 'rgba(220,38,38,0.1)', text: 'text-red-400', label: 'High Risk' };
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#1a1a24" strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color.stroke} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color.text}`}>{score}</span>
          <span className="text-[10px] text-gray-500 mt-0.5">/ 100</span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${color.text}`} style={{ backgroundColor: color.bg }}>
        {color.label}
      </div>
    </div>
  );
}
