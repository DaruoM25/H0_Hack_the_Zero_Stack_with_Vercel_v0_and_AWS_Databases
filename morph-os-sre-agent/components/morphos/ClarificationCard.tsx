'use client'

import { useState } from 'react'
import { HelpCircle, CornerDownLeft, CheckCheck } from 'lucide-react'

interface ClarificationCardProps {
  field: string
  question: string
  toolCallId: string
  onSubmit: (toolCallId: string, field: string, value: string) => void
  resolved?: boolean
  submittedValue?: string
}

export function ClarificationCard({
  field,
  question,
  toolCallId,
  onSubmit,
  resolved,
  submittedValue,
}: ClarificationCardProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(toolCallId, field, trimmed)
  }

  return (
    <div className="rounded-lg border border-sre-accent/40 bg-sre-accent/5 p-4 my-2">
      <div className="flex items-start gap-3">
        <HelpCircle className="mt-0.5 shrink-0 text-sre-accent" size={18} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold uppercase tracking-wide text-sre-accent">
              Clarification requise
            </span>
            <span className="rounded px-1.5 py-0.5 text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
              {field}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-300 text-pretty">
            {question}
          </p>

          {resolved ? (
            <div className="mt-3 flex items-center gap-2 rounded border border-sre-success/30 bg-sre-success/10 px-3 py-2">
              <CheckCheck size={13} className="shrink-0 text-sre-success" />
              <span className="text-xs font-mono text-zinc-300">
                <span className="text-zinc-500">{field}:</span>{' '}
                <span className="text-sre-success">{submittedValue}</span>
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                placeholder="ex. INC-48213"
                className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-200 placeholder:text-zinc-700 transition-colors focus:border-sre-accent/50 focus:outline-none"
                aria-label={question}
              />
              <button
                type="submit"
                disabled={!value.trim()}
                className="flex items-center gap-1.5 rounded-md border border-sre-accent/40 bg-sre-accent/10 px-3 py-2 text-xs font-mono font-semibold text-sre-accent transition-colors hover:bg-sre-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <CornerDownLeft size={13} />
                Valider
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
