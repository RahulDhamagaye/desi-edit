import type React from "react"
import type { Metadata } from "next"
import { contentfulClient } from "@/lib/contentful"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const entries = await contentfulClient.getEntries({
    content_type: "product",
    limit: 1,
    "fields.slug": slug,
  })

  const product: any = entries.items[0]

  if (!product) {
    return {
      title: "Product Not Found | Desi Edit",
    }
  }

  const f = product.fields

  const images =
    f.images?.map((img: any) => ({
      url: `https:${img.fields.file.url}`,
    })) ?? []

  return {
    title: `${f.name} | Desi Edit`,
    description: f.description,
    keywords: `${f.name}, ${f.category}, Desi fashion, South Asian clothing`,
    openGraph: {
      title: f.name,
      description: f.description,
      images,
      type: "website",
    },
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
