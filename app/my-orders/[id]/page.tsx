"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
  color?: string | null
  size?: string | null
}

type Order = {
  _id: string
  items: OrderItem[]
  totalPrice: number
  orderStatus: string
  createdAt: string
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) throw new Error("Failed to fetch order")

        const data = await res.json()
        setOrder(data)
      } catch {
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          Loading order details...
        </main>
        <Footer />
      </>
    )
  }

  /* ---------------- Not Found ---------------- */
  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center">
          <p className="mb-4">Order not found</p>
          <Button onClick={() => router.push("/my-orders")}>
            Back to My Orders
          </Button>
        </main>
        <Footer />
      </>
    )
  }

  /* ---------------- Page ---------------- */
  return (
    <>
      <Header />
      <main className="min-h-screen max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-serif font-bold">
            Order Details
          </h1>
          <Button
            variant="outline"
            onClick={() => router.push("/my-orders")}
          >
            Back to My Orders
          </Button>
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 mb-6">
          <p className="text-sm text-muted-foreground">
            Order ID
          </p>
          <p className="font-medium mb-2">{order._id}</p>

          <p className="text-sm">
            Status: <b>{order.orderStatus}</b>
          </p>

          <p className="text-sm">
            Placed on:{" "}
            {new Date(order.createdAt).toDateString()}
          </p>
        </div>

        {/* Items */}
        <div className="border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Items
          </h2>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="font-medium">{item.color ? `Color: ${item.color}` : ''}</p>
                  <p className="font-medium">{item.size ? `Size: ${item.size}` : ''}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-lg mt-6">
            <span>Total</span>
            <span>₹{order.totalPrice}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Shipping Address
          </h2>

          <p>
            {order.shippingAddress.firstName}{" "}
            {order.shippingAddress.lastName}
          </p>
          <p>{order.shippingAddress.street}</p>
          <p>
            {order.shippingAddress.city},{" "}
            {order.shippingAddress.state}{" "}
            {order.shippingAddress.zipCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p className="mt-2">
            📞 {order.shippingAddress.phoneNumber}
          </p>
          <p>✉️ {order.shippingAddress.email}</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
