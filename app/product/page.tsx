"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useWishlist } from "@/lib/wishlist-context"
import type { Product } from "@/lib/models/models"
import Link from "next/link"

export default function WishlistPage() {
  const { wishlist } = useWishlist()
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  /* ----------------------------------------
     Fetch wishlist products from Contentful
  ----------------------------------------- */
  useEffect(() => {
    let mounted = true

    async function loadWishlistProducts() {
      if (wishlist.length === 0) {
        setWishlistProducts([])
        setLoading(false)
        return
      }

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

    loadWishlistProducts()

    return () => {
      mounted = false
    }
  }, [wishlist])

  return (
    <>
      <Header />

      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-muted/50 border-b border-border py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold mb-2">
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {wishlistProducts.length}{" "}
              {wishlistProducts.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <p className="text-muted-foreground">
              Loading wishlist…
            </p>
          ) : wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {wishlistProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-medium mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-8">
                Save your favorite items to keep track of them.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition"
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
