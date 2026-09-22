export function ReputationChart({ successRate }: { successRate: number }) {
  const points = Array.from({ length: 8 }, (_, i) => {
    const drift = Math.sin(i * 1.2) * 4;
    return Math.max(72, Math.min(99, successRate + drift - 4 + i * 0.6));
  });
  const max = 100;
  const w = 360;
  const h = 120;
  const path = points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (value / max) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full">
      <path d={path} fill="none" stroke="#8B7CFF" strokeWidth="2.5" />
      {points.map((value, i) => (
        <circle
          key={i}
          cx={(i / (points.length - 1)) * w}
          cy={h - (value / max) * h}
          r="3.5"
          fill="#4CC3FF"
        />
      ))}
    </svg>
  );
}
