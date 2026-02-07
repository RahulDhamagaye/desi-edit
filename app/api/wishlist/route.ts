export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { contentfulClient } from "@/lib/contentful"
import type { Product } from "@/lib/models/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    /* ------------------------------------------------
       AUTH CHECK (ADDED – does NOT break UI)
    ------------------------------------------------- */
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* ------------------------------------------------
       EXISTING LOGIC (UNCHANGED)
    ------------------------------------------------- */
    const { slugs } = await req.json()

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json([])
    }

    const entries = await contentfulClient.getEntries({
      content_type: "product",
      limit: 100,
      "fields.slug[in]": slugs.join(","),
    })

    const products: Product[] = entries.items.map((item: any) => {
      const f = item.fields

      return {
        _id: item.sys.id,

        name: f.name ?? "",
        slug: f.slug ?? "",
        description: f.description ?? "",

        category: f.category ?? "uncategorized",
        price: f.price ?? 0,

        images:
          f.images?.map(
            (img: any) => `https:${img.fields.file.url}`
          ) ?? [],

        sizes: f.sizes ?? [],
        colors: f.colors ?? [],

        stockCount: f.stockCount ?? 0,
        inStock: f.inStock ?? (f.stockCount ?? 0) > 0,

        featured: f.featured ?? false,

        rating: f.rating ?? 0,
        reviews: [],

        createdAt: new Date(item.sys.createdAt),
        updatedAt: new Date(item.sys.updatedAt),
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Wishlist API error:", error)
    return new NextResponse("Internal Server Error", {
      status: 500,
    })
  }
}
