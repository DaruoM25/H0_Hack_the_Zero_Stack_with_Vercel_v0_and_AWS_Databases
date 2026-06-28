"use client"

import { Plus } from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { cn } from "@/lib/utils"

export function Header({
  title,
  subtitle,
  onCreate,
}: {
  title: string
  subtitle: string
  onCreate?: () => void
}) {
  const { lang, setLang, t } = useLang()

  return (
    <header className="flex flex-col gap-4 border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-slate-50">{title}</h1>
        <p className="truncate text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* AWS live badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          {t.awsBadge}
        </span>

        {/* Language toggle */}
        <div
          className="flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5"
          role="group"
          aria-label="Language selector"
        >
          <button
            type="button"
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              lang === "en"
                ? "bg-slate-700 text-slate-50 shadow-sm"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            🇬🇧 EN
          </button>
          <button
            type="button"
            onClick={() => setLang("fr")}
            aria-pressed={lang === "fr"}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              lang === "fr"
                ? "bg-slate-700 text-slate-50 shadow-sm"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            🇫🇷 FR
          </button>
        </div>

        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t.createInvoice}
          </button>
        )}

        {/* User profile */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none text-slate-200">Camille Roux</p>
            <p className="mt-1 text-[11px] text-slate-500">{t.userRole}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-slate-700">
            CR
          </div>
        </div>
      </div>
    </header>
  )
}
