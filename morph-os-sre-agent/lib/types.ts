import type { InferUITools, UIDataTypes, UIMessage } from 'ai'
import type { sreTools } from '@/app/api/chat/route'

// Re-export the message type for use across the app
export type SREMessage = UIMessage<never, UIDataTypes, InferUITools<typeof sreTools>>

// Tool result types
export interface EvaluateIncidentResult {
  incidentId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  affectedServices: string[]
  summary: string
  recommendedAction: string
  autoRemediated: boolean
  timestamp: string
  actionTaken?: string
  riskLevel?: 'low' | 'medium' | 'high'
  escalationLevel?: string
  escalatedTo?: string
}

export interface FetchSystemLogsResult {
  incidentId: string
  logs: string[]
}
