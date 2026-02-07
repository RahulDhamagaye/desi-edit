"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useWishlist } from "@/lib/wishlist-context"
import type { Product } from "@/lib/models/models"
import Link from "next/link"
import { HeartOff } from "lucide-react"

/* ----------------------------------------
   Wishlist Page
----------------------------------------- */
export default function WishlistPage() {
  const { wishlist } = useWishlist()
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadWishlist() {
      setLoading(true)

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: wishlist }),
      })

      const data: Product[] = await res.json()

      if (mounted) {
        setWishlistProducts(data)
        setLoading(false)
      }
    }

    loadWishlist()

    return () => {
      mounted = false
    }
  }, [wishlist])

  return (
    <>
      <Header />

      <main className="flex flex-col min-h-[80vh] bg-background">
        {/* Header Section */}
        <section className="bg-muted/30 border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4 text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold mb-1">
              My Wishlist
            </h1>
            <p className="text-sm text-muted-foreground">
              {wishlistProducts.length}{" "}
              {wishlistProducts.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <p className="text-muted-foreground text-sm">
              Loading wishlist…
            </p>
          ) : wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full self-start">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <HeartOff className="w-10 h-10 text-muted-foreground/60" />
              </div>

              <h2 className="text-2xl font-serif font-bold mb-3 text-foreground">
                Your wishlist is empty
              </h2>

              <p className="text-muted-foreground max-w-xs mb-10 text-sm leading-relaxed">
                Save your favorite pieces to keep track of what you love.
                They'll appear here so you can find them later.
              </p>

              <Link
                href="/shop"
                className="px-8 py-3 bg-[#2D2D2D] text-white rounded-full font-medium hover:bg-black transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
