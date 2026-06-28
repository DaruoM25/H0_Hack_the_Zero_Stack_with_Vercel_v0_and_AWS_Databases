"use client"

import { useState } from "react"
import { Sidebar, type NavKey } from "@/components/ledgerhub/sidebar"
import { Header } from "@/components/ledgerhub/header"
import { DashboardView } from "@/components/ledgerhub/dashboard-view"
import { InvoiceForm } from "@/components/ledgerhub/invoice-form"
import { ClientsView } from "@/components/ledgerhub/clients-view"
import { TaxView } from "@/components/ledgerhub/tax-view"
import { useLang } from "@/lib/lang-context"

type View = NavKey | "create"

export default function Page() {
  const { t } = useLang()
  const [view, setView] = useState<View>("overview")
  const activeNav: NavKey = view === "create" ? "overview" : view

  const headerCopy =
    view === "create"
      ? t.headerTitles.create
      : t.headerTitles[activeNav]

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar active={activeNav} onNavigate={(k) => setView(k)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={headerCopy.title}
          subtitle={headerCopy.subtitle}
          onCreate={view !== "create" ? () => setView("create") : undefined}
        />

        <main className="flex-1 overflow-x-hidden p-6">
          {view === "overview" && <DashboardView />}
          {view === "invoices" && <DashboardView />}
          {view === "clients" && <ClientsView />}
          {view === "tax" && <TaxView />}
          {view === "create" && <InvoiceForm onBack={() => setView("overview")} />}
        </main>
      </div>
    </div>
  )
}
