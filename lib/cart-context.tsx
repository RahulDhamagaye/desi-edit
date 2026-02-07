"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { CartItem } from "@/lib/models/models"

/* ----------------------------------------
   Types
----------------------------------------- */
export type CartItemWithKey = CartItem & {
  cartKey: string
}

interface CartContextType {
  items: CartItemWithKey[]
  addItem: (item: CartItem) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/* ----------------------------------------
   Helpers
----------------------------------------- */
const makeCartKey = (item: CartItem) =>
  `${item.productId}-${item.size ?? "na"}-${item.color ?? "na"}`

/* ----------------------------------------
   Provider
----------------------------------------- */
export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = useState<CartItemWithKey[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  /* Load cart from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        console.error("Failed to parse cart from localStorage")
      }
    }
    setIsLoaded(true)
  }, [])

  /* Persist cart */
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  /* ----------------------------------------
     Actions
  ----------------------------------------- */
  const addItem = (newItem: CartItem) => {
    setItems((prev): CartItemWithKey[] => {
      const cartKey = makeCartKey(newItem)

      const existing = prev.find(
        (item) => item.cartKey === cartKey
      )

      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity: item.quantity + (newItem.quantity || 1),
              }
            : item
        )
      }

      const newCartItem: CartItemWithKey = {
        ...newItem,
        cartKey,
      }

      return [...prev, newCartItem]
    })
  }

  const removeItem = (cartKey: string) => {
    setItems((prev): CartItemWithKey[] =>
      prev.filter((item) => item.cartKey !== cartKey)
    )
  }

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartKey)
      return
    }

    setItems((prev): CartItemWithKey[] =>
      prev.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total: 0, // calculated in CartContent
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/* ----------------------------------------
   Hook
----------------------------------------- */
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider")
  }
  return ctx
}
