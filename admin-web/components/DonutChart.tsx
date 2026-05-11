import React from 'react';

interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ segments, size = 180, thickness = 22, centerLabel, centerSub }) => {
  const total = Math.max(segments.reduce((s, x) => s + x.value, 0), 1);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} fill="none" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${len} ${c - len}`;
          const node = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return node;
        })}
        {centerLabel && (
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            fill="white"
            fontSize={size / 7}
            fontWeight={900}
            fontFamily="Poppins, sans-serif"
          >
            {centerLabel}
          </text>
        )}
        {centerSub && (
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            fontWeight={700}
            letterSpacing={2}
            fontFamily="Poppins, sans-serif"
          >
            {centerSub.toUpperCase()}
          </text>
        )}
      </svg>

      <ul className="space-y-2 text-sm min-w-0">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-white/80 font-semibold truncate">{s.label}</span>
            <span className="ml-auto text-white/40 text-xs font-bold">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DonutChart;
