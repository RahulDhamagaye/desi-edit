"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

/* ------------------------------------------------------------------
   Order type (matches MongoDB document)
------------------------------------------------------------------- */
type Order = {
  _id: string
  totalPrice: number
  orderStatus: string
  createdAt: string
  shippingAddress: {
    email: string
  }
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders/my-orders")

        if (!res.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await res.json()
        setOrders(data)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  /* ------------------------------------------------------------------
     Loading state
  ------------------------------------------------------------------- */
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading your orders...</p>
        </main>
        <Footer />
      </>
    )
  }

  /* ------------------------------------------------------------------
     Empty state
  ------------------------------------------------------------------- */
  if (orders.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-serif font-bold mb-4">
            No Orders Yet
          </h1>
          <p className="text-muted-foreground mb-6">
            You haven’t placed any orders yet.
          </p>

          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  /* ------------------------------------------------------------------
     Orders list
  ------------------------------------------------------------------- */
  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-serif font-bold mb-8">
            My Orders
          </h1>

          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-lg p-6 flex flex-col sm:flex-row sm:justify-between gap-6"
              >
                {/* Order info */}
                <div>
                  <p className="text-sm text-muted-foreground">
                    Order ID
                  </p>
                  <p className="font-medium mb-2">
                    #{order._id}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Order Date
                  </p>
                  <p className="mb-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Email
                  </p>
                  <p>{order.shippingAddress.email}</p>
                </div>

                {/* Meta */}
                <div className="text-right">
                  <p className="text-2xl font-bold mb-1">
                    ₹{order.totalPrice.toLocaleString()}
                  </p>

                  <p className="text-sm mb-4 capitalize">
                    Status: <b>{order.orderStatus}</b>
                  </p>

                  <Link
                    href={`/my-orders/${order._id}`}
                  >
                    <Button variant="outline">
                      View Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
