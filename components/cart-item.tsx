"use client"

import Image from "next/image"
import { X, Plus, Minus } from "lucide-react"
import type { CartItem } from "@/lib/models/models"

interface CartItemComponentProps {
  item: CartItem & {
    cartKey: string
  }

  /** Contentful-driven display data */
  name: string
  image: string

  /** Cart actions (cartKey based) */
  onRemove: (cartKey: string) => void
  onQuantityChange: (cartKey: string, quantity: number) => void

  /** Unit price from Contentful */
  price: number
}

export function CartItemComponent({
  item,
  name,
  image,
  price,
  onRemove,
  onQuantityChange,
}: CartItemComponentProps) {
  return (
    <div className="flex gap-4 py-6 border-b border-border last:border-0">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {item.color && `Color: ${item.color}`}
              {item.color && item.size && " • "}
              {item.size && `Size: ${item.size}`}
            </p>
          </div>

          <button
            onClick={() => onRemove(item.cartKey)}
            className="p-1 hover:bg-muted rounded-lg transition"
            aria-label="Remove item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Price & Quantity */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            ₹{(price * item.quantity).toLocaleString()}
          </span>

          <div className="flex items-center gap-2 border border-border rounded-lg">
            <button
              onClick={() =>
                onQuantityChange(item.cartKey, item.quantity - 1)
              }
              className="p-1 hover:bg-muted transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="px-2 text-sm font-medium">
              {item.quantity}
            </span>

            <button
              onClick={() =>
                onQuantityChange(item.cartKey, item.quantity + 1)
              }
              className="p-1 hover:bg-muted transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
