"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Plus, Trash2, Building2, FileDigit, FileCheck2, Cloud, CheckCircle2, Loader2 } from "lucide-react"
import { VAT_RATES, type VatRate, eur } from "@/lib/ledgerhub-data"
import { useLang } from "@/lib/lang-context"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPriceHT: number
  vatRate: VatRate
}

function newLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPriceHT: 0,
    vatRate: 20,
  }
}

const inputBase =
  "w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
const labelBase = "mb-1.5 block text-xs font-medium text-slate-400"

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-blue-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function InvoiceForm({ onBack }: { onBack: () => void }) {
  const { t } = useLang()
  const f = t.form

  const [items, setItems] = useState<LineItem[]>([newLine()])
  const [facturX, setFacturX] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setNotification(null)

    try {
      const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || ""
      
      const payload = {
        id: getVal("number") || `FAC-${Date.now()}`,
        clientName: getVal("company"),
        siret: getVal("siret"),
        email: getVal("email"),
        date: getVal("issue"),
        dueDate: getVal("due"),
        items,
        amountTTC: totals.totalTTC, // Required field based on data structure
        status: "pending",
        facturX,
      }

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de la facture")
      }
      
      setNotification({ type: "success", message: `Facture créée avec succès (ID: ${data.id})` })
    } catch (err: any) {
      setNotification({ type: "error", message: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totals = useMemo(() => {
    let totalHT = 0
    let totalTVA = 0
    for (const item of items) {
      const lineHT = item.quantity * item.unitPriceHT
      totalHT += lineHT
      totalTVA += lineHT * (item.vatRate / 100)
    }
    return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
  }, [items])

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t.backToDashboard}
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section icon={Building2} title={f.clientSection}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelBase} htmlFor="company">{f.company}</label>
                <input id="company" className={inputBase} placeholder={f.companyPlaceholder} />
              </div>
              <div>
                <label className={labelBase} htmlFor="siret">{f.siret}</label>
                <input
                  id="siret"
                  inputMode="numeric"
                  maxLength={14}
                  className={`${inputBase} font-mono tracking-wider`}
                  placeholder={f.siretPlaceholder}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor="email">{f.email}</label>
                <input id="email" type="email" className={inputBase} placeholder={f.emailPlaceholder} />
              </div>
            </div>
          </Section>

          <Section icon={FileDigit} title={f.detailsSection}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelBase} htmlFor="number">{f.invoiceNo}</label>
                <input id="number" className={`${inputBase} font-mono`} placeholder="FAC-2026-0143" />
              </div>
              <div>
                <label className={labelBase} htmlFor="issue">{f.issueDate}</label>
                <input id="issue" type="date" className={inputBase} defaultValue="2026-06-28" />
              </div>
              <div>
                <label className={labelBase} htmlFor="due">{f.dueDate}</label>
                <input id="due" type="date" className={inputBase} defaultValue="2026-07-28" />
              </div>
            </div>
          </Section>

          <Section icon={FileCheck2} title={f.linesSection}>
            <div className="space-y-3">
              <div className="hidden grid-cols-12 gap-2 px-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:grid">
                <span className="col-span-5">{f.lineHeaders.description}</span>
                <span className="col-span-2">{f.lineHeaders.quantity}</span>
                <span className="col-span-2">{f.lineHeaders.unitPrice}</span>
                <span className="col-span-2">{f.lineHeaders.vat}</span>
                <span className="col-span-1" />
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 items-center gap-2">
                  <input
                    className={`${inputBase} col-span-12 sm:col-span-5`}
                    placeholder={f.lineDescPlaceholder}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    className={`${inputBase} col-span-4 sm:col-span-2`}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputBase} col-span-4 sm:col-span-2`}
                    value={item.unitPriceHT}
                    onChange={(e) => updateItem(item.id, { unitPriceHT: Number(e.target.value) })}
                  />
                  <select
                    className={`${inputBase} col-span-3 sm:col-span-2`}
                    value={item.vatRate}
                    onChange={(e) => updateItem(item.id, { vatRate: Number(e.target.value) as VatRate })}
                  >
                    {VAT_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate} %
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== item.id) : prev))
                    }
                    className="col-span-1 flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400 disabled:opacity-40"
                    disabled={items.length === 1}
                    aria-label={f.deleteLine}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, newLine()])}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-blue-500 hover:text-blue-400"
            >
              <Plus className="size-4" aria-hidden="true" />
              {f.addLine}
            </button>
          </Section>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-5 rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
            <h3 className="text-sm font-semibold text-slate-200">{f.summary}</h3>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">{f.totalHT}</dt>
                <dd className="font-medium text-slate-100" suppressHydrationWarning>{eur.format(totals.totalHT)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">{f.totalVAT}</dt>
                <dd className="font-medium text-slate-100" suppressHydrationWarning>{eur.format(totals.totalTVA)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <dt className="text-base font-semibold text-slate-50">{f.totalTTC}</dt>
                <dd className="text-base font-semibold text-emerald-400" suppressHydrationWarning>{eur.format(totals.totalTTC)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => setFacturX((v) => !v)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                facturX
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-800 bg-slate-950 text-slate-400"
              }`}
              aria-pressed={facturX}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                {f.facturxLabel}
              </span>
              <span
                className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  facturX ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`size-4 rounded-full bg-white transition-transform ${facturX ? "translate-x-4" : ""}`}
                />
              </span>
            </button>

            {notification && (
              <div className={`rounded-lg px-3 py-2.5 text-sm font-medium border ${
                notification.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {notification.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Cloud className="size-4" aria-hidden="true" />
              )}
              {isSubmitting ? f.submitting : f.submitBtn}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-slate-500">{f.archiveNote}</p>
          </div>
        </div>
      </form>
    </div>
  )
}
