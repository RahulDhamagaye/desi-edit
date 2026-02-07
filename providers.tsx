"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <WishlistProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </WishlistProvider>
    </SessionProvider>
  )
}
