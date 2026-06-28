"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { dict, type Lang, type Dict } from "./i18n"

interface LangContextValue {
  lang: Lang
  t: Dict
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  // Start with "en" so SSR/hydration is deterministic; auto-detection runs
  // client-side in the useEffect below.
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    const browserLocale = navigator.language ?? ""
    setLang(browserLocale.startsWith("fr") ? "fr" : "en")
  }, [])

  return (
    <LangContext value={{ lang, t: dict[lang], setLang }}>
      {children}
    </LangContext>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used within a LangProvider")
  return ctx
}
