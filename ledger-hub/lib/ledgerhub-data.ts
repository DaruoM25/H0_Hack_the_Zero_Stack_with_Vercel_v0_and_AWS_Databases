// Shared types and mock data for LedgerHub.
// Shapes are kept explicit so they map cleanly onto a Next.js API Route /
// AWS DynamoDB item later on.

export type InvoiceStatus = "paid" | "pending" | "draft"

export interface Invoice {
  id: string
  clientName: string
  date: string // ISO date (YYYY-MM-DD)
  amountTTC: number
  status: InvoiceStatus
}

export interface Client {
  id: string
  companyName: string
  siret: string // 14 digits
  email: string
  totalBilled: number
  invoiceCount: number
}

export interface RevenuePoint {
  month: string
  revenue: number
}

export const STATUS_META: Record<
  InvoiceStatus,
  { label: string; dot: string; badge: string }
> = {
  paid: {
    label: "Payé",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
  },
  pending: {
    label: "En attente",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
  },
  draft: {
    label: "Brouillon",
    dot: "bg-slate-500",
    badge: "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20",
  },
}

export const VAT_RATES = [20, 10, 5.5, 0] as const
export type VatRate = (typeof VAT_RATES)[number]

export const recentInvoices: Invoice[] = [
  { id: "FAC-2026-0142", clientName: "Boulangerie Moreau SARL", date: "2026-06-24", amountTTC: 1248.0, status: "paid" },
  { id: "FAC-2026-0141", clientName: "Atelier Dupont & Fils", date: "2026-06-22", amountTTC: 4680.5, status: "pending" },
  { id: "FAC-2026-0140", clientName: "Cabinet Lefèvre Conseil", date: "2026-06-20", amountTTC: 9600.0, status: "paid" },
  { id: "FAC-2026-0139", clientName: "Studio Lumière Média", date: "2026-06-18", amountTTC: 2310.0, status: "draft" },
  { id: "FAC-2026-0138", clientName: "Transports Garnier SAS", date: "2026-06-15", amountTTC: 7425.75, status: "pending" },
  { id: "FAC-2026-0137", clientName: "Ferme Bio des Coteaux", date: "2026-06-12", amountTTC: 880.2, status: "paid" },
]

export const clients: Client[] = [
  { id: "CLI-001", companyName: "Boulangerie Moreau SARL", siret: "81234567800021", email: "compta@moreau-pains.fr", totalBilled: 18240, invoiceCount: 14 },
  { id: "CLI-002", companyName: "Atelier Dupont & Fils", siret: "49876543200017", email: "contact@dupont-fils.fr", totalBilled: 42680, invoiceCount: 9 },
  { id: "CLI-003", companyName: "Cabinet Lefèvre Conseil", siret: "33445566700045", email: "facturation@lefevre-conseil.fr", totalBilled: 96000, invoiceCount: 12 },
  { id: "CLI-004", companyName: "Studio Lumière Média", siret: "52233144500033", email: "hello@studiolumiere.fr", totalBilled: 23100, invoiceCount: 7 },
  { id: "CLI-005", companyName: "Transports Garnier SAS", siret: "78912345600028", email: "admin@garnier-transports.fr", totalBilled: 74257, invoiceCount: 18 },
]

export const revenueSeries: RevenuePoint[] = [
  { month: "Jan", revenue: 28400 },
  { month: "Fév", revenue: 31200 },
  { month: "Mar", revenue: 26900 },
  { month: "Avr", revenue: 38600 },
  { month: "Mai", revenue: 42100 },
  { month: "Juin", revenue: 51800 },
]

export const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

export const eurCompact = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})
