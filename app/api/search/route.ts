import { NextRequest, NextResponse } from "next/server"
import { contentfulClient } from "@/lib/contentful"

/* -----------------------------
   Small typo tolerance helper
------------------------------ */
function scoreMatch(name: string, query: string) {
  name = name.toLowerCase()
  query = query.toLowerCase()

  if (name === query) return 100
  if (name.startsWith(query)) return 90
  if (name.includes(query)) return 70

  // token match (kurti cotton → kurti)
  const tokens = name.split(" ")
  if (tokens.some((t) => t.startsWith(query))) return 60

  // very light typo tolerance
  let mismatches = 0
  for (let i = 0; i < Math.min(name.length, query.length); i++) {
    if (name[i] !== query[i]) mismatches++
    if (mismatches > 2) break
  }
  if (mismatches <= 2) return 40

  return 0
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase()

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const entries = await contentfulClient.getEntries({
    content_type: "product",
    limit: 50,
  })

  const ranked = entries.items
    .map((item: any) => {
      const name = item.fields.name ?? ""
      const score = scoreMatch(name, q)

      if (score === 0) return null

      return {
        score,
        name,
        slug: item.fields.slug,
        price: item.fields.price ?? 0,
        image: item.fields.images?.[0]
          ? `https:${item.fields.images[0].fields.file.url}`
          : null,
      }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 6) // 🔥 TOP 6 ONLY

  return NextResponse.json(ranked)
}
