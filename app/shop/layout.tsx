import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop | Desi Edit - Premium South Asian Fashion",
  description:
    "Browse our complete collection of traditional and contemporary South Asian clothing. Kurtis, sarees, suits, and more.",
  keywords: "shop, buy desi fashion, Indian clothing, South Asian wear, traditional fashion online",
  openGraph: {
    title: "Shop | Desi Edit",
    description: "Browse our complete collection of premium South Asian fashion",
    type: "website",
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
