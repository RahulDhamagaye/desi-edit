import { NextRequest, NextResponse } from "next/server"
import { contentfulClient } from "@/lib/contentful"
import type { Product } from "@/lib/models/models"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const category = searchParams.get("category") || undefined
    const subcategory = searchParams.get("subcategory") || undefined
    const query = searchParams.get("q") || undefined
    const onlySubcategories =
      searchParams.get("subcategories") === "true"

    const limit = Number(searchParams.get("limit") || 100)

    /* ----------------------------------------
       BASE CONTENTFUL QUERY
    ----------------------------------------- */
    const filters: any = {
      content_type: "product",
      limit,
    }

    /* ----------------------------------------
       CATEGORY (case-safe)
    ----------------------------------------- */
    if (category) {
      filters["fields.category[in]"] = [
        category,
        category.toLowerCase(),
        category.toUpperCase(),
        category.charAt(0).toUpperCase() + category.slice(1),
      ]
    }

    /* ----------------------------------------
       SUBCATEGORY FILTER
    ----------------------------------------- */
    if (subcategory) {
      filters["fields.subcategory"] = subcategory
    }

    /* ----------------------------------------
       SEARCH (Contentful full-text)
    ----------------------------------------- */
    if (query) {
      filters.query = query
    }

    const entries = await contentfulClient.getEntries(filters)

    /* ----------------------------------------
       SUBCATEGORY MODE (Header dropdown)
    ----------------------------------------- */
    if (onlySubcategories) {
      const subcategories = Array.from(
        new Set(
          entries.items.flatMap((item: any) => {
            const sub = item.fields.subcategory

            if (
              typeof sub !== "string" ||
              !sub.trim() ||
              sub.toLowerCase() === "subcategory"
            ) {
              return []
            }

            return [sub.trim()]
          })
        )
      )

      return NextResponse.json(subcategories)
    }

    /* ----------------------------------------
       NORMAL PRODUCT RESPONSE
    ----------------------------------------- */
    const products: Product[] = entries.items.map((item: any) => {
      const f = item.fields

      return {
        _id: item.sys.id,
        name: f.name ?? "",
        slug: f.slug ?? "",
        description: f.description ?? "",
        category: f.category ?? "",
        subcategory: f.subcategory ?? "",
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
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
