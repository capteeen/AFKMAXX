type Point = { label: string; value: number };

export function DashChart({
  points,
  accent = 'var(--mint)',
  height = 180
}: {
  points: Point[];
  accent?: string;
  height?: number;
}) {
  const max = Math.max(...points.map(p => p.value), 1);
  const showEvery = points.length > 14 ? 3 : 1;
  return (
    <div className="dash-chart" style={{ height }}>
      <div className="dash-chart-bars" role="img" aria-label="Earnings by day">
        {points.map((point, i) => (
          <div className="dash-bar-col" key={`${point.label}-${i}`}>
            <span
              className="dash-bar"
              style={{ height: `${Math.max((point.value / max) * 100, point.value ? 6 : 0)}%`, background: accent }}
              title={`${point.label}: ${point.value}`}
            />
            {i % showEvery === 0 ? <span className="dash-bar-label">{point.label}</span> : <span className="dash-bar-label dash-bar-label-gap" />}
          </div>
        ))}
      </div>
    </div>
  );
}
