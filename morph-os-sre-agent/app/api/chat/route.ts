import {
  convertToModelMessages,
  InferUITools,
  stepCountIs,
  streamText,
  tool,
  UIDataTypes,
  UIMessage,
  validateUIMessages,
} from 'ai'
import { z } from 'zod'
import {
  awsClient,
  ddbDocClient,
  ollamaProvider,
  logToAWSAudit,
  ensureAuditTableExists
} from '../../../lib/infra/sreConfig'

export { awsClient, ddbDocClient }

export const maxDuration = 60

function sanitizeInput(val: string, pattern: RegExp, name: string): string {
  if (!pattern.test(val)) {
    throw new Error(`Invalid format for ${name}: Only alphanumeric characters and hyphens are allowed.`)
  }
  return val.replace(/[<>]/g, "").trim()
}

const evaluateIncidentTool = tool({
  description: 'Evaluate a detected incident and determine remediation strategy.',
  inputSchema: z.object({
    incidentId: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    affectedServices: z.array(z.string()),
    summary: z.string(),
  }),
  async execute({ incidentId, severity, affectedServices, summary }) {
    try {
      // Input sanitization
      const cleanIncidentId = sanitizeInput(incidentId, /^[A-Za-z0-9-]+$/, 'incidentId')
      const cleanServices = affectedServices.map(s => sanitizeInput(s, /^[A-Za-z0-9-]+$/, 'affectedService'))
      const cleanSummary = summary.replace(/[<>]/g, "").trim()

      await new Promise((resolve) => setTimeout(resolve, 800))
      const isAuto = severity === 'low' || severity === 'medium'
      const isCritical = severity === 'critical'

      let output: any
      let zone: string
      let auditAction: string

      if (isCritical) {
        output = {
          incidentId: cleanIncidentId,
          severity,
          affectedServices: cleanServices,
          summary: cleanSummary,
          recommendedAction: 'Immediate L3 escalation and platform lock',
          autoRemediated: false,
          escalationLevel: 'L3',
          escalatedTo: 'On-call SRE Lead + Platform Engineering',
          riskLevel: 'critical' as const,
          timestamp: new Date().toISOString(),
        }
        zone = 'RED'
        auditAction = 'CRITICAL_ESCALATION'
      } else {
        output = {
          incidentId: cleanIncidentId,
          severity,
          affectedServices: cleanServices,
          summary: cleanSummary,
          recommendedAction: isAuto ? 'Restart affected pods and clear cache' : 'Scale up compute tier and re-route traffic',
          autoRemediated: isAuto,
          actionTaken: isAuto ? 'Automatically restarted 2 pods and flushed Redis cache' : undefined,
          riskLevel: 'high' as const,
          timestamp: new Date().toISOString(),
        }
        zone = isAuto ? 'GREEN' : 'ORANGE'
        auditAction = output.recommendedAction
      }

      await logToAWSAudit({
        incidentId: cleanIncidentId,
        zone,
        summary: cleanSummary,
        action: auditAction
      })

      return output
    } catch (err: any) {
      console.error('[evaluateIncident] Tool crash intercepted:', err)
      // Error boundary and clear terminology translation
      let friendlyMessage = "System Error: An unexpected error occurred while evaluating the incident."
      if (err.message && err.message.includes('timeout')) {
        friendlyMessage = "AWS Timeout: The database did not respond within the 5-second limit. Operating in degraded fallback mode."
      } else if (err.code === 'ResourceNotFoundException') {
        friendlyMessage = "AWS DynamoDB error: The database table 'morphos-sre-audit-logs' was not found."
      } else if (err.code === 'AccessDeniedException') {
        friendlyMessage = "AWS IAM error: Insufficient permissions to write to the audit log."
      } else if (err.message && err.message.includes('connect')) {
        friendlyMessage = "AWS Connection error: Unable to connect to the AWS DynamoDB local database. Please check if the local service is running."
      } else if (err.message && err.message.includes('Invalid format')) {
        friendlyMessage = `Input Validation Error: ${err.message}`
      }
      return {
        error: true,
        message: friendlyMessage,
        incidentId,
        timestamp: new Date().toISOString(),
      }
    }
  },
})

const fetchSystemLogsTool = tool({
  description: 'Fetch recent system logs for a given incident or service.',
  inputSchema: z.object({
    incidentId: z.string(),
    service: z.string(),
    lines: z.number().optional(),
  }),
  async execute({ incidentId, service, lines = 10 }) {
    try {
      // Input sanitization
      const cleanIncidentId = sanitizeInput(incidentId, /^[A-Za-z0-9-]+$/, 'incidentId')
      const cleanService = sanitizeInput(service, /^[A-Za-z0-9-]+$/, 'service')

      if (cleanService === 'empty') {
        return {
          incidentId: cleanIncidentId,
          logs: [],
        }
      }

      return {
        incidentId: cleanIncidentId,
        logs: [
          `[INFO] ${cleanService}: Health check passed — latency 12ms`,
          `[WARN] ${cleanService}: High load detected`,
          `[ERROR] ${cleanService}: Connection pool exhausted`,
        ].slice(0, lines),
      }
    } catch (err: any) {
      console.error('[fetchSystemLogs] Tool crash intercepted:', err)
      let friendlyMessage = err.message || "An unexpected error occurred while fetching system logs."
      if (err.message && err.message.includes('Invalid format')) {
        friendlyMessage = `Input Validation Error: ${err.message}`
      }
      return {
        error: true,
        message: friendlyMessage,
        incidentId,
        logs: []
      }
    }
  },
})

export const sreTools = {
  evaluateIncident: evaluateIncidentTool,
  fetchSystemLogs: fetchSystemLogsTool,
} as const

export type SREChatMessage = UIMessage<never, UIDataTypes, InferUITools<typeof sreTools>>

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = await validateUIMessages<SREChatMessage>({
      messages: body.messages,
      tools: sreTools,
    })

    try {
      await ensureAuditTableExists()
    } catch (e) {
      console.error('Failed to check/create audit table:', e)
    }

    // Cancellation & Approval Logging to DynamoDB
    for (const msg of messages) {
      if (msg.role === 'assistant') {
        for (const part of msg.parts) {
          if (part.type === 'tool-evaluateIncident' && part.state === 'output-available') {
            const out = part.output as any
            if (out && out.recommendedAction === 'Denied') {
              try {
                await logToAWSAudit({
                  incidentId: out.incidentId || part.toolCallId,
                  zone: 'ORANGE',
                  summary: 'Operator denied remediation action.',
                  action: 'OPERATOR_DENIED'
                })
              } catch (e) {
                console.error('Failed to log operator denial to DynamoDB:', e)
              }
            } else if (out && out.recommendedAction === 'Approved') {
              try {
                await logToAWSAudit({
                  incidentId: out.incidentId || part.toolCallId,
                  zone: 'ORANGE',
                  summary: 'Operator approved remediation action.',
                  action: 'OPERATOR_APPROVED'
                })
              } catch (e) {
                console.error('Failed to log operator approval to DynamoDB:', e)
              }
            }
          }
        }
      }
    }

    const result = streamText({
      model: ollamaProvider.chat(process.env.LLM_MODEL_ID || 'qwen3.5:latest'),
      system: 'You are MorphOS SRE, an autonomous Site Reliability Engineering agent. Always call evaluateIncident first.',
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(6),
      tools: sreTools,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Error processing SRE agent chat request:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}