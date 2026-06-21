import { TerminalSquare } from 'lucide-react'

interface TerminalProps {
  incidentId: string
  logs: string[]
}

function colorize(line: string): { text: string; color: string } {
  if (line.includes('[ERROR]')) return { text: line, color: 'text-sre-critical' }
  if (line.includes('[WARN]')) return { text: line, color: 'text-sre-warn' }
  if (line.includes('[INFO]')) return { text: line, color: 'text-zinc-400' }
  return { text: line, color: 'text-zinc-500' }
}

export function Terminal({ incidentId, logs }: TerminalProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 my-2 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 bg-zinc-900">
        <TerminalSquare size={14} className="text-zinc-500" />
        <span className="text-xs font-mono text-zinc-500">
          system-logs — {incidentId}
        </span>
        <span className="ml-auto text-xs font-mono text-zinc-700">
          {logs.length} lines
        </span>
      </div>
      {logs.length === 0 ? (
        <div className="p-6 text-center flex flex-col items-center justify-center gap-2 bg-zinc-950">
          <TerminalSquare size={20} className="text-zinc-700 animate-pulse" />
          <p className="text-xs font-mono text-zinc-500">No logs found for this incident or service.</p>
        </div>
      ) : (
        <div className="p-3 max-h-52 overflow-y-auto space-y-0.5">
          {logs.map((line, i) => {
            const { text, color } = colorize(line)
            return (
              <div key={i} className="flex gap-2 items-baseline">
                <span className="text-zinc-700 font-mono text-xs shrink-0 w-6 text-right select-none">
                  {i + 1}
                </span>
                <span className={`font-mono text-xs leading-relaxed ${color}`}>
                  {text}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
