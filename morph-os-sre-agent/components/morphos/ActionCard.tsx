'use client'

import { AlertTriangle, CheckCheck, X } from 'lucide-react'

interface ActionCardProps {
  incidentId: string
  severity: string
  affectedServices: string[]
  summary: string
  recommendedAction: string
  riskLevel: string
  timestamp: string
  toolCallId: string
  onApprove: (toolCallId: string) => void
  onDeny: (toolCallId: string) => void
  resolved?: boolean
  resolution?: string
}

export function ActionCard({
  incidentId,
  severity,
  affectedServices,
  summary,
  recommendedAction,
  riskLevel,
  timestamp,
  toolCallId,
  onApprove,
  onDeny,
  resolved,
  resolution,
}: ActionCardProps) {
  const formatted = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const riskColors: Record<string, string> = {
    low: 'text-sre-success',
    medium: 'text-sre-warn',
    high: 'text-sre-critical',
  }

  return (
    <div className="rounded-lg border border-sre-warn/40 bg-sre-warn/5 p-4 my-2">
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 shrink-0 text-sre-warn"
          size={18}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-sre-warn font-semibold tracking-wide uppercase">
              Awaiting Approval
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
          <div className="mt-2 rounded bg-zinc-900 border border-sre-warn/20 px-3 py-2">
            <span className="text-xs font-mono text-sre-warn/70 uppercase tracking-wider">
              Recommended Action
            </span>
            <p className="text-xs font-mono text-zinc-300 mt-0.5">{recommendedAction}</p>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-600 font-mono">severity:</span>
              <span className="text-xs font-mono text-sre-warn capitalize">{severity}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-600 font-mono">risk:</span>
              <span className={`text-xs font-mono capitalize ${riskColors[riskLevel] ?? 'text-zinc-400'}`}>
                {riskLevel}
              </span>
            </div>
          </div>

          {resolved ? (
            <div className={`mt-3 flex items-center gap-2 rounded border px-3 py-2 bg-zinc-900 ${
              resolution?.includes('Denied')
                ? 'border-zinc-800 text-zinc-500'
                : 'border-sre-success/30 text-sre-success/80'
            }`}>
              <span className="text-xs font-mono">
                {resolution?.includes('Denied')
                  ? '🛑 Remediation cancelled by operator. Aborted action logged permanently to audit registry.'
                  : `✅ ${resolution}`}
              </span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onApprove(toolCallId)}
                className="flex items-center gap-1.5 rounded border border-sre-success/40 bg-sre-success/10 px-3 py-1.5 text-xs font-mono font-semibold text-sre-success transition-colors hover:bg-sre-success/20 cursor-pointer"
              >
                <CheckCheck size={13} />
                Approve
              </button>
              <button
                onClick={() => onDeny(toolCallId)}
                className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-mono font-semibold text-zinc-400 transition-colors hover:bg-zinc-700 cursor-pointer"
              >
                <X size={13} />
                Deny
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
