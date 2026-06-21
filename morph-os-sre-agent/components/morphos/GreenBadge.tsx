import { CheckCircle2 } from 'lucide-react'

interface GreenBadgeProps {
  incidentId: string
  severity: string
  affectedServices: string[]
  summary: string
  actionTaken: string
  timestamp: string
}

export function GreenBadge({
  incidentId,
  severity,
  affectedServices,
  summary,
  actionTaken,
  timestamp,
}: GreenBadgeProps) {
  const formatted = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div className="rounded-lg border border-sre-success/30 bg-sre-success/5 p-4 my-2">
      <div className="flex items-start gap-3">
        <CheckCircle2
          className="mt-0.5 shrink-0 text-sre-success"
          size={18}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-sre-success font-semibold tracking-wide uppercase">
              Auto-Remediated
            </span>
            <span className="text-xs font-mono text-zinc-500">{incidentId}</span>
            <span className="ml-auto text-xs font-mono text-zinc-600">{formatted}</span>
          </div>
          <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{summary}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {affectedServices.map((svc) => (
              <span
                key={svc}
                className="rounded px-1.5 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700"
              >
                {svc}
              </span>
            ))}
          </div>
          <div className="mt-2 rounded bg-zinc-900 border border-sre-success/20 px-3 py-2">
            <span className="text-xs font-mono text-sre-success/70 uppercase tracking-wider">
              Action Taken
            </span>
            <p className="text-xs font-mono text-zinc-300 mt-0.5">{actionTaken}</p>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-xs text-zinc-600 font-mono">severity:</span>
            <span className="text-xs font-mono text-sre-success capitalize">{severity}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
