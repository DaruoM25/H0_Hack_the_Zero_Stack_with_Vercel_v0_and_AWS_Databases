"use client"

import { useState, useEffect } from "react"
import { eurCompact } from "@/lib/ledgerhub-data"
import { useLang } from "@/lib/lang-context"

export function ClientsView() {
  const { t } = useLang()
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/customers")
        if (res.ok) {
          const data = await res.json()
          setClients(data)
        }
      } catch (err) {
        console.error("Failed to fetch clients", err)
      }
    }
    fetchClients()
  }, [])

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40">
      <div className="border-b border-slate-800/60 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-200">{t.clientsTitle}</h2>
        <p className="text-xs text-slate-500">{t.clientsSubtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/60 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">{t.clientsHeaders.company}</th>
              <th className="px-5 py-3 font-medium">{t.clientsHeaders.siret}</th>
              <th className="px-5 py-3 font-medium">{t.clientsHeaders.email}</th>
              <th className="px-5 py-3 text-right font-medium">{t.clientsHeaders.invoices}</th>
              <th className="px-5 py-3 text-right font-medium">{t.clientsHeaders.totalBilled}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.siret}
                className="border-b border-slate-800/40 last:border-0 transition-colors hover:bg-slate-800/30"
              >
                <td className="px-5 py-3.5 font-medium text-slate-100">{c.clientName}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{c.siret}</td>
                <td className="px-5 py-3.5 text-slate-400">{c.email}</td>
                <td className="px-5 py-3.5 text-right text-slate-300">{c.invoiceCount}</td>
                <td className="px-5 py-3.5 text-right font-medium text-slate-100" suppressHydrationWarning>
                  {eurCompact.format(c.totalBilled)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
