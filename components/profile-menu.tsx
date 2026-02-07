"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  User,
  Package,
  Heart,
  Gift,
  LogOut,
  Phone,
} from "lucide-react"
import { useWishlist } from "@/lib/wishlist-context"

export function ProfileMenu() {
  const { data: session } = useSession()
  const { clearWishlist } = useWishlist()

  return (
    <div className="w-64 bg-white rounded-xl shadow-xl border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b">
        <p className="text-sm font-semibold">
          {session ? `Hello, ${session.user?.name}` : "Welcome"}
        </p>
        <p className="text-xs text-muted-foreground">
          {session
            ? "Manage your account & orders"
            : "To access account and manage orders"}
        </p>

        {!session && (
          <Link
            href="/auth/login"
            className="mt-3 block text-center border border-pink-500 text-pink-500 rounded-md py-2 text-sm font-medium hover:bg-pink-50 transition"
          >
            LOGIN / SIGNUP
          </Link>
        )}
      </div>

      {/* Menu Items */}
      <ul className="py-2 text-sm">
        {session && (
          <MenuItem
            href="/my-profile"
            icon={<User className="w-4 h-4" />}
            label="My Profile"
          />
        )}

        <MenuItem
          href={
            session
              ? "/my-orders"
              : "/auth/login?callbackUrl=/my-orders"
          }
          icon={<Package className="w-4 h-4" />}
          label="Orders"
        />

        <MenuItem
          href={
            session
              ? "/wishlist"
              : "/auth/login?callbackUrl=/wishlist"
          }
          icon={<Heart className="w-4 h-4" />}
          label="Wishlist"
        />

        <MenuItem
          href="/contact"
          icon={<Phone className="w-4 h-4" />}
          label="Contact Us"
        />

        <MenuItem
          href="/gift-cards"
          icon={<Gift className="w-4 h-4" />}
          label="Gift Cards"
        />
      </ul>

      {/* Logout */}
      {session && (
        <button
          onClick={() => {
            clearWishlist()
            signOut({ callbackUrl: "/" })
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      )}
    </div>
  )
}

/* ----------------------------------------
   Reusable Menu Item
----------------------------------------- */
function MenuItem({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition"
      >
        <span className="text-gray-600">{icon}</span>
        <span className="font-medium text-gray-800">
          {label}
        </span>
      </Link>
    </li>
  )
}
