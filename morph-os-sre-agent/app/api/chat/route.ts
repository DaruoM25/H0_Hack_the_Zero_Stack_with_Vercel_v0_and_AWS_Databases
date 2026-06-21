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
import { createOpenAI } from '@ai-sdk/openai'
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

export const maxDuration = 60

// Initialisation du client AWS DynamoDB local ou cloud
export const awsClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'localdev',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'localdev',
  },
})
export const ddbDocClient = DynamoDBDocumentClient.from(awsClient)

let isTableChecked = false

async function ensureAuditTableExists() {
  if (isTableChecked) return
  const tableName = process.env.AUDIT_TABLE_NAME || 'morphos-sre-audit-logs'
  try {
    await awsClient.send(new DescribeTableCommand({ TableName: tableName }))
    isTableChecked = true
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException' || err.code === 'ResourceNotFoundException') {
      console.log(`Table ${tableName} not found. Creating it...`)
      try {
        await awsClient.send(new CreateTableCommand({
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'incident_id', KeyType: 'HASH' },
            { AttributeName: 'timestamp', KeyType: 'RANGE' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'incident_id', AttributeType: 'S' },
            { AttributeName: 'timestamp', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }))
        console.log(`Table ${tableName} created successfully.`)
        isTableChecked = true
      } catch (createErr) {
        console.error(`Error creating DynamoDB table ${tableName}:`, createErr)
      }
    } else {
      console.error(`Error checking DynamoDB table ${tableName}:`, err)
    }
  }
}

// Configuration du provider local Ollama
const ollamaProvider = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434/v1',
  apiKey: 'ollama',
})

function sanitizeInput(val: string, pattern: RegExp, name: string): string {
  if (!pattern.test(val)) {
    throw new Error(`Invalid format for ${name}: Only alphanumeric characters and hyphens are allowed.`)
  }
  return val.replace(/[<>]/g, "").trim()
}

async function logToAWSAudit(payload: { incidentId: string; zone: string; summary: string; action: string }) {
  // Timeout handling: limit DynamoDB operations to 5 seconds
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('DynamoDB request timeout (5s)')), 5000)
  )

  try {
    await ensureAuditTableExists()
    await Promise.race([
      ddbDocClient.send(
        new PutCommand({
          TableName: process.env.AUDIT_TABLE_NAME || 'morphos-sre-audit-logs',
          Item: {
            incident_id: payload.incidentId,
            timestamp: new Date().toISOString(),
            authority_zone: payload.zone,
            action_executed: payload.action,
            resolution_details: payload.summary,
          },
        })
      ),
      timeoutPromise
    ])
  } catch (err: any) {
    console.error('[AWS DDB] Erreur écriture audit:', err)
    throw err
  }
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

      const output = {
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

      await logToAWSAudit({
        incidentId: cleanIncidentId,
        zone: isAuto ? 'GREEN' : 'ORANGE',
        summary: cleanSummary,
        action: output.recommendedAction
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
                  action: 'CANCEL_BY_OPERATOR_DENIED'
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
                  action: 'APPROVE_BY_OPERATOR_INITIATED'
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
      model: ollamaProvider(process.env.LLM_MODEL_ID || 'qwen3.5:latest'),
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