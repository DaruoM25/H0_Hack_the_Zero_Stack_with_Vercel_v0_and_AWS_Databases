interface Resource {
  id: string
  name: string
  type: string
  status: 'healthy' | 'degraded' | 'failed'
  uptime: string
}

interface ResourceTableProps {
  resources: Resource[]
}

const statusDot: Record<Resource['status'], string> = {
  healthy: 'bg-sre-success shadow-[0_0_8px] shadow-sre-success',
  degraded: 'bg-sre-warn shadow-[0_0_8px] shadow-sre-warn',
  failed: 'bg-sre-critical shadow-[0_0_8px] shadow-sre-critical',
}

const statusText: Record<Resource['status'], string> = {
  healthy: 'text-sre-success',
  degraded: 'text-sre-warn',
  failed: 'text-sre-critical',
}

export function ResourceTable({ resources }: ResourceTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#0c0c0e]/90">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Resource Name
            </th>
            <th className="px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Type
            </th>
            <th className="px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </th>
            <th className="px-4 py-2.5 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Uptime
            </th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr
              key={r.id}
              className="border-b border-zinc-800/60 transition-colors last:border-0 hover:bg-zinc-900/50"
            >
              <td className="px-4 py-3 font-mono text-sm text-zinc-200">{r.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500">{r.type}</td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot[r.status]}`} />
                  <span className={`font-mono text-xs font-medium capitalize ${statusText[r.status]}`}>
                    {r.status}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-zinc-400">
                {r.uptime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
