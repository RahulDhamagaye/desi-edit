// app/api/categories/route.ts
import { NextResponse } from "next/server"
import { contentfulClient } from "@/lib/contentful"

export async function GET() {
  try {
    const entries = await contentfulClient.getEntries({
      content_type: "category",
      order: ["fields.name"],
    })

    const categories = entries.items.map((item: any) => ({
      id: item.sys.id,
      name: item.fields.name ?? "",
      slug: item.fields.slug ?? "",
      description: item.fields.description ?? "",
      image: item.fields.image
        ? `https:${item.fields.image.fields.file.url}`
        : null,
    }))

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
