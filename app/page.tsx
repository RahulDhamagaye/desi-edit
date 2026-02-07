import type { Metadata } from "next"
import Link from "next/link"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { HeroBanner } from "@/components/hero-banner"
import { Button } from "@/components/ui/button"

import { contentfulClient } from "@/lib/contentful"
import type { Product } from "@/types/product"

export const metadata: Metadata = {
  title: "Desi Edit | Curated Luxury - Premium Women's Fashion",
  description:
    "Desi Edit - Curated Luxury. Discover our exclusive collection of premium women's clothing.",
}

export default async function Home() {
  /* ================= HERO BANNER ================= */
  const heroRes = await contentfulClient.getEntries({
    content_type: "heroBanner",
    limit: 1,
    include: 1,
  })

  const hero = heroRes.items[0]?.fields

  /* ================= CATEGORIES ================= */
  const categoryRes = await contentfulClient.getEntries({
    content_type: "category",
    order: ["fields.name"],
    include: 1,
  })

  const categories = categoryRes.items.map((item: any) => item.fields)

  /* ================= FEATURED PRODUCTS ================= */
  const productRes = await contentfulClient.getEntries({
    content_type: "product",
    "fields.featured": true,
    include: 2,
    order: ["-sys.createdAt"],
    limit: 6,
  })

  const products: Product[] = productRes.items.map((item: any) => {
    const f = item.fields
    const imageUrls =
      f.images?.map((img: any) => `https:${img.fields.file.url}`) || []

    return {
      _id: item.sys.id,
      name: f.name ?? "",
      slug: f.slug ?? "",
      description: f.description ?? "",
      price: f.discountPrice ?? f.price ?? 0,
      images: imageUrls,
      category: f.category ?? "",
      sizes: f.sizes ?? [],
      colors: f.colors ?? [],
      stockCount: f.stockCount ?? 0,
      inStock: f.inStock ?? false,
      featured: f.featured ?? false,
      rating: f.rating ?? 4.5,
      reviews: [],
      createdAt: new Date(item.sys.createdAt),
      updatedAt: new Date(item.sys.updatedAt),
    }
  })

  return (
    <>
      <Header />

      <main className="bg-background">
        {/* ========= HERO ========= */}
        <HeroBanner hero={hero} />

        {/* ========= CATEGORIES ========= */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold mb-12 text-center">
              Desi Edit's Curated Collection
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                >
                  <div className="group relative h-80 rounded-lg overflow-hidden cursor-pointer">
                    <img
                      src={`https:${cat.image.fields.file.url}`}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                      <span className="text-white text-2xl font-serif font-bold">
                        {cat.name}
                      </span>
                      <span className="text-white/80 text-sm mt-2">
                        {cat.description}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========= FEATURED PRODUCTS ========= */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-serif font-bold mb-4 text-center">
            Our Curated Selection
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Hand-picked pieces that exemplify Desi Edit's commitment to premium craftsmanship.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg" variant="outline">
                View All Collections
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
