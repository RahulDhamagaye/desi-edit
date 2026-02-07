"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/* ------------------------------------------------------------------
   Order type MUST match MongoDB document exactly
------------------------------------------------------------------- */
type Order = {
  _id: string
  totalPrice: number
  shippingAddress: {
    email: string
  }
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error("Order fetch failed")

        const data = await res.json()
        setOrder(data)
      } catch (err) {
        console.error("Failed to load order", err)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  /* ------------------------------------------------------------------
     Loading state
  ------------------------------------------------------------------- */
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading order...</p>
        </main>
        <Footer />
      </>
    )
  }

  /* ------------------------------------------------------------------
     Order not found
  ------------------------------------------------------------------- */
  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Order not found</p>
        </main>
        <Footer />
      </>
    )
  }

  /* ------------------------------------------------------------------
     Success UI
  ------------------------------------------------------------------- */
  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>

          <h1 className="text-4xl font-serif font-bold mb-4">
            Order Confirmed!
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received.
          </p>

          <div className="bg-muted/50 rounded-lg p-8 mb-8 text-left max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-2">
              Order Total
            </p>

            <p className="text-3xl font-bold mb-6">
              ₹{(order.totalPrice ?? 0).toLocaleString()}
            </p>

            <p className="text-sm">
              A confirmation email has been sent to{" "}
              <b>{order.shippingAddress?.email}</b>
            </p>
          </div>

          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              Back to Home
            </Button>
          </Link>
          <Link href="/my-orders">
              <Button className="w-full sm:w-auto ml-4 bg-secondary hover:bg-secondary/90 mt-4 sm:mt-0">
                My Orders
              </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
