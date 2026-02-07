"use client"

import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/models/models"
import { useSearchPreview } from "@/lib/search-preview-context"

export function ClientSearchGrid({
  serverProducts,
}: {
  serverProducts: Product[]
}) {
  const { query, results } = useSearchPreview()

  // If user is typing → show live results
  const productsToShow =
    query.trim().length > 0 ? results : serverProducts

  if (productsToShow.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-4">
          No products found
        </p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {productsToShow.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
        />
      ))}
    </div>
  )
}
