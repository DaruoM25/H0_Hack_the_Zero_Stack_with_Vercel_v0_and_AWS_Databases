import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    const tableName = process.env.DYNAMODB_CUSTOMERS_TABLE_NAME;
    if (!tableName) {
      throw new Error("La variable d'environnement DYNAMODB_CUSTOMERS_TABLE_NAME est introuvable.");
    }

    const data = await docClient.send(
      new ScanCommand({
        TableName: tableName,
      })
    );

    return Response.json(data.Items || [], { status: 200 });
  } catch (error: any) {
    console.error("Erreur lors de la récupération des clients:", error);
    return Response.json(
      { error: error.message || "Erreur interne du serveur lors de la lecture des données." },
      { status: 500 }
    );
  }
}
