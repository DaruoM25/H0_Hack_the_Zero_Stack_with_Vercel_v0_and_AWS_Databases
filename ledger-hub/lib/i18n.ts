export type Lang = "en" | "fr"

export const dict = {
  en: {
    // ── Brand ───────────────────────────────────────────────────────
    brand: "LedgerHub",
    brandTagline: "Invoicing 2026",

    // ── Sidebar nav ─────────────────────────────────────────────────
    nav: {
      overview: "Overview",
      invoices: "Invoices",
      clients: "Clients",
      tax: "Tax Settings",
    },

    // ── Sidebar compliance badge ─────────────────────────────────────
    complianceBadgeTitle: "Factur-X Compliance",
    complianceBadgeDesc:
      "Hybrid PDF/A-3 + XML legal format emission enabled.",
    complianceBadgeCert: "Certified OD 2026",

    // ── Header titles & subtitles ────────────────────────────────────
    headerTitles: {
      overview: { title: "Overview", subtitle: "Manage your activity and 2026 compliance" },
      invoices: { title: "Invoices", subtitle: "Manage your Factur-X e-invoices" },
      clients: { title: "Clients", subtitle: "Directory of billed entities" },
      tax: { title: "Tax Settings", subtitle: "VAT configuration and dematerialisation" },
      create: { title: "Create an Invoice", subtitle: "Issue in legal Factur-X format" },
    },

    // ── Header actions ───────────────────────────────────────────────
    createInvoice: "Create Invoice",
    userRole: "Chartered Accountant",
    awsBadge: "Live AWS Cloud",

    // ── Dashboard KPIs ───────────────────────────────────────────────
    kpi: {
      revenue: "Revenue",
      revenueTrend: "+12.4% vs last month",
      pending: "Awaiting Payment",
      pendingTrend: "2 invoices to follow up",
      issued: "Invoices Issued",
      issuedTrend: "+3 this week",
    },

    // ── Revenue chart ────────────────────────────────────────────────
    chart: {
      title: "Revenue",
      subtitle: "Last 6 months — collected incl. VAT",
      cumul: "6-month cumulative",
      ariaLabel: "Revenue evolution over the last six months",
      min: "Min",
      max: "Max",
    },

    // ── Recent invoices table ────────────────────────────────────────
    recentInvoices: "Recent Invoices",
    viewAll: "View all",
    tableHeaders: {
      invoiceNo: "Invoice No.",
      client: "Client",
      date: "Date",
      amountTTC: "Amount (incl. VAT)",
      status: "Status",
    },

    // ── Status labels ────────────────────────────────────────────────
    status: {
      paid: "Paid",
      pending: "Pending",
      draft: "Draft",
    },

    // ── Clients view ─────────────────────────────────────────────────
    clientsTitle: "Clients",
    clientsSubtitle: "Directory of billed entities and SIRET identifiers",
    clientsHeaders: {
      company: "Company Name",
      siret: "SIRET",
      email: "Email",
      invoices: "Invoices",
      totalBilled: "Total Billed",
    },

    // ── Tax view ─────────────────────────────────────────────────────
    taxCards: [
      {
        title: "Dematerialisation Operator",
        desc: "Registered partner platform (PDP) for issuing and receiving e-invoices from 2026.",
        badge: "Active",
      },
      {
        title: "Factur-X Format (EN 16931)",
        desc: "Automatic hybrid PDF/A-3 generation with structured XML data for every invoice issued.",
        badge: "Default",
      },
      {
        title: "Legal AWS Archiving",
        desc: "10-year document retention with timestamping and integrity guarantee on Amazon DynamoDB + S3.",
        badge: "Encrypted",
      },
    ],
    vatTableTitle: "Configured VAT Rates",
    vatTableSubtitle: "Scale applied to invoice line items",
    vatLines: [
      { label: "Standard Rate", rate: "20%", note: "Standard goods & services" },
      { label: "Intermediate Rate", rate: "10%", note: "Catering, construction works" },
      { label: "Reduced Rate", rate: "5.5%", note: "Essential goods" },
      { label: "Zero Rate", rate: "0%", note: "Exemptions & EU exports" },
    ],

    // ── Invoice form ─────────────────────────────────────────────────
    backToDashboard: "Back to dashboard",
    form: {
      clientSection: "Client Information",
      company: "Company Name",
      companyPlaceholder: "Atelier Dupont & Fils",
      siret: "SIRET (14 digits)",
      siretPlaceholder: "49876543200017",
      email: "Client Email",
      emailPlaceholder: "contact@dupont-fils.fr",
      detailsSection: "Invoice Details",
      invoiceNo: "Invoice No.",
      issueDate: "Issue Date",
      dueDate: "Due Date",
      linesSection: "Service Lines",
      lineHeaders: {
        description: "Description",
        quantity: "Qty",
        unitPrice: "Unit Price HT",
        vat: "VAT",
      },
      lineDescPlaceholder: "Consulting service",
      deleteLine: "Delete line",
      addLine: "Add a line",
      summary: "Summary",
      totalHT: "Total excl. VAT",
      totalVAT: "Total VAT",
      totalTTC: "Total incl. VAT",
      facturxLabel: "Generate in legal Factur-X format (unified JSON/PDF)",
      submitBtn: "Issue and Persist on AWS",
      submitting: "Processing...",
      archiveNote:
        "The invoice will be timestamped and archived for 10 years in compliance with the 2026 reform.",
    },
  },

  fr: {
    // ── Brand ───────────────────────────────────────────────────────
    brand: "LedgerHub",
    brandTagline: "Facturation 2026",

    // ── Sidebar nav ─────────────────────────────────────────────────
    nav: {
      overview: "Vue d'ensemble",
      invoices: "Factures",
      clients: "Clients",
      tax: "Paramètres Fiscaux",
    },

    // ── Sidebar compliance badge ─────────────────────────────────────
    complianceBadgeTitle: "Conformité Factur-X",
    complianceBadgeDesc:
      "Émission au format légal hybride PDF/A-3 + XML activée.",
    complianceBadgeCert: "Certifié OD 2026",

    // ── Header titles & subtitles ─────────────────���──────────────────
    headerTitles: {
      overview: { title: "Vue d'ensemble", subtitle: "Pilotez votre activité et votre conformité 2026" },
      invoices: { title: "Factures", subtitle: "Gérez vos factures électroniques Factur-X" },
      clients: { title: "Clients", subtitle: "Annuaire des entités facturées" },
      tax: { title: "Paramètres Fiscaux", subtitle: "Configuration TVA et dématérialisation" },
      create: { title: "Créer une Facture", subtitle: "Émission au format légal Factur-X" },
    },

    // ── Header actions ───────────────────────────────────────────────
    createInvoice: "Créer une Facture",
    userRole: "Expert-comptable",
    awsBadge: "Live AWS Cloud",

    // ── Dashboard KPIs ───────────────────────────────────────────────
    kpi: {
      revenue: "Chiffre d'affaires",
      revenueTrend: "+12,4 % vs mois dernier",
      pending: "En attente de paiement",
      pendingTrend: "2 factures à relancer",
      issued: "Factures émises",
      issuedTrend: "+3 cette semaine",
    },

    // ── Revenue chart ────────────────────────────────────────────────
    chart: {
      title: "Chiffre d'affaires",
      subtitle: "6 derniers mois — montants TTC encaissés",
      cumul: "cumul semestre",
      ariaLabel: "Évolution du chiffre d'affaires sur les six derniers mois",
      min: "Min",
      max: "Max",
    },

    // ── Recent invoices table ────────────────────────────────────────
    recentInvoices: "Factures récentes",
    viewAll: "Tout voir",
    tableHeaders: {
      invoiceNo: "N° Facture",
      client: "Client",
      date: "Date",
      amountTTC: "Montant TTC",
      status: "Statut",
    },

    // ── Status labels ────────────────────────────────────────────────
    status: {
      paid: "Payé",
      pending: "En attente",
      draft: "Brouillon",
    },

    // ── Clients view ─────────────────────────────────────────────────
    clientsTitle: "Clients",
    clientsSubtitle: "Annuaire des entités facturées et identifiants SIRET",
    clientsHeaders: {
      company: "Raison sociale",
      siret: "SIRET",
      email: "Email",
      invoices: "Factures",
      totalBilled: "Total facturé",
    },

    // ── Tax view ─────────────────────────────────────────────────────
    taxCards: [
      {
        title: "Opérateur de Dématérialisation",
        desc: "Plateforme partenaire immatriculée (PDP) pour l'émission et la réception des e-factures à partir de 2026.",
        badge: "Actif",
      },
      {
        title: "Format Factur-X (EN 16931)",
        desc: "Génération automatique du PDF/A-3 hybride avec données structurées XML pour chaque facture émise.",
        badge: "Par défaut",
      },
      {
        title: "Archivage légal AWS",
        desc: "Conservation des pièces 10 ans avec horodatage et intégrité garantie sur Amazon DynamoDB + S3.",
        badge: "Chiffré",
      },
    ],
    vatTableTitle: "Taux de TVA configurés",
    vatTableSubtitle: "Barème appliqué aux lignes de facturation",
    vatLines: [
      { label: "Taux normal", rate: "20 %", note: "Prestations & biens standards" },
      { label: "Taux intermédiaire", rate: "10 %", note: "Restauration, travaux" },
      { label: "Taux réduit", rate: "5,5 %", note: "Produits de première nécessité" },
      { label: "Taux exonéré", rate: "0 %", note: "Exonérations & exports UE" },
    ],

    // ── Invoice form ─────────────────────────────────────────────────
    backToDashboard: "Retour au tableau de bord",
    form: {
      clientSection: "Informations Client",
      company: "Raison sociale",
      companyPlaceholder: "Atelier Dupont & Fils",
      siret: "SIRET (14 chiffres)",
      siretPlaceholder: "49876543200017",
      email: "Email du client",
      emailPlaceholder: "contact@dupont-fils.fr",
      detailsSection: "Détails de la Facture",
      invoiceNo: "N° de facture",
      issueDate: "Date d'émission",
      dueDate: "Date d'échéance",
      linesSection: "Lignes de prestation",
      lineHeaders: {
        description: "Description",
        quantity: "Quantité",
        unitPrice: "P.U. HT",
        vat: "TVA",
      },
      lineDescPlaceholder: "Prestation de conseil",
      deleteLine: "Supprimer la ligne",
      addLine: "Ajouter une ligne",
      summary: "Récapitulatif",
      totalHT: "Total HT",
      totalVAT: "Total TVA",
      totalTTC: "Total TTC",
      facturxLabel: "Générer au format légal Factur-X (JSON/PDF unifié)",
      submitBtn: "Émettre et Persister sur AWS",
      submitting: "Traitement...",
      archiveNote:
        "La facture sera horodatée et archivée 10 ans conformément à la réforme 2026.",
    },
  },
}

// Dict is the structural shape shared by both locales.
export type Dict = typeof dict["en"]
