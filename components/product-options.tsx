"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Share2 } from "lucide-react"
import type { Product } from "@/lib/models/models"

interface ProductOptionsProps {
  product: Product
  onAddToCart: (size: string, color: string, quantity: number) => void
}

export function ProductOptions({ product, onAddToCart }: ProductOptionsProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  // ✅ Detect if product actually has sizes (important fix)
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0

  const displayPrice = product.discountPrice || product.price
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert("Please select color")
      return
    }

    // ✅ Validate size ONLY if product has sizes
    if (hasSizes && !selectedSize) {
      alert("Please select size")
      return
    }

    onAddToCart(hasSizes ? selectedSize : "", selectedColor, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Title & Rating */}
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.rating) ? "text-accent" : "text-muted"}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviews.length} reviews)
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold">₹{displayPrice.toLocaleString()}</span>
          {discount > 0 && (
            <>
              <span className="text-lg line-through text-muted-foreground">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                Save {discount}%
              </span>
            </>
          )}
        </div>
        <p className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-destructive"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </p>
      </div>

      {/* Description */}
      <p className="text-muted-foreground">
        {product.longDescription || product.description}
      </p>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
        {product.material && (
          <div>
            <p className="text-sm font-semibold mb-1">Material</p>
            <p className="text-sm text-muted-foreground">{product.material}</p>
          </div>
        )}
        {product.care && (
          <div>
            <p className="text-sm font-semibold mb-1">Care</p>
            <p className="text-sm text-muted-foreground">{product.care}</p>
          </div>
        )}
      </div>

      {/* Color Selection */}
      <div>
        <label className="text-sm font-semibold mb-3 block">
          Color: {selectedColor && <span className="text-primary">{selectedColor}</span>}
        </label>
        <div className="flex gap-3">
          {product.colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                selectedColor === color
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-foreground"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Size Selection (only if sizes exist) */}
      {hasSizes && (
        <div>
          <label className="text-sm font-semibold mb-3 block">
            Size: {selectedSize && <span className="text-primary">{selectedSize}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="text-sm font-semibold mb-3 block">Quantity</label>
        <div className="flex items-center gap-4 border border-border rounded-lg w-fit">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-muted transition"
          >
            −
          </button>
          <span className="font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 hover:bg-muted transition"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-primary hover:bg-primary/90 h-12 text-base"
        >
          {isAdded ? "Added to Cart!" : "Add to Cart"}
        </Button>
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-muted transition">
            <Heart className="w-5 h-5" />
            <span className="font-medium">Save</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-muted transition">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
