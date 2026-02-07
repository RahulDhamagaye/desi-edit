import { NextResponse } from "next/server"
import { contentfulClient } from "@/lib/contentful"
import type { Product } from "@/lib/models/models"

export async function GET(request: Request) {
  try {
    // ✅ Always reliable slug extraction
    const url = new URL(request.url)
    const slug = url.pathname.split("/").pop()

    if (!slug) {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      )
    }

    const requestedSlug = slug.toLowerCase()

    const entries = await contentfulClient.getEntries({
      content_type: "product",
      limit: 20,
      "fields.slug": requestedSlug,
    })

    if (!entries.items.length) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const item: any = entries.items.find((entry: any) => {
      const entrySlug = String(entry.fields.slug || "").toLowerCase()
      return entrySlug === requestedSlug
    })

    if (!item) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const f = item.fields

    const product: Product = {
      _id: item.sys.id,
      name: f.name ?? "",
      slug: f.slug ?? "",
      description: f.description ?? "",
      category: f.category ?? "",
      price: f.price ?? 0,
      images:
        f.images?.map(
          (img: any) => `https:${img.fields.file.url}`
        ) ?? [],
      sizes: f.sizes ?? [],
      colors: f.colors ?? [],
      stockCount: f.stockCount ?? 0,
      inStock: f.inStock ?? true,
      featured: f.featured ?? false,
      rating: f.rating ?? 0,
      reviews: [],
      createdAt: new Date(item.sys.createdAt),
      updatedAt: new Date(item.sys.updatedAt),
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}
