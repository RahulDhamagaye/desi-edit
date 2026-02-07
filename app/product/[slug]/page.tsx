"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ImageGallery } from "@/components/image-gallery"
import { ProductOptions } from "@/components/product-options"
import { ReviewsSection } from "@/components/reviews-section"
import { ProductCard } from "@/components/product-card"
import { AddToCartModal } from "@/components/add-to-cart-modal"
import type { Product } from "@/lib/models/models"
import { useCart } from "@/lib/cart-context"

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { addItem } = useCart()

  const [slug, setSlug] = useState<string>("")
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastAddedConfig, setLastAddedConfig] = useState({
    color: "",
    size: "",
  })

  /* ----------------------------------------
     Unwrap params SAFELY
  ----------------------------------------- */
  useEffect(() => {
    let mounted = true

    params.then(({ slug }) => {
      if (mounted) setSlug(slug)
    })

    return () => {
      mounted = false
    }
  }, [params])

  /* ----------------------------------------
     Fetch PRODUCT (NULL SAFE)
  ----------------------------------------- */
  useEffect(() => {
    if (!slug) return

    let mounted = true
    setLoading(true)
    setRelatedProducts([])

    async function fetchProduct() {
      const res = await fetch(`/api/products/${slug}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        if (mounted) {
          setProduct(null)
          setLoading(false)
        }
        return
      }

      const data: Product = await res.json()

      if (mounted) {
        setProduct(data)
        setLoading(false)
      }
    }

    fetchProduct()

    return () => {
      mounted = false
    }
  }, [slug])

  /* ----------------------------------------
     Fetch RELATED products (NULL SAFE)
  ----------------------------------------- */
  useEffect(() => {
    if (!product) return

    const category = product.category
    const currentSlug = product.slug

    if (!category || !currentSlug) return

    let mounted = true

    async function fetchRelated() {
      const res = await fetch(
        `/api/products?category=${encodeURIComponent(
          category.toLowerCase()
        )}`,
        { cache: "no-store" }
      )

      if (!res.ok) return

      const data: Product[] = await res.json()

      if (mounted) {
        setRelatedProducts(
          data.filter((p) => p.slug !== currentSlug).slice(0, 4)
        )
      }
    }

    fetchRelated()

    return () => {
      mounted = false
    }
  }, [product])

  /* ----------------------------------------
     Loading / Not Found
  ----------------------------------------- */
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
        <Footer />
      </>
    )
  }

  /* ----------------------------------------
     Add to cart
  ----------------------------------------- */
  const handleAddToCart = (
    size: string,
    color: string,
    quantity: number
  ) => {
    const cartKey = `${product.slug}_${size}_${color}`
    addItem({
      cartKey,
      productId: product.slug,
      size,
      color,
      quantity,
    })

    setLastAddedConfig({ size, color })
    setIsModalOpen(true)
  }

  return (
    <>
      <Header />

      <main className="bg-background">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-muted-foreground border-b border-border">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="capitalize">{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">
            {product.name}
          </span>
        </div>

        {/* Product */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <ImageGallery
              images={product.images}
              productName={product.name}
            />

            <ProductOptions
              product={product}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Reviews */}
          <div className="border-t border-border pt-12">
            <ReviewsSection
              reviews={product.reviews}
              rating={product.rating}
            />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-16 border-t border-border">
              <h2 className="text-3xl font-serif font-bold mb-12">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          name: product.name,
          image: product.images[0],
          color: lastAddedConfig.color,
        }}
      />
    </>
  )
}
