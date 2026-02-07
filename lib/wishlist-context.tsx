"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface WishlistContextType {
  wishlist: string[] // Array of product slugs/IDs
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  syncWishlistToDb: () => Promise<void>
  loadWishlistFromDb: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wishlist")
    if (saved) setWishlist(JSON.parse(saved))
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const isInWishlist = (productId: string) => wishlist.includes(productId)
  // ✅ CLEAR WISHLIST (used on logout)

  const clearWishlist = () => {
    setWishlist([])
    localStorage.removeItem("wishlist")
  }

  /* ---------------- Sync guest → DB on login ---------------- */
  const syncWishlistToDb = async () => {
    if (wishlist.length === 0) return

    await fetch("/api/wishlist/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: wishlist }),
    })

    localStorage.removeItem("wishlist")
  }

  /* ---------------- Load DB wishlist on login ---------------- */
  const loadWishlistFromDb = async () => {
    const res = await fetch("/api/wishlist/db")
    if (!res.ok) return

    const slugs: string[] = await res.json()
    setWishlist(slugs)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist, syncWishlistToDb, loadWishlistFromDb }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider")
  return context
}

