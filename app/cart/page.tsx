import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartContent } from "@/components/cart-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shopping Cart | Desi Edit",
  description: "Review your shopping cart and proceed to checkout",
}

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-bold mb-12">Shopping Cart</h1>
          <CartContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
