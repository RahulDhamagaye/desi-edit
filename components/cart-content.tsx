"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CartItemComponent } from "@/components/cart-item"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/models/models"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

/* ----------------------------------------
   Types
----------------------------------------- */
type CartProduct = Product & {
  cartKey: string
  quantity: number
  size?: string
  color?: string
}

export function CartContent() {
  const { items, removeItem, updateQuantity } = useCart()
  const [products, setProducts] = useState<CartProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { status } = useSession()
  const router = useRouter()

  /* ----------------------------------------
     Load products for cart items
     (variant-safe)
  ----------------------------------------- */
  useEffect(() => {
    let mounted = true

    async function loadCartProducts() {
      if (items.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)

      // Fetch each product only once
      const uniqueProductIds = Array.from(
        new Set(items.map((i) => i.productId))
      )

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: uniqueProductIds }),
      })

      if (!res.ok) {
        if (mounted) {
          setProducts([])
          setLoading(false)
        }
        return
      }

      const data: Product[] = await res.json()

      // Expand products PER CART ITEM (variant-aware)
      const merged: CartProduct[] = items
        .map((cartItem) => {
          const product = data.find(
            (p) => p.slug === cartItem.productId
          )

          if (!product) return null

          return {
            ...product,
            cartKey: cartItem.cartKey,
            quantity: cartItem.quantity,
            size: cartItem.size,
            color: cartItem.color,
          }
        })
        .filter(Boolean) as CartProduct[]

      if (mounted) {
        setProducts(merged)
        setLoading(false)
      }
    }

    loadCartProducts()
    return () => {
      mounted = false
    }
  }, [items])

  /* ----------------------------------------
     Price calculations
  ----------------------------------------- */
  const subtotal = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    )
  }, [products])

  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax

  /* ----------------------------------------
     Empty cart
  ----------------------------------------- */
  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground mb-6">
          Your cart is empty
        </p>
        <Link href="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  /* ----------------------------------------
     Loading
  ----------------------------------------- */
  if (loading) {
    return (
      <p className="text-muted-foreground">
        Loading cart…
      </p>
    )
  }

  /* ----------------------------------------
     Cart UI
  ----------------------------------------- */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart items */}
      <div className="lg:col-span-2 bg-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          Order Summary
        </h2>

        {products.map((product) => (
          <CartItemComponent
            key={product.cartKey} // ✅ UNIQUE + STABLE
            item={{
              cartKey: product.cartKey,
              productId: product.slug,
              quantity: product.quantity,
              size: product.size,
              color: product.color,
            }}
            name={product.name}
            image={product.images[0]}
            price={product.price}
            onRemove={removeItem}
            onQuantityChange={updateQuantity}
          />
        ))}
      </div>

      {/* Order total */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-lg p-6 sticky top-4">
          <h2 className="text-xl font-semibold mb-6">
            Order Total
          </h2>

          <div className="space-y-4 mb-6 pb-6 border-b">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax (18%)</span>
              <span>₹{tax}</span>
            </div>
          </div>

          <div className="flex justify-between font-semibold text-lg mb-6">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* ✅ AUTH-AWARE CHECKOUT */}
          <Button
            className="w-full h-12"
            onClick={() => {
              if (status !== "authenticated") {
                signIn(undefined, {
                  callbackUrl: "/checkout",
                })
                return
              }

              router.push("/checkout")
            }}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
