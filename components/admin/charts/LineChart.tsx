import React, { useState } from 'react';

interface LineChartProps {
  data: { date: string; amount: number }[];
  title: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const [tooltip, setTooltip] = useState<{ date: string; amount: number; x: number; y: number } | null>(null);

  const width = 500;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(...data.map(d => d.amount), 0);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const getX = (index: number) => (index / (data.length > 1 ? data.length - 1 : 1)) * innerWidth;
  const getY = (value: number) => innerHeight - (value / (maxValue > 0 ? maxValue : 1)) * innerHeight;

  const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.amount)}`).join(' ');

  return (
    <div className="bg-[#1C1C2E] p-6 rounded-lg border border-gray-700 relative overflow-hidden">
      <h3 className="font-semibold mb-4 text-white">{title}</h3>
      {data.length < 2 ? (
         <div className="h-[250px] flex items-center justify-center text-gray-500">Not enough data for a line chart</div>
      ) : (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="font-sans text-xs">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Y Axis */}
          <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#4A5568" />
          {[0, 0.25, 0.5, 0.75, 1].map(tick => {
            const yPos = innerHeight - tick * innerHeight;
            if (yPos < 0) return null;
            return (
                <g key={tick} transform={`translate(0, ${yPos})`}>
                <line x1={-5} y1={0} x2={0} y2={0} stroke="#4A5568" />
                <text x={-10} y={4} textAnchor="end" className="fill-gray-400">
                    {formatCurrency(tick * maxValue)}
                </text>
                </g>
            )
          })}

          {/* X Axis */}
          <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#4A5568" />
          {data.map((d, i) => {
            if (data.length > 10 && i % Math.ceil(data.length / 5) !== 0) return null; // Show ~5 labels for lots of data
            return (
              <g key={d.date} transform={`translate(${getX(i)}, ${innerHeight})`}>
                <line y1={0} y2={5} stroke="#4A5568" />
                <text y={15} textAnchor="middle" className="fill-gray-400">
                  {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </text>
              </g>
            )
          })}
          
          {/* Line */}
          <path d={pathData} fill="none" stroke="#A855F7" strokeWidth="2" />

          {/* Points and Tooltip Area */}
          {data.map((d, i) => (
            <circle
              key={d.date}
              cx={getX(i)}
              cy={getY(d.amount)}
              r="4"
              className="fill-purple-500 stroke-2 stroke-[#1C1C2E] cursor-pointer"
              onMouseMove={(e) => setTooltip({ date: d.date, amount: d.amount, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </g>
      </svg>
      )}
       {tooltip && (
        <div
          className="fixed bg-gray-800 text-white text-sm rounded py-1 px-2 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 z-50"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <strong>{new Date(tooltip.date).toLocaleDateString()}:</strong> {formatCurrency(tooltip.amount)}
        </div>
      )}
    </div>
  );
};

export default LineChart;
