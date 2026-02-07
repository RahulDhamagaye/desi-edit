"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react"
import type { Product } from "@/lib/models/models"

type SearchPreviewContextType = {
  query: string
  results: Product[]
  loading: boolean
  setQuery: (q: string) => void
  setResults: (r: Product[]) => void
  setLoading: (v: boolean) => void
  clear: () => void
}

const SearchPreviewContext =
  createContext<SearchPreviewContextType | undefined>(undefined)

export function SearchPreviewProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const clear = useCallback(() => {
    setQuery("")
    setResults([])
    setLoading(false)
  }, [])

  return (
    <SearchPreviewContext.Provider
      value={{
        query,
        results,
        loading,
        setQuery,
        setResults,
        setLoading,
        clear,
      }}
    >
      {children}
    </SearchPreviewContext.Provider>
  )
}

export function useSearchPreview() {
  const ctx = useContext(SearchPreviewContext)
  if (!ctx) {
    throw new Error(
      "useSearchPreview must be used within SearchPreviewProvider"
    )
  }
  return ctx
}
