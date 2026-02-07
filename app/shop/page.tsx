import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Filters } from "@/components/filters"
import { SortDropdown } from "@/components/sort-dropdown"
import type { Metadata } from "next"
import type { Product } from "@/lib/models/models"
import { contentfulClient } from "@/lib/contentful"

export const metadata: Metadata = {
  title: "Shop Women's Fashion | Desi Edit",
  description:
    "Browse our complete collection of premium women's clothing - kurtis, sarees, and suits",
}

/* ----------------------------------------
   Search helper (typo + plural tolerant)
----------------------------------------- */
function normalize(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

function isSearchMatch(query: string, target: string) {
  const q = normalize(query)
  const t = normalize(target)

  if (!q) return true

  // exact / contains
  if (t.includes(q)) return true

  // plural tolerance (saree <-> sarees, kurti <-> kurtis)
  if (q.endsWith("s") && t.includes(q.slice(0, -1))) return true
  if (t.endsWith("s") && q.includes(t.slice(0, -1))) return true

  return false
}


/* ----------------------------------------
   Fetch ALL products
----------------------------------------- */
async function getProducts(): Promise<Product[]> {
  const entries = await contentfulClient.getEntries({
    content_type: "product",
    limit: 200,
  })

  return entries.items.map((item: any): Product => {
    const f = item.fields

    return {
      _id: item.sys.id,
      name: f.name ?? "",
      slug: f.slug ?? "",
      description: f.description ?? "",
      category: (f.category ?? "").toLowerCase(),
      subcategory: (f.subcategory ?? "").toLowerCase(),
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
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  const category =
    (Array.isArray(params.category)
      ? params.category[0]
      : params.category || "").toLowerCase()

  const subcategory =
    (Array.isArray(params.subcategory)
      ? params.subcategory[0]
      : params.subcategory || "").toLowerCase()

  const searchQuery =
    (Array.isArray(params.q)
      ? params.q[0]
      : params.q || "").toLowerCase()

  const sort =
    Array.isArray(params.sort)
      ? params.sort[0]
      : params.sort || "newest"

  /* Price */
  const priceParam = Array.isArray(params.price)
    ? params.price[0]
    : params.price || ""

  let minPrice = 0
  let maxPrice = Infinity

  if (priceParam.includes("+")) {
    minPrice = Number(priceParam.replace("+", "")) || 0
  } else if (priceParam.includes("-")) {
    const [min, max] = priceParam.split("-")
    minPrice = Number(min) || 0
    maxPrice = Number(max) || Infinity
  }

  const selectedSizes = Array.isArray(params.size)
    ? params.size
    : params.size
    ? [params.size]
    : []

  /* ----------------------------------------
     Fetch & filter
  ----------------------------------------- */
  const products = await getProducts()

  const filtered = products.filter((p) => {
    if (category && p.category !== category) return false
    if (subcategory && p.subcategory !== subcategory) return false

    if (searchQuery && !isSearchMatch(searchQuery, p.name))
      return false


    if (p.price < minPrice || p.price > maxPrice) return false

    if (
      selectedSizes.length > 0 &&
      !p.sizes.some(
        (s) => selectedSizes.includes(s.toLowerCase())
      )
    )
      return false


    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  return (
    <>
      <Header />

      <main className="bg-background">
        <section className="bg-muted/50 border-b py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold mb-2">
              Shop Women's Fashion
            </h1>
            <p className="text-muted-foreground">
              {sorted.length} products
              {category && ` in ${category}`}
              {subcategory && ` / ${subcategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Filters />
            </div>

            <div className="lg:col-span-3">
              <div className="flex justify-between mb-8">
                <p className="text-sm text-muted-foreground">
                  Showing {sorted.length} products
                </p>
                <SortDropdown />
              </div>

              {sorted.length === 0 ? (
                <div className="py-24 text-center text-muted-foreground">
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {sorted.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
