import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { OrganizationSchema } from "@/components/schema-org"
//import { CartProvider } from "@/lib/cart-context"
//import { WishlistProvider } from "@/lib/wishlist-context"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import Script from "next/script"
//import { SessionProvider } from "next-auth/react"
import Providers from "@/providers"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })
const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: "Desi Edit | Curated Luxury Women's Fashion",
  description:
    "Desi Edit - Curated Luxury. Discover elegant women's clothing collection featuring premium kurtis, sarees, and suits. Handpicked pieces for the modern South Asian woman.",
  keywords:
    "Desi Edit, Curated Luxury, women's fashion, kurtis, sarees, suits, South Asian clothing, ethnic wear",
  openGraph: {
    title: "Desi Edit | Curated Luxury",
    description:
      "Discover elegant women's clothing collection - Desi Edit's premium South Asian fashion.",
    type: "website",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `}
        </Script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#35582f" />
        <link rel="canonical" href="https://desiedit.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@desiedit" />
        <OrganizationSchema />
      </head>

      <body className="font-sans antialiased">
        <Providers>
          <GoogleAnalytics />
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Providers>

        <Analytics />
      </body>
    </html>
  )
}
