import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

async function createCustomersTable() {
  try {
    console.log("Création de la table LedgerHub_Customers...");
    const data = await client.send(
      new CreateTableCommand({
        TableName: "LedgerHub_Customers",
        AttributeDefinitions: [{ AttributeName: "siret", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "siret", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      })
    );
    console.log("✅ Table LedgerHub_Customers créée avec succès !", data.TableDescription?.TableStatus);
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log("ℹ️ La table LedgerHub_Customers existe déjà.");
    } else {
      console.error("❌ Erreur lors de la création de la table :", err.message);
    }
  }
}

createCustomersTable();
