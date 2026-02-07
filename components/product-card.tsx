"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import type { Product } from "@/lib/models/models"
import { useWishlist } from "@/lib/wishlist-context" 

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist() // Use the wishlist hook

  const isFavorited = isInWishlist(product.slug) // Check if this product is liked
  const displayPrice = product.discountPrice || product.price
  const handleWishlistClick = (e: React.MouseEvent) => {

    e.preventDefault() // Prevents the Link from triggering

    e.stopPropagation() // Prevents bubbling to the Link

    toggleWishlist(product.slug)

  }

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="group cursor-pointer relative">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg bg-muted h-80 mb-4">
          <Image
            src={product.images[0] || "/placeholder.svg?height=320&width=280"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {product.discountPrice && (
            <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
              Sale
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
            </div>
            <button className="p-1.5 hover:bg-muted rounded-lg transition group/heart" 
              onClick={handleWishlistClick}
              aria-label="Add to wishlist"
            >
              <Heart 
                className={`w-5 h-5 transition-colors ${
                  isFavorited 
                    ? "fill-red-500 text-red-500" 
                    : "text-muted-foreground group-hover/heart:text-foreground"
                }`} 
              />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">₹{displayPrice.toLocaleString()}</span>
            {product.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.rating) ? "text-accent" : "text-muted"}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews.length})</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
