"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Clock, FileText, ArrowUpRight } from "lucide-react"
import { RevenueChart } from "./revenue-chart"
import { recentInvoices, revenueSeries, eur, eurCompact } from "@/lib/ledgerhub-data"
import { useLang } from "@/lib/lang-context"

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
}: {
  label: string
  value: string
  icon: typeof TrendingUp
  accent: string
  trend?: { value: string; positive: boolean }
}) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`flex size-9 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-50" suppressHydrationWarning>{value}</p>
      {trend && (
        <p
          className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
            trend.positive ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
          {trend.value}
        </p>
      )}
    </div>
  )
}

export function DashboardView() {
  const { t, lang } = useLang()
  const [invoices, setInvoices] = useState<any[]>(recentInvoices)

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/invoices")
        if (res.ok) {
          const data = await res.json()
          // Trier par date décroissante pour afficher les plus récentes en premier
          const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setInvoices(sorted)
        }
      } catch (err) {
        console.error("Failed to fetch invoices", err)
      }
    }
    fetchInvoices()
  }, [])

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amountTTC, 0)
  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.amountTTC, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label={t.kpi.revenue}
          value={eur.format(totalPaid)}
          icon={TrendingUp}
          accent="bg-emerald-500/10 text-emerald-400"
          trend={{ value: t.kpi.revenueTrend, positive: true }}
        />
        <KpiCard
          label={t.kpi.pending}
          value={eur.format(totalPending)}
          icon={Clock}
          accent="bg-amber-500/10 text-amber-400"
          trend={{ value: t.kpi.pendingTrend, positive: false }}
        />
        <KpiCard
          label={t.kpi.issued}
          value={`${invoices.length}`}
          icon={FileText}
          accent="bg-blue-500/10 text-blue-400"
          trend={{ value: t.kpi.issuedTrend, positive: true }}
        />
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">{t.chart.title}</h2>
            <p className="text-xs text-slate-500">{t.chart.subtitle}</p>
          </div>
          <span className="text-right">
            <span className="block text-lg font-semibold text-slate-50" suppressHydrationWarning>
              {eurCompact.format(revenueSeries.reduce((s, p) => s + p.revenue, 0))}
            </span>
            <span className="text-[11px] text-slate-500">{t.chart.cumul}</span>
          </span>
        </div>
        <div className="mt-4">
          <RevenueChart data={revenueSeries} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-200">{t.recentInvoices}</h2>
          <button type="button" className="text-xs font-medium text-blue-400 hover:text-blue-300">
            {t.viewAll}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800/60 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">{t.tableHeaders.invoiceNo}</th>
                <th className="px-5 py-3 font-medium">{t.tableHeaders.client}</th>
                <th className="px-5 py-3 font-medium">{t.tableHeaders.date}</th>
                <th className="px-5 py-3 text-right font-medium">{t.tableHeaders.amountTTC}</th>
                <th className="px-5 py-3 text-right font-medium">{t.tableHeaders.status}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                // Map status key to translated label + styling from data
                const statusKey = inv.status
                const statusLabel = t.status[statusKey]
                const dotClass =
                  statusKey === "paid"
                    ? "bg-emerald-400"
                    : statusKey === "pending"
                      ? "bg-amber-400"
                      : "bg-slate-500"
                const badgeClass =
                  statusKey === "paid"
                    ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                    : statusKey === "pending"
                      ? "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20"
                      : "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20"

                return (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-800/40 last:border-0 transition-colors hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">{inv.id}</td>
                    <td className="px-5 py-3.5 text-slate-200">{inv.clientName}</td>
                    <td className="px-5 py-3.5 text-slate-400" suppressHydrationWarning>
                      {new Date(inv.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-100" suppressHydrationWarning>
                      {eur.format(inv.amountTTC)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}
                      >
                        <span className={`size-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
