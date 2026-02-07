"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { LogOut, User, Package, Heart } from "lucide-react"
import { usePathname } from "next/navigation"

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        console.error("Failed to load user data")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="bg-background min-h-screen">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <p className="text-lg text-muted-foreground mb-6">Please sign in to view your account</p>
            <Link href={pathname === "/"
              ? "/auth/login" : `/auth/login?callbackUrl=${encodeURIComponent(pathname)}`}>
              <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">My Account</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Account Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Profile Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Link href="/account/profile">
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <User className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Orders Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Orders</h3>
              </div>
              <p className="text-3xl font-bold mb-4">0</p>
              <Link href="/account/orders">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Orders
                </Button>
              </Link>
            </div>

            {/* Wishlist Card */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold">Wishlist</h3>
              </div>
              <p className="text-3xl font-bold mb-4">0</p>
              <Link href="/account/wishlist">
                <Button variant="outline" className="w-full bg-transparent">
                  View Wishlist
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-2xl font-semibold mb-6">Recent Orders</h2>
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Link href="/shop">
                <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
