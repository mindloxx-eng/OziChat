import React, { useMemo } from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  formatValue?: (n: number) => string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 220,
  color = '#3F9BFF',
  gradientFrom = 'rgba(63,155,255,0.45)',
  gradientTo = 'rgba(63,155,255,0)',
  formatValue = n => `${n}`,
}) => {
  const id = useMemo(() => `grad-${Math.random().toString(36).slice(2, 8)}`, []);

  if (!data.length) {
    return <div className="text-white/40 text-sm">No data</div>;
  }

  const W = 800;
  const H = height;
  const padX = 28;
  const padY = 24;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = Math.max(max - min, 1);

  const xStep = (W - padX * 2) / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = padX + i * xStep;
    const y = padY + (1 - (d.value - min) / range) * (H - padY * 2);
    return { x, y, ...d };
  });

  const path = points.reduce((acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`), '');
  const area = `${path} L${points[points.length - 1].x},${H - padY} L${points[0].x},${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = padY + t * (H - padY * 2);
        return (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 5"
          />
        );
      })}

      <path d={area} fill={`url(#${id})`} />
      <path d={path} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
          <circle cx={p.x} cy={p.y} r={8} fill={color} opacity={0.15} />
        </g>
      ))}

      {points.map((p, i) => {
        if (data.length > 12 && i % Math.ceil(data.length / 8) !== 0) return null;
        return (
          <text
            key={`l-${i}`}
            x={p.x}
            y={H - 6}
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            textAnchor="middle"
            fontFamily="Poppins, sans-serif"
          >
            {p.label}
          </text>
        );
      })}

      <text x={padX} y={padY - 8} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Poppins, sans-serif">
        {formatValue(max)}
      </text>
    </svg>
  );
};

export default LineChart;
