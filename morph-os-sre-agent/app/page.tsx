'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, Send, Loader2, Zap, AlertCircle, CircleDot } from 'lucide-react'
import { GreenBadge } from '@/components/morphos/GreenBadge'
import { ActionCard } from '@/components/morphos/ActionCard'
import { CrisisSummary } from '@/components/morphos/CrisisSummary'
import { Terminal } from '@/components/morphos/Terminal'
import { ClarificationCard } from '@/components/morphos/ClarificationCard'
import type { SREChatMessage } from '@/app/api/chat/route'

type ActionResolution = {
  toolCallId: string
  resolution: string
}

const EXAMPLE_PROMPTS = [
  'payments-svc is timing out — error rate at 12%',
  'API gateway is down across us-east-1',
  'Memory leak detected in auth-worker pods',
  'Fetch recent logs for checkout-service',
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'ready') {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-sre-success/30 bg-sre-success/10 px-2.5 py-1 text-xs font-mono text-sre-success">
        <CircleDot size={10} className="fill-sre-success" />
        Ready
      </span>
    )
  }
  if (status === 'submitted' || status === 'streaming') {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-sre-accent/30 bg-sre-accent/10 px-2.5 py-1 text-xs font-mono text-sre-accent">
        <Loader2 size={10} className="animate-spin" />
        {status === 'submitted' ? 'Processing...' : 'Streaming...'}
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-sre-critical/30 bg-sre-critical/10 px-2.5 py-1 text-xs font-mono text-sre-critical">
        <AlertCircle size={10} />
        Error
      </span>
    )
  }
  return null
}

export default function MorphOSPage() {
  const [input, setInput] = useState('')
  const [resolutions, setResolutions] = useState<ActionResolution[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, addToolOutput, status } =
    useChat<SREChatMessage>({
      transport: new DefaultChatTransport({ api: '/api/chat' }),
    })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || status !== 'ready') return
    // Sanitize input: strip < and > to prevent injection
    const sanitized = trimmed.replace(/[<>]/g, "")
    sendMessage({ text: sanitized })
    setInput('')
  }, [input, status, sendMessage])

  const handleApprove = useCallback(
    (toolCallId: string) => {
      addToolOutput({
        toolCallId,
        output: {
          incidentId: toolCallId,
          severity: 'high' as const,
          affectedServices: [],
          summary: 'Operator approved remediation action.',
          recommendedAction: 'Approved',
          autoRemediated: true,
          actionTaken: 'Operator approved — remediation initiated.',
          timestamp: new Date().toISOString(),
        },
      })
      setResolutions((prev) => [
        ...prev,
        { toolCallId, resolution: 'Approved — remediation initiated.' },
      ])
    },
    [addToolOutput]
  )

  const handleDeny = useCallback(
    (toolCallId: string) => {
      addToolOutput({
        toolCallId,
        output: {
          incidentId: toolCallId,
          severity: 'high' as const,
          affectedServices: [],
          summary: 'Operator denied remediation action.',
          recommendedAction: 'Denied',
          autoRemediated: false,
          timestamp: new Date().toISOString(),
        },
      })
      setResolutions((prev) => [
        ...prev,
        { toolCallId, resolution: 'Denied — no action taken.' },
      ])
    },
    [addToolOutput]
  )

  const hasPendingAction = messages.some(
    (msg) =>
      msg.role === 'assistant' &&
      msg.parts.some((part) => {
        if (
          part.type === 'tool-evaluateIncident' &&
          part.state === 'output-available'
        ) {
          const out = part.output as Record<string, unknown>
          return (
            out &&
            !out.autoRemediated &&
            !out.escalationLevel &&
            !resolutions.some((r) => r.toolCallId === part.toolCallId)
          )
        }
        if (
          part.type === 'tool-requestClarification' &&
          part.state === 'output-available'
        ) {
          return !resolutions.some((r) => r.toolCallId === part.toolCallId)
        }
        return false
      })
  )

  const canSend = status === 'ready' && !hasPendingAction

  return (
    <div className="flex flex-col h-svh bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sre-accent/10 border border-sre-accent/25">
            <Zap size={16} className="text-sre-accent" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
              MorphOS SRE
            </h1>
            <p className="text-xs text-zinc-600 font-mono">
              Autonomous Incident Remediation
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center max-w-md mx-auto">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-sre-accent/10 border border-sre-accent/20">
              <Bot size={28} className="text-sre-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-200 text-balance">
                MorphOS SRE Agent online
              </h2>
              <p className="text-sm text-zinc-500 mt-1 leading-relaxed text-pretty">
                Report an incident or ask about system health. I will evaluate,
                remediate, or escalate autonomously.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInput(prompt)
                    inputRef.current?.focus()
                  }}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left text-xs font-mono text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-zinc-800 border border-zinc-700 px-4 py-2.5">
                      {message.parts.map((part, i) =>
                        part.type === 'text' ? (
                          <p
                            key={i}
                            className="text-sm text-zinc-200 leading-relaxed"
                          >
                            {part.text}
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2.5">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-sre-accent/10 border border-sre-accent/25 shrink-0 mt-0.5">
                      <Bot size={13} className="text-sre-accent" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {message.parts.map((part, i) => {
                        if (part.type === 'text' && part.text) {
                          return (
                            <p
                              key={i}
                              className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap"
                            >
                              {part.text}
                            </p>
                          )
                        }

                        // evaluateIncident tool
                        if (part.type === 'tool-evaluateIncident') {
                          if (
                            part.state === 'input-available' ||
                            part.state === 'input-streaming'
                          ) {
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 py-1"
                              >
                                <Loader2
                                  size={12}
                                  className="animate-spin text-sre-accent"
                                />
                                <span className="text-xs font-mono text-zinc-600">
                                  Evaluating incident...
                                </span>
                              </div>
                            )
                          }

                          if (part.state === 'output-available') {
                            const out = part.output as Record<string, unknown>
                            if (!out) return null

                            if (out.error) {
                              return (
                                <div key={i} className="rounded-lg border border-sre-critical/30 bg-sre-critical/5 p-4 my-2 flex items-start gap-3">
                                  <AlertCircle className="mt-0.5 shrink-0 text-sre-critical" size={18} />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-mono text-sre-critical font-semibold tracking-wide uppercase">
                                      System Error
                                    </span>
                                    <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                                      {out.message as string}
                                    </p>
                                  </div>
                                </div>
                              )
                            }

                            if (out.autoRemediated) {
                              return (
                                <GreenBadge
                                  key={i}
                                  incidentId={out.incidentId as string}
                                  severity={out.severity as string}
                                  affectedServices={
                                    out.affectedServices as string[]
                                  }
                                  summary={out.summary as string}
                                  actionTaken={out.actionTaken as string}
                                  timestamp={out.timestamp as string}
                                />
                              )
                            }

                            if (out.escalationLevel) {
                              return (
                                <CrisisSummary
                                  key={i}
                                  incidentId={out.incidentId as string}
                                  severity={out.severity as string}
                                  affectedServices={
                                    out.affectedServices as string[]
                                  }
                                  summary={out.summary as string}
                                  recommendedAction={
                                    out.recommendedAction as string
                                  }
                                  escalationLevel={
                                    out.escalationLevel as string
                                  }
                                  escalatedTo={out.escalatedTo as string}
                                  timestamp={out.timestamp as string}
                                />
                              )
                            }

                            const resolution = resolutions.find(
                              (r) => r.toolCallId === part.toolCallId
                            )
                            return (
                              <ActionCard
                                key={i}
                                incidentId={out.incidentId as string}
                                severity={out.severity as string}
                                affectedServices={
                                  out.affectedServices as string[]
                                }
                                summary={out.summary as string}
                                recommendedAction={
                                  out.recommendedAction as string
                                }
                                riskLevel={(out.riskLevel as string) ?? 'high'}
                                timestamp={out.timestamp as string}
                                toolCallId={part.toolCallId}
                                onApprove={handleApprove}
                                onDeny={handleDeny}
                                resolved={!!resolution}
                                resolution={resolution?.resolution}
                              />
                            )
                          }
                        }

                        // requestClarification tool
                        if (part.type === 'tool-requestClarification') {
                          if (
                            part.state === 'input-available' ||
                            part.state === 'input-streaming'
                          ) {
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 py-1"
                              >
                                <Loader2
                                  size={12}
                                  className="animate-spin text-amber-500"
                                />
                                <span className="text-xs font-mono text-zinc-600">
                                  Awaiting operator input...
                                </span>
                              </div>
                            )
                          }

                          if (part.state === 'output-available') {
                            const out = part.output as Record<string, unknown>
                            if (!out) return null

                            const resolution = resolutions.find(
                              (r) => r.toolCallId === part.toolCallId
                            )

                            return (
                              <ClarificationCard
                                key={i}
                                toolCallId={part.toolCallId}
                                message={(out.message as string) || "Clarification required"}
                                missingField={(out.missingField as string) || "incidentId"}
                                onResolve={(toolCallId, value) => {
                                  addToolOutput({
                                    toolCallId,
                                    output: {
                                      incidentId: value,
                                      resolved: true,
                                      value,
                                    },
                                  })
                                  setResolutions((prev) => [
                                    ...prev,
                                    { toolCallId, resolution: `Provided ${out.missingField}: ${value}` },
                                  ])
                                }}
                                resolved={!!resolution}
                                resolutionValue={resolution?.resolution}
                              />
                            )
                          }
                        }

                        // fetchSystemLogs tool
                        if (part.type === 'tool-fetchSystemLogs') {
                          if (
                            part.state === 'input-available' ||
                            part.state === 'input-streaming'
                          ) {
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-2 py-1"
                              >
                                <Loader2
                                  size={12}
                                  className="animate-spin text-zinc-600"
                                />
                                <span className="text-xs font-mono text-zinc-600">
                                  Fetching system logs...
                                </span>
                              </div>
                            )
                          }

                          if (part.state === 'output-available') {
                            const out = part.output as Record<string, unknown>
                            if (!out) return null

                            if (out.error) {
                              return (
                                <div key={i} className="rounded-lg border border-sre-critical/30 bg-sre-critical/5 p-4 my-2 flex items-start gap-3">
                                  <AlertCircle className="mt-0.5 shrink-0 text-sre-critical" size={18} />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-mono text-sre-critical font-semibold tracking-wide uppercase">
                                      Log Fetch Error
                                    </span>
                                    <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                                      {out.message as string}
                                    </p>
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <Terminal
                                key={i}
                                incidentId={out.incidentId as string}
                                logs={out.logs as string[]}
                              />
                            )
                          }
                        }

                        return null
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(status === 'submitted' || status === 'streaming') && (
              <div className="flex gap-2.5 items-center">
                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-sre-accent/10 border border-sre-accent/25 shrink-0">
                  <Bot size={13} className="text-sre-accent" />
                </div>
                <div className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-sre-accent/60 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-sre-accent/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-sre-accent/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input Footer */}
      <footer className="border-t border-zinc-800 px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto">
          {hasPendingAction && (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-mono text-sre-warn">
              <AlertCircle size={11} />
              Approve or deny the pending action before sending a new message.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                hasPendingAction
                  ? 'Waiting for action approval...'
                  : 'Describe an incident or ask about system health...'
              }
              disabled={!canSend}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-200 font-mono placeholder:text-zinc-700 focus:outline-none focus:border-sre-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button
              type="submit"
              disabled={!canSend || !input.trim()}
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition-colors hover:border-sre-accent/40 hover:text-sre-accent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  )
}
