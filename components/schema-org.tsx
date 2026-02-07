export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = "INR",
  rating,
  reviewCount,
  availability,
}: {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  rating: number
  reviewCount: number
  availability: "InStock" | "OutOfStock"
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Desi Edit",
    description: "Premium South Asian fashion",
    url: "https://desiedit.com",
    logo: "https://desiedit.com/logo.png",
    sameAs: [
      "https://www.facebook.com/desiedit",
      "https://www.instagram.com/desiedit",
      "https://www.twitter.com/desiedit",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "hello@desiedit.com",
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{
    name: string
    url: string
  }>
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
