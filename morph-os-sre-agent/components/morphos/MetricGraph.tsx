interface MetricGraphProps {
  title: string
  currentValue: number
  unit: string
  status: 'nominal' | 'warning' | 'critical'
  points: number[]
}

const statusConfig: Record<
  MetricGraphProps['status'],
  { label: string; text: string; bg: string; border: string; stroke: string; glow: string }
> = {
  nominal: {
    label: 'Nominal',
    text: 'text-sre-success',
    bg: 'bg-sre-success/10',
    border: 'border-sre-success/30',
    stroke: 'var(--sre-success)',
    glow: 'drop-shadow-[0_0_4px_var(--sre-success)]',
  },
  warning: {
    label: 'Warning',
    text: 'text-sre-warn',
    bg: 'bg-sre-warn/10',
    border: 'border-sre-warn/30',
    stroke: 'var(--sre-warn)',
    glow: 'drop-shadow-[0_0_4px_var(--sre-warn)]',
  },
  critical: {
    label: 'Critical',
    text: 'text-sre-critical',
    bg: 'bg-sre-critical/10',
    border: 'border-sre-critical/30',
    stroke: 'var(--sre-critical)',
    glow: 'drop-shadow-[0_0_4px_var(--sre-critical)]',
  },
}

export function MetricGraph({ title, currentValue, unit, status, points }: MetricGraphProps) {
  const cfg = statusConfig[status]

  // Build a normalized polyline over a 100x32 viewBox.
  const width = 100
  const height = 32
  const max = points.length ? Math.max(...points) : 1
  const min = points.length ? Math.min(...points) : 0
  const range = max - min || 1

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * width : 0
    const y = height - ((p - min) / range) * (height - 4) - 2
    return { x, y }
  })

  const linePoints = coords.map((c) => `${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ')
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`
  const last = coords[coords.length - 1]

  return (
    <div className="rounded-lg border border-zinc-800 bg-[#0c0c0e]/90 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">{title}</span>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${cfg.border} ${cfg.bg} ${cfg.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.text.replace('text-', 'bg-')}`} />
          {cfg.label}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`font-mono text-3xl font-bold tabular-nums ${cfg.text}`}>
          {currentValue}
        </span>
        <span className="font-mono text-sm text-zinc-500">{unit}</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="mt-3 h-12 w-full"
        role="img"
        aria-label={`${title} sparkline, status ${cfg.label}`}
      >
        {points.length > 1 && (
          <>
            <polyline points={areaPoints} fill={cfg.stroke} fillOpacity={0.08} stroke="none" />
            <polyline
              points={linePoints}
              fill="none"
              stroke={cfg.stroke}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className={cfg.glow}
            />
            {last && (
              <circle cx={last.x} cy={last.y} r={1.8} fill={cfg.stroke} className={cfg.glow} />
            )}
          </>
        )}
      </svg>
    </div>
  )
}
