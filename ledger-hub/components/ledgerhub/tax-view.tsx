"use client"

import { ShieldCheck, FileStack, Server } from "lucide-react"
import { useLang } from "@/lib/lang-context"

const CARD_ICONS = [ShieldCheck, FileStack, Server]

export function TaxView() {
  const { t } = useLang()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {t.taxCards.map(({ title, desc, badge }, i) => {
          const Icon = CARD_ICONS[i]
          return (
            <div key={title} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                  {badge}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-100">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40">
        <div className="border-b border-slate-800/60 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-200">{t.vatTableTitle}</h2>
          <p className="text-xs text-slate-500">{t.vatTableSubtitle}</p>
        </div>
        <ul className="divide-y divide-slate-800/40">
          {t.vatLines.map((v) => (
            <li key={v.label} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-200">{v.label}</p>
                <p className="text-xs text-slate-500">{v.note}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-slate-100">{v.rate}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
