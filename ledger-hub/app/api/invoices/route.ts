import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

// Initialise le client AWS DynamoDB en utilisant strictement les variables
// d'environnement injectées sur Vercel (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, et AWS_REGION).
// Le SDK AWS lit automatiquement ces variables d'environnement.
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Générer un identifiant unique (UUID) et un horodatage ISO si non fournis
    const id = body.id || crypto.randomUUID();
    const date = body.date || new Date().toISOString();
    
    const invoice = {
      ...body,
      id,
      date,
      createdAt: new Date().toISOString()
    };

    const tableName = process.env.DYNAMODB_TABLE_NAME;
    if (!tableName) {
      throw new Error("La variable d'environnement DYNAMODB_TABLE_NAME est introuvable.");
    }

    // Insérer l'élément dans la table référencée par DYNAMODB_TABLE_NAME
    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: invoice,
      })
    );

    // Mettre à jour la table LedgerHub_Customers (double écriture / Upsert)
    const customersTableName = process.env.DYNAMODB_CUSTOMERS_TABLE_NAME;
    if (!customersTableName) {
      throw new Error("La variable d'environnement DYNAMODB_CUSTOMERS_TABLE_NAME est introuvable.");
    }
    
    if (invoice.siret) {
      await docClient.send(
        new UpdateCommand({
          TableName: customersTableName,
          Key: { siret: invoice.siret },
          UpdateExpression: "SET clientName = :cn, email = :em, invoiceCount = if_not_exists(invoiceCount, :zero) + :inc, totalBilled = if_not_exists(totalBilled, :zero) + :amt",
          ExpressionAttributeValues: {
            ":cn": invoice.clientName || "Inconnu",
            ":em": invoice.email || "",
            ":inc": 1,
            ":amt": invoice.amountTTC || 0,
            ":zero": 0,
          },
        })
      );
    }

    // Une insertion réussie doit renvoyer un code HTTP 201 Created avec le JSON de la facture.
    return Response.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de l'insertion dans DynamoDB:", error);
    
    // Toute levée d'exception doit être interceptée et renvoyer un code HTTP 500 avec le message d'erreur explicite
    return Response.json(
      { error: error.message || "Erreur interne du serveur lors de la persistance des données." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    if (!tableName) {
      throw new Error("La variable d'environnement DYNAMODB_TABLE_NAME est introuvable.");
    }

    const data = await docClient.send(
      new ScanCommand({
        TableName: tableName,
      })
    );

    return Response.json(data.Items || [], { status: 200 });
  } catch (error: any) {
    console.error("Erreur lors de la récupération dans DynamoDB:", error);
    return Response.json(
      { error: error.message || "Erreur interne du serveur lors de la récupération des données." },
      { status: 500 }
    );
  }
}
