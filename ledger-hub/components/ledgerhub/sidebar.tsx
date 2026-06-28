"use client"

import { LayoutDashboard, FileText, Users, Landmark, ReceiptText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/lang-context"

export type NavKey = "overview" | "invoices" | "clients" | "tax"

const NAV_ICONS: Record<NavKey, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  invoices: FileText,
  clients: Users,
  tax: Landmark,
}

const NAV_KEYS: NavKey[] = ["overview", "invoices", "clients", "tax"]

export function Sidebar({
  active,
  onNavigate,
}: {
  active: NavKey
  onNavigate: (key: NavKey) => void
}) {
  const { t } = useLang()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800/60 bg-slate-950 px-4 py-6 md:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15 ring-1 ring-inset ring-blue-500/30">
          <ReceiptText className="size-5 text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-slate-50">{t.brand}</p>
          <p className="mt-1 text-[11px] text-slate-500">{t.brandTagline}</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Navigation principale">
        {NAV_KEYS.map((key) => {
          const Icon = NAV_ICONS[key]
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800/80 text-slate-50 ring-1 ring-inset ring-slate-700"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
              )}
            >
              <Icon className="size-4.5 shrink-0" aria-hidden="true" />
              {t.nav[key]}
            </button>
          )
        })}
      </nav>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">{t.complianceBadgeTitle}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{t.complianceBadgeDesc}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="text-[11px] font-medium text-emerald-400">{t.complianceBadgeCert}</span>
        </div>
      </div>
    </aside>
  )
}
