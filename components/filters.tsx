"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

/* ----------------------------------------
   Types
----------------------------------------- */
type FilterSection = "category" | "price" | "size"

type Category = {
  id: string
  name: string
  slug: string
}

type SizeValue = string | { value: string }

type ProductWithSizes = { sizes?: string[] }

/* ----------------------------------------
   Component
----------------------------------------- */
export function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category")


  const [expandedSections, setExpandedSections] =
    useState<Record<FilterSection, boolean>>({
      category: true,
      price: true,
      size: true,
    })

  const [categories, setCategories] = useState<Category[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  

  /* ----------------------------------------
     Helpers
  ----------------------------------------- */
  const toggleSection = (section: FilterSection) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  /**
   * ✅ REAL E-COMMERCE BEHAVIOUR
   * - Clear search (q)
   * - Reset subcategory
   * - Keep other filters intact
   */
  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

     if (key === "category") {
      params.delete("subcategory")
      params.delete("size")        // ✅ CRITICAL FIX
      params.delete("q")           // ✅ clear search ONLY on category
    }

    const normalizedValue = value.toLowerCase()

    if (params.get(key) === normalizedValue) {
      params.delete(key)
    } else {
      params.set(key, normalizedValue)
    }

    router.push(`/shop?${params.toString()}`)
  }

  /* ----------------------------------------
     Load categories
  ----------------------------------------- */
  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("/api/categories", {
        cache: "force-cache",
      })
      if (!res.ok) return

      const data: Category[] = await res.json()

      setCategories(
        data.map((cat) => ({
          ...cat,
          slug: cat.slug.toLowerCase(),
        }))
      )
    }

    loadCategories()
  }, [])

  /* ----------------------------------------
     Load sizes (FIXED)
  ----------------------------------------- */
  /* ----------------------------------------
   Load sizes (CATEGORY AWARE)
----------------------------------------- */
useEffect(() => {
  async function loadSizes() {
    const params = new URLSearchParams()
    const showSizeFilter = sizes.length > 0


    const category = searchParams.get("category")
    const q = searchParams.get("q")
    if (category) {
      params.set("category", category)
    }
    if (q) {
      params.set("q", q)
    }

    const res = await fetch(`/api/products?${params.toString()}`, {
      cache: "force-cache",
    })
    if (!res.ok) return

    //const products: ProductWithSizes[] = await res.json()
    const products: any[] = await res.json()
    // 🔥 Extract + deduplicate sizes SAFELY
    //const allSizes = products.flatMap((p) =>
      //Array.isArray(p.sizes) ? p.sizes : []
    //)
    const uniqueSizes = Array.from(new Set(products.flatMap((p) => p.sizes ?? []))) as string[]
    //const uniqueSizes = Array.from(new Set(allSizes))

    setSizes(uniqueSizes)
  }

  loadSizes()
}, [searchParams])




  return (
    <div className="space-y-6">
      {/* ----------------------------------------
         CATEGORY
      ----------------------------------------- */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full font-semibold"
        >
          Category
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.category ? "rotate-180" : ""
            }`}
          />
        </button>

        {expandedSections.category && (
          <div className="mt-4 space-y-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={searchParams.get("category") === cat.slug}
                  onChange={() => handleFilter("category", cat.slug)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ----------------------------------------
         PRICE
      ----------------------------------------- */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full font-semibold"
        >
          Price
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {expandedSections.price && (
          <div className="mt-4 space-y-3">
            {[
              { label: "Under ₹2,500", value: "0-2500" },
              { label: "₹2,500 - ₹5,000", value: "2500-5000" },
              { label: "₹5,000 - ₹8,000", value: "5000-8000" },
              { label: "Above ₹8,000", value: "8000+" },
            ].map((price) => (
              <label
                key={price.value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={searchParams.get("price") === price.value}
                  onChange={() => handleFilter("price", price.value)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">{price.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ----------------------------------------
         SIZE
      ----------------------------------------- */}
      {/* ----------------------------------------
   SIZE
----------------------------------------- */}
      {sizes.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection("size")}
            className="flex items-center justify-between w-full font-semibold"
          >
            Size
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                expandedSections.size ? "rotate-180" : ""
              }`}
            />
          </button>

          {expandedSections.size && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={`size-${size}`}
                  onClick={() => handleFilter("size", size)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition ${
                    searchParams.get("size") === size.toLowerCase()
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
