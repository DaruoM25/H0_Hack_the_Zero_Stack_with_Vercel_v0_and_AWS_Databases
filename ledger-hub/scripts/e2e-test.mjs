import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const TARGET_URL = process.env.TEST_TARGET_URL || "http://localhost:3002";
const INVOICES_TABLE = process.env.DYNAMODB_TABLE_NAME || "LedgerHub_Invoices";
const CUSTOMERS_TABLE = process.env.DYNAMODB_CUSTOMERS_TABLE_NAME || "LedgerHub_Customers";

const TEST_SIRET = "99999999999";

async function runTest() {
  console.log("🚀 Démarrage du test d'intégrité relationnelle (QA-004)...");
  
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const testId1 = `TEST-E2E-INV1-${Date.now()}`;
  const testId2 = `TEST-E2E-INV2-${Date.now()}`;
  
  const payload1 = {
    id: testId1,
    clientName: "Entreprise E2E Relationnelle",
    siret: TEST_SIRET,
    email: "test-relational@ledgerhub.local",
    date: new Date().toISOString(),
    amountTTC: 100.50,
    status: "paid",
  };

  const payload2 = {
    id: testId2,
    clientName: "Entreprise E2E Relationnelle",
    siret: TEST_SIRET,
    email: "test-relational@ledgerhub.local",
    date: new Date().toISOString(),
    amountTTC: 200.25,
    status: "pending",
  };

  try {
    // Étape 1 : Création de la première facture
    console.log(`\n📡 1/4 : Envoi de la facture #1 vers ${TARGET_URL}/api/invoices...`);
    let res = await fetch(`${TARGET_URL}/api/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload1),
    });
    if (!res.ok) throw new Error(`Échec API POST 1 (${res.status})`);
    
    // Attente de consistance
    await new Promise(r => setTimeout(r, 1000));

    // Étape 2 : Vérification de la création de la facture et du client initial
    console.log(`\n🔍 2/4 : Vérification de la création initiale (Tables Invoices & Customers)...`);
    let invoice1Res = await docClient.send(new GetCommand({ TableName: INVOICES_TABLE, Key: { id: testId1 } }));
    if (!invoice1Res.Item) throw new Error("Facture #1 introuvable dans LedgerHub_Invoices.");
    
    let customerRes = await docClient.send(new GetCommand({ TableName: CUSTOMERS_TABLE, Key: { siret: TEST_SIRET } }));
    if (!customerRes.Item) throw new Error("Fiche client introuvable dans LedgerHub_Customers.");
    
    if (customerRes.Item.invoiceCount !== 1) throw new Error(`invoiceCount incorrect (attendu 1, reçu ${customerRes.Item.invoiceCount})`);
    if (customerRes.Item.totalBilled !== 100.50) throw new Error(`totalBilled incorrect (attendu 100.5, reçu ${customerRes.Item.totalBilled})`);

    console.log("✅ Client initialisé correctement avec 1 facture.");

    // Étape 3 : Création de la deuxième facture (Incrémentation)
    console.log(`\n📡 3/4 : Envoi de la facture #2 pour tester l'incrémentation...`);
    res = await fetch(`${TARGET_URL}/api/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload2),
    });
    if (!res.ok) throw new Error(`Échec API POST 2 (${res.status})`);

    await new Promise(r => setTimeout(r, 1000));

    // Étape 4 : Vérification de l'incrémentation
    console.log(`\n🔍 4/4 : Vérification du cumul dans LedgerHub_Customers...`);
    customerRes = await docClient.send(new GetCommand({ TableName: CUSTOMERS_TABLE, Key: { siret: TEST_SIRET } }));
    
    if (customerRes.Item.invoiceCount !== 2) throw new Error(`Échec incrémentation invoiceCount (attendu 2, reçu ${customerRes.Item.invoiceCount})`);
    if (customerRes.Item.totalBilled !== 300.75) throw new Error(`Échec incrémentation totalBilled (attendu 300.75, reçu ${customerRes.Item.totalBilled})`);

    console.log("✅ Incrémentation et cumul validés avec succès dans DynamoDB !");
    
    // Nettoyage (Idempotence)
    console.log("\n🧹 Nettoyage des données de test (Invoices et Customers)...");
    await docClient.send(new DeleteCommand({ TableName: INVOICES_TABLE, Key: { id: testId1 } }));
    await docClient.send(new DeleteCommand({ TableName: INVOICES_TABLE, Key: { id: testId2 } }));
    await docClient.send(new DeleteCommand({ TableName: CUSTOMERS_TABLE, Key: { siret: TEST_SIRET } }));
    console.log("✅ Nettoyage terminé.");

    console.log("\n🎉 Tous les tests d'intégrité relationnelle (QA-004) ont réussi !");
    process.exit(0);
  } catch (error) {
    console.error("\n🚨 ALERTE CRITIQUE : Le test d'intégrité a échoué !");
    console.error("Détails :", error instanceof Error ? error.message : error);
    
    // Tentative de nettoyage même en cas d'erreur
    try {
      await docClient.send(new DeleteCommand({ TableName: INVOICES_TABLE, Key: { id: testId1 } }));
      await docClient.send(new DeleteCommand({ TableName: INVOICES_TABLE, Key: { id: testId2 } }));
      await docClient.send(new DeleteCommand({ TableName: CUSTOMERS_TABLE, Key: { siret: TEST_SIRET } }));
    } catch(e) {}
    
    process.exit(1);
  }
}

runTest();
