import { Siren } from 'lucide-react'

interface CrisisSummaryProps {
  incidentId: string
  severity: string
  affectedServices: string[]
  summary: string
  recommendedAction: string
  escalationLevel: string
  escalatedTo: string
  timestamp: string
}

export function CrisisSummary({
  incidentId,
  severity,
  affectedServices,
  summary,
  recommendedAction,
  escalationLevel,
  escalatedTo,
  timestamp,
}: CrisisSummaryProps) {
  const formatted = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <div className="rounded-lg border border-sre-critical/50 bg-sre-critical/5 p-4 my-2">
      <div className="flex items-start gap-3">
        <Siren
          className="mt-0.5 shrink-0 text-sre-critical"
          size={18}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-sre-critical font-semibold tracking-wide uppercase">
              Critical — Escalated
            </span>
            <span className="text-xs font-mono text-zinc-500">{incidentId}</span>
            <span className="ml-auto text-xs font-mono text-zinc-600">{formatted}</span>
          </div>
          <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{summary}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {affectedServices.map((svc) => (
              <span
                key={svc}
                className="rounded px-1.5 py-0.5 text-xs font-mono bg-zinc-900 text-sre-critical/80 border border-sre-critical/25"
              >
                {svc}
              </span>
            ))}
          </div>
          <div className="mt-2 rounded bg-zinc-900 border border-sre-critical/25 px-3 py-2">
            <span className="text-xs font-mono text-sre-critical/70 uppercase tracking-wider">
              Required Action
            </span>
            <p className="text-xs font-mono text-zinc-300 mt-0.5">{recommendedAction}</p>
          </div>
          <div className="mt-2 rounded bg-zinc-900 border border-zinc-800 px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-600">escalation:</span>
              <span className="text-xs font-mono text-sre-critical font-semibold">{escalationLevel}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs font-mono text-zinc-600 shrink-0">escalated to:</span>
              <span className="text-xs font-mono text-zinc-300">{escalatedTo}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-600">severity:</span>
              <span className="text-xs font-mono text-sre-critical capitalize">{severity}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
