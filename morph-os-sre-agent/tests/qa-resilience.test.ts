import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

// We import the real clients and tools from the Chat route
import { sreTools, awsClient, ddbDocClient, POST } from '../app/api/chat/route'

describe('SRE Agent - UX & Resilience QA Test Suite (Real Integration)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // 1. Input Sanitization Tests
  describe('Input Sanitization & Validation', () => {
    test('should allow valid alphanumeric service and incident IDs', async () => {
      const result = await sreTools.fetchSystemLogs.execute({
        incidentId: 'INC-1234',
        service: 'checkout-service',
      }, {} as any)
      expect(result.error).toBeUndefined()
      expect(result.incidentId).toBe('INC-1234')
      expect(result.logs?.length).toBeGreaterThan(0)
    })

    test('should reject invalid service names containing HTML or special characters', async () => {
      const result = await sreTools.fetchSystemLogs.execute({
        incidentId: 'INC-1234',
        service: 'checkout<script>alert(1)</script>',
      }, {} as any)
      expect(result.error).toBe(true)
      expect(result.message).toContain('Input Validation Error')
    })

    test('should reject invalid incident IDs containing special characters', async () => {
      const result = await sreTools.evaluateIncident.execute({
        incidentId: 'INC-1234; DROP TABLE Users;',
        severity: 'high',
        affectedServices: ['auth-service'],
        summary: 'Database CPU high',
      }, {} as any)
      expect(result.error).toBe(true)
      expect(result.message).toContain('Input Validation Error')
    })
  })

  // 2. Empty States
  describe('Empty States', () => {
    test('should return empty logs when service is "empty" to verify UI Empty State handling', async () => {
      const result = await sreTools.fetchSystemLogs.execute({
        incidentId: 'INC-0001',
        service: 'empty',
      }, {} as any)
      expect(result.error).toBeUndefined()
      expect(result.logs).toEqual([])
    })
  })

  // 3. AWS Error Boundaries & Translation of Clear Terminology
  describe('AWS Error Boundaries & Clear Terminology', () => {
    test('should translate ResourceNotFoundException into a friendly message', async () => {
      const sendSpy = vi.spyOn(ddbDocClient, 'send').mockImplementationOnce(() => {
        const error = new Error('Requested resource not found')
        ;(error as any).code = 'ResourceNotFoundException'
        return Promise.reject(error)
      })

      try {
        const result = await sreTools.evaluateIncident.execute({
          incidentId: 'INC-9999',
          severity: 'low',
          affectedServices: ['web-portal'],
          summary: 'OOM Error',
        }, {} as any)

        expect(result.error).toBe(true)
        expect(result.message).toBe("AWS DynamoDB error: The database table 'morphos-sre-audit-logs' was not found.")
        expect(sendSpy).toHaveBeenCalled()
      } finally {
        sendSpy.mockRestore()
      }
    })

    test('should translate AccessDeniedException into a friendly message', async () => {
      // AccessDeniedException is a cloud-specific permission error not enforceable on local DynamoDB.
      // We are explicitly allowed to mock cloud-only services/behaviors not present locally.
      const sendSpy = vi.spyOn(ddbDocClient, 'send').mockImplementationOnce(() => {
        const error = new Error('Access Denied')
        ;(error as any).code = 'AccessDeniedException'
        return Promise.reject(error)
      })

      try {
        const result = await sreTools.evaluateIncident.execute({
          incidentId: 'INC-9999',
          severity: 'low',
          affectedServices: ['web-portal'],
          summary: 'OOM Error',
        }, {} as any)

        expect(result.error).toBe(true)
        expect(result.message).toBe("AWS IAM error: Insufficient permissions to write to the audit log.")
        expect(sendSpy).toHaveBeenCalled()
      } finally {
        sendSpy.mockRestore()
      }
    })
  })

  // 4. Timeout Handling
  describe('Timeout Handling', () => {
    test('should timeout logToAWSAudit and fallback if DynamoDB takes longer than 5 seconds', async () => {
      vi.useFakeTimers()
      
      // We spy on ddbDocClient.send and delay its response to simulate a slow network timeout
      const sendSpy = vi.spyOn(ddbDocClient, 'send').mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 10000)
        })
      })

      try {
        const executePromise = sreTools.evaluateIncident.execute({
          incidentId: 'INC-8888',
          severity: 'low',
          affectedServices: ['payment-gateway'],
          summary: 'Timeout trigger test',
        }, {} as any)

        await vi.advanceTimersByTimeAsync(6000)

        const result = await executePromise
        expect(result.error).toBe(true)
        expect(result.message).toBe("AWS Timeout: The database did not respond within the 5-second limit. Operating in degraded fallback mode.")
        expect(sendSpy).toHaveBeenCalled()
      } finally {
        sendSpy.mockRestore()
      }
    })
  })

  // 5. Real End-to-End integration test calling real Ollama and DynamoDB Local
  describe('Real End-to-End Integration (Ollama & DynamoDB)', () => {
    test('should process a chat incident query and successfully stream response from Ollama', async () => {
      // Ensure we have endpoints set up correctly (or default if not specified)
      console.log('Using Ollama URL:', process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434/v1')
      console.log('Using DynamoDB Endpoint:', process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000')

      const request = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              id: 'test-msg-1',
              role: 'user',
              content: 'Evaluate the incident INC-9009 with severity low on service frontend-service: Page loading is extremely slow.',
              parts: [
                {
                  type: 'text',
                  text: 'Evaluate the incident INC-9009 with severity low on service frontend-service: Page loading is extremely slow.',
                },
              ],
            },
          ],
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const reader = response.body?.getReader()
      expect(reader).toBeDefined()

      let chunksCount = 0
      const decoder = new TextDecoder()
      
      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          if (value) {
            chunksCount++
            const text = decoder.decode(value)
            console.log('Stream chunk:', text)
          }
        }
      }

      expect(chunksCount).toBeGreaterThan(0)

      // Let's also verify that the incident was written to DynamoDB Local
      const tableName = process.env.AUDIT_TABLE_NAME || 'morphos-sre-audit-logs'
      const dbResult = await ddbDocClient.send(
        new ScanCommand({
          TableName: tableName,
        })
      )
      
      const savedItem = dbResult.Items?.find(item => item.incident_id === 'INC-9009')
      expect(savedItem).toBeDefined()
      expect(savedItem?.authority_zone).toBe('GREEN')
      expect(savedItem?.resolution_details).toContain('Page loading is extremely slow')
    }, 120000) // 120s timeout for LLM generation
  })
})
