type Point = { label: string; value: number };

export function DashChart({
  points,
  label,
  accent = 'var(--mint)',
  height = 180
}: {
  points: Point[];
  label: string;
  accent?: string;
  height?: number;
}) {
  const maxValue = Math.max(1, ...points.map(point => point.value));
  const ceiling = Math.max(2, Math.ceil(maxValue / 2) * 2);
  const plot = { left: 30, top: 18, width: 558, height: 142 };
  const step = plot.width / Math.max(points.length, 1);
  const barWidth = Math.max(3, Math.min(22, step * .54));
  const marks = points.length > 14 ? 6 : Math.min(points.length, 7);
  const labelIndexes = Array.from({ length: marks }, (_, index) => Math.round(index * (points.length - 1) / Math.max(marks - 1, 1)));

  return (
    <div className="dash-chart" style={{ height }}>
      <svg viewBox="0 0 600 194" preserveAspectRatio="none" role="img" aria-label={`${label}. ${points.reduce((total, point) => total + point.value, 0)} total in the selected period.`}>
        <title>{label}</title>
        <desc>{points.length} days. Highest daily count: {maxValue}. Empty bars mean no recorded checks.</desc>
        {[0, 1, 2].map(index => {
          const value = ceiling - (ceiling / 2) * index;
          const y = plot.top + (plot.height / 2) * index;
          return <g key={index}><line x1={plot.left} x2={plot.left + plot.width} y1={y} y2={y} className="dash-chart-grid" /><text x={plot.left - 9} y={y + 3} textAnchor="end" className="dash-chart-axis">{value}</text></g>;
        })}
        {points.map((point, index) => {
          const barHeight = point.value ? Math.max(4, point.value / ceiling * plot.height) : 0;
          const x = plot.left + index * step + (step - barWidth) / 2;
          return <rect key={`${point.label}-${index}`} x={x} y={plot.top + plot.height - barHeight} width={barWidth} height={barHeight} rx="2" fill={accent}><title>{point.label}: {point.value}</title></rect>;
        })}
        {labelIndexes.map(index => <text key={index} x={plot.left + index * step + step / 2} y="184" textAnchor="middle" className="dash-chart-axis dash-chart-date">{points[index]?.label}</text>)}
      </svg>
    </div>
  );
}
