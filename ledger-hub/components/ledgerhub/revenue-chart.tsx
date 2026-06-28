"use client"

import { type RevenuePoint, eurCompact } from "@/lib/ledgerhub-data"
import { useLang } from "@/lib/lang-context"

// Lightweight hand-built SVG line+area chart (no external dep needed).
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const { t } = useLang()

  const width = 640
  const height = 240
  const padX = 16
  const padY = 24

  const max = Math.max(...data.map((d) => d.revenue))
  const min = Math.min(...data.map((d) => d.revenue))
  const range = max - min || 1

  const stepX = (width - padX * 2) / (data.length - 1)
  const points = data.map((d, i) => {
    const x = padX + i * stepX
    const y = padY + (1 - (d.revenue - min) / range) * (height - padY * 2)
    return { x, y, ...d }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")

  const areaPath =
    `M ${points[0].x.toFixed(1)} ${(height - padY).toFixed(1)} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(height - padY).toFixed(1)} Z`

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        role="img"
        aria-label={t.chart.ariaLabel}
      >
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padY + t * (height - padY * 2)}
            y2={padY + t * (height - padY * 2)}
            stroke="rgb(30 41 59)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#revFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="rgb(96 165 250)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p) => (
          <g key={p.month}>
            <circle cx={p.x} cy={p.y} r="4" fill="rgb(15 23 42)" stroke="rgb(96 165 250)" strokeWidth="2.5" />
            <text x={p.x} y={height - 4} textAnchor="middle" className="fill-slate-500 text-[11px]">
              {p.month}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
        <span>{t.chart.min} {eurCompact.format(min)}</span>
        <span className="font-medium text-slate-300">{t.chart.max} {eurCompact.format(max)}</span>
      </div>
    </div>
  )
}
