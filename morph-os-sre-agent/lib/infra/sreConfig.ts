import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { createOpenAI } from '@ai-sdk/openai'

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

export async function ensureAuditTableExists() {
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
export const ollamaProvider = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434/v1',
  apiKey: 'ollama',
  compatibility: 'compatible',
})

export async function logToAWSAudit(payload: { incidentId: string; zone: string; summary: string; action: string }) {
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
