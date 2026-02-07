"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {ShoppingCart, Search, Menu, X, Heart, ChevronDown, User } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
//import { useSearchPreview } from "@/lib/search-preview-context"
//import type { Product } from "@/lib/db/models"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { ProfileMenu } from "@/components/profile-menu"


/* ----------------------------------------
   Debounce Hook (SAFE & REUSABLE)
----------------------------------------- */
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

function isTypoMatch(query: string, target: string) {
  const q = normalize(query)
  const t = normalize(target)

  // exact or partial match
  if (t.includes(q) || q.includes(t)) return true

  // plural tolerance (VERY IMPORTANT ORDER)
  if (q.endsWith("s") && t.includes(q.slice(0, -1))) return true
  if (t.endsWith("s") && q.includes(t.slice(0, -1))) return true

  // 1–2 character typo tolerance
  if (Math.abs(q.length - t.length) <= 2) {
    let matches = 0
    for (const c of q) {
      if (t.includes(c)) matches++
    }
    return matches >= Math.min(3, q.length - 1)
  }

  return false
}




/* ----------------------------------------
   Types
----------------------------------------- */
type HeaderCategory = {
  id: string
  name: string
  slug: string
  subcategories: string[]
}

type SearchSuggestion = {
  name: string
  slug: string
  image?: string | null
  price: number
}

export function Header() {
  const { items } = useCart()
  const { wishlist } = useWishlist()
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLoggedIn = status === "authenticated"

  const [categories, setCategories] = useState<HeaderCategory[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  // ✅ ADDED (profile dropdown state)
  const [open, setOpen] = useState(false)
  

  /* -------------------------------
     Search state
  -------------------------------- */
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search.trim(), 300)


  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const wishlistCount = session ? wishlist.length : 0
  const { clearWishlist } = useWishlist()
  const { syncWishlistToDb, loadWishlistFromDb } = useWishlist()
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isAuthPage = pathname.startsWith("/auth")

  //const {setQuery, setResults, setLoading: setPreviewLoading, clear} = useSearchPreview()

  /* ----------------------------------------
     Load categories + subcategories
  ----------------------------------------- */
  useEffect(() => {
    let mounted = true

    async function loadCategories() {
      const res = await fetch("/api/categories", { cache: "no-store" })
      if (!res.ok) return

      const cats = await res.json()

      const enriched: HeaderCategory[] = await Promise.all(
        cats.map(async (cat: any) => {
          const subRes = await fetch(
            `/api/products?category=${cat.slug}&subcategories=true`,
            { cache: "no-store" }
          )

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            subcategories: subRes.ok ? await subRes.json() : [],
          }
        })
      )

      if (mounted) setCategories(enriched)
    }

    loadCategories()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      syncWishlistToDb().then(loadWishlistFromDb)
    }
  }, [session])

  /* ----------------------------------------
     Sync input FROM URL (page load / nav)
  ----------------------------------------- */
  useEffect(() => {
    setSearch(searchParams.get("q") ?? "")
  }, [searchParams])

  // close profile dropdown on outsideclick
  useEffect(() => {
    function close(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[aria-label='Profile']")) {
        setOpen(false)
      }
    }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  /* ----------------------------------------
     Instant search while typing (NO URL)
  ----------------------------------------- */
  /* ----------------------------------------
   Instant search while typing (NO URL)
   + relevance filtering (NO suits for kurti)
----------------------------------------- */
useEffect(() => {
  if (!debouncedSearch.trim()) {
    setSuggestions([])
    return
  }

  const q = debouncedSearch.trim().toLowerCase()
  const qPlural = q.endsWith("s") ? q.slice(0, -1) : `${q}s`

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      let suggestData: SearchSuggestion[] = []

        // 1️⃣ Primary search
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedSearch.trim())}`
        )
        suggestData = await res.json()

        // 2️⃣ Fallback: plural → singular (ONLY if empty)
        if (suggestData.length === 0 && debouncedSearch.endsWith("s")) {
          const singular = debouncedSearch.slice(0, -1)

          const fallbackRes = await fetch(
            `/api/search?q=${encodeURIComponent(singular)}`
          )
          suggestData = await fallbackRes.json()
        }


      const rankedSuggestions = suggestData
        .filter((item) =>
          isTypoMatch(debouncedSearch, item.name) ||
          isTypoMatch(
            debouncedSearch.endsWith("s")
              ? debouncedSearch.slice(0, -1)
              : `${debouncedSearch}s`,
            item.name
          )
        )
        .slice(0, 6)

      setSuggestions(rankedSuggestions)
      setActiveIndex(-1)


    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  fetchSuggestions()
}, [debouncedSearch])




  /* ----------------------------------------
     Commit search (Enter / 🔍 click)
  ----------------------------------------- */
  const submitSearch = () => {
  // ❌ DO NOT reuse existing params
  const params = new URLSearchParams()

  if (search.trim()) {
    params.set("q", search.trim())
  }

  setSuggestions([])
  setIsCategoryOpen(false)

  router.push(`/shop?${params.toString()}`)
}

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 w-32">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Desi Edit Logo"
              width={120}
              height={60}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="w-full max-w-xl relative">
            <div className="flex items-center h-10 border border-gray-300 rounded-md">
              {/* Category dropdown */}
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-1 h-full px-4 bg-gray-100 text-xs font-bold text-gray-600 border-r"
              >
                All
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    isCategoryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setActiveIndex((prev) =>
                      Math.min(prev + 1, suggestions.length - 1)
                    )
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setActiveIndex((prev) =>
                      Math.max(prev - 1, 0)
                    )
                  }

                  if (e.key === "Enter") {
                    if (activeIndex >= 0 && suggestions[activeIndex]) {
                      router.push(`/product/${suggestions[activeIndex].slug}`)
                      setSuggestions([])
                    } else {
                      submitSearch()
                    }
                  }
                }}

                placeholder="Search for Kurtis, Sarees..."
                className="flex-1 px-4 text-sm focus:outline-none"
              />

              <button
                onClick={submitSearch}
                className="px-4 text-gray-500"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Category dropdown panel */}
            {isCategoryOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCategoryOpen(false)}
                />
                <div className="absolute top-full left-0 w-56 bg-white border shadow-xl mt-1 z-50 rounded-md overflow-hidden">
                  {categories.map((cat) => (
                    <div key={cat.id} className="border-b last:border-0">
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="block px-4 py-2 text-sm font-medium hover:bg-gray-50"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        {cat.name}
                      </Link>

                      {cat.subcategories.length > 0 && (
                        <div className="pl-4 pb-2">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub}
                              href={`/shop?category=${cat.slug}&subcategory=${encodeURIComponent(
                                sub
                              )}`}
                              className="block px-4 py-1 text-xs text-gray-600 hover:text-black"
                              onClick={() => setIsCategoryOpen(false)}
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Instant search suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border shadow-lg z-50">
                {suggestions.map((item, index) => (
                  <Link
                    key={item.slug}
                    href={`/product/${item.slug}`}
                    className={`flex items-center gap-3 p-3 hover:bg-gray-50 ${
                      index === activeIndex ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setSuggestions([])}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
                {loading && (
                  <p className="p-3 text-sm text-gray-500">Searching…</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6 w-48 justify-end">
          <div className="relative">
            {/* PROFILE ICON (same size as wishlist/cart) */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Profile"
              className="relative"
            >
              <User className="w-6 h-6 text-foreground" />
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 top-full mt-3 z-50">
                <ProfileMenu />
              </div>
            )}
          </div>

          <Link href="/wishlist" className="relative">
            <Heart />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="hidden md:block border-t">
        <div className="max-w-[1440px] mx-auto px-4 py-2 flex gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="text-xs font-bold uppercase text-gray-500 hover:text-black"
            >
              {cat.name}
            </Link>
          ))}
          <span className="ml-auto text-sm font-serif italic text-gray-400">
            Curated Luxury for the Modern Woman
          </span>
        </div>
      </div>
    </header>
  )
}
