"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import type { Product } from "@/lib/models/models"

type CheckoutProduct = Product & {
  quantity: number
  size?: string | null
  color?: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()

  /* ----------------------------------------
     Local state
  ----------------------------------------- */
  const [products, setProducts] = useState<CheckoutProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  /* ----------------------------------------
     Fetch product prices (SERVER SOURCE OF TRUTH)
  ----------------------------------------- */
  useEffect(() => {
    let mounted = true

    async function loadCheckoutProducts() {
      if (items.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)

      const productIds = items.map((item) => item.productId)

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      })

      const data: Product[] = await res.json()

      const merged: CheckoutProduct[] = data.map((product) => {
        const cartItem = items.find(
          (item) => item.productId === product.slug
        )

        return {
          ...product,
          quantity: cartItem?.quantity ?? 1,
          size: cartItem?.size ?? null,
          color: cartItem?.color ?? null,
        }
      })

      if (mounted) {
        setProducts(merged)
        setLoading(false)
      }
    }

    loadCheckoutProducts()
    return () => {
      mounted = false
    }
  }, [items])

  /* ----------------------------------------
     Price calculations (DISPLAY ONLY)
  ----------------------------------------- */
  const subtotal = useMemo(() => {
    return products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
  }, [products])

  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax

  /* ----------------------------------------
     Form handler
  ----------------------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* ----------------------------------------
     PLACE ORDER (SERVER DOES EVERYTHING)
  ----------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          shippingAddress: formData,
          items: products.map((p) => ({
            productId: p.slug,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            size: p.size ?? null,   // ✅ optional (sarees safe)
            color: p.color ?? null, // ✅ optional
          })),
        }),
      })

      if (!res.ok) {
        throw new Error("Order failed")
      }

      const data = await res.json()

      // ✅ Clear cart AFTER order is created
      clearCart()

      // ✅ Redirect to confirmation page
      router.push(`/order-confirmation?orderId=${data.orderId}`)
    } catch (err) {
      console.error(err)
      alert("Something went wrong while placing the order.")
      setIsProcessing(false)
    }
  }

  /* ----------------------------------------
     Empty cart
  ----------------------------------------- */
  if (!loading && items.length === 0) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <p className="text-lg text-muted-foreground mb-6">
              Your cart is empty
            </p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  /* ----------------------------------------
     Checkout UI (UNCHANGED)
  ----------------------------------------- */
  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-bold mb-12">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Shipping Address
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="px-4 py-3 border rounded-lg" />
                  <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="px-4 py-3 border rounded-lg" />
                </div>

                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg mb-4" />
                <input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg mb-4" />
                <input name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg mb-4" />

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="px-4 py-3 border rounded-lg" />
                  <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required className="px-4 py-3 border rounded-lg" />
                </div>

                <input name="zipCode" placeholder="Zip Code" value={formData.zipCode} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg mb-4" />

                <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                  <option>India</option>
                  <option>USA</option>
                  <option>UK</option>
                  <option>Canada</option>
                </select>
              </div>

              <div className="bg-card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Payment Method
                </h2>
                <p className="text-muted-foreground">
                  Payment gateway integration coming soon
                </p>
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full h-12">
                {isProcessing ? "Processing..." : "Complete Order"}
              </Button>
            </form>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  {products.map((item) => (
                    <div key={item.slug} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between font-semibold text-lg mt-6 pt-6 border-t">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
