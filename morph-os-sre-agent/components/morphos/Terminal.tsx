'use client'

import { useEffect, useRef } from 'react'

interface TerminalProps {
  logs: string[]
}

export default function Terminal({ logs }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [logs])

  return (
    <div className="overflow-hidden rounded-lg border border-sre-accent/20 bg-[#09090b] shadow-[0_0_30px_-12px] shadow-sre-accent/40">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950/80 px-3 py-2">
        <span className="h-3 w-3 rounded-full bg-sre-critical/80" />
        <span className="h-3 w-3 rounded-full bg-sre-warn/80" />
        <span className="h-3 w-3 rounded-full bg-sre-success/80" />
        <span className="ml-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
          morphos://telemetry-stream
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sre-success shadow-[0_0_8px] shadow-sre-success" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-sre-success/80">
            live
          </span>
        </span>
      </div>

      {/* Log body */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        className="h-72 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed text-sre-success/90"
      >
        {logs.map((line, i) => (
          <div key={i} className="flex gap-2 whitespace-pre-wrap break-all">
            <span className="shrink-0 select-none text-sre-accent/60">
              {String(i + 1).padStart(3, '0')}
            </span>
            <span className="text-zinc-600 select-none">$</span>
            <span className="flex-1 text-zinc-300">{line}</span>
          </div>
        ))}
        <div className="flex gap-2">
          <span className="shrink-0 select-none text-transparent">
            {String(logs.length + 1).padStart(3, '0')}
          </span>
          <span className="text-zinc-600 select-none">$</span>
          <span className="animate-pulse font-bold text-sre-success shadow-sre-success">
            _
          </span>
        </div>
      </div>
    </div>
  )
}
