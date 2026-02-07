export type Product = {
  _id: string

  name: string
  slug: string
  description: string

  price: number
  images: string[]
  category: string

  sizes: string[]
  colors: string[]

  stockCount: number
  inStock: boolean
  featured: boolean

  rating: number
  reviews: any[]

  createdAt: Date
  updatedAt: Date
}
