import React, { useState } from 'react';

interface BarChartProps {
  data: Record<string, number>;
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const [tooltip, setTooltip] = useState<{ label: string; value: number; x: number; y: number } | null>(null);
  
  // FIX: Cast Object.entries result to [string, number][] to ensure correct type inference for values.
  // This resolves arithmetic errors in the sort function and ensures 'value' is typed as a number in the later map function.
  const entries = (Object.entries(data) as [string, number][]).sort(([, aValue], [, bValue]) => bValue - aValue);

  // FIX: Cast Object.values to number[] to handle cases where it's inferred as unknown[],
  // resolving issues with Math.max receiving arguments of the wrong type.
  const maxValue = Math.max(...(Object.values(data) as number[]), 0);

  const chartHeight = 250;
  const barWidth = 30;
  const barMargin = 15;
  const chartWidth = entries.length * (barWidth + barMargin);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-[#1C1C2E] p-6 rounded-lg border border-gray-700 relative">
      <h3 className="font-semibold mb-4 text-white">{title}</h3>
      {entries.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-500">No data available</div>
      ) : (
        <div className="overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="font-sans text-xs">
            {entries.map(([label, value], index) => {
              // 'value' is now correctly inferred as a number from the typed 'entries' array.
              const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 40) : 0;
              const x = index * (barWidth + barMargin);
              const y = chartHeight - barHeight - 20;

              return (
                <g key={label} transform={`translate(${x}, 0)`}>
                  <rect
                    x={0}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    className="fill-purple-500 hover:fill-purple-400 transition-colors"
                    onMouseMove={(e) => setTooltip({ label, value, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <text
                    x={barWidth / 2}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    className="fill-gray-400"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
      {tooltip && (
        <div
          className="fixed bg-gray-800 text-white text-sm rounded py-1 px-2 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 z-50"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <strong>{tooltip.label}:</strong> {formatCurrency(tooltip.value)}
        </div>
      )}
    </div>
  );
};

export default BarChart;
