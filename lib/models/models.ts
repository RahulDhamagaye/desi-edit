// TypeScript interfaces for database models
export interface Product {
  _id?: string
  name: string
  slug: string
  description: string
  longDescription?: string
  price: number
  discountPrice?: number
  images: string[]
  category: string
  subcategory?: string
  sizes: string[]
  colors: string[]
  material?: string
  care?: string
  inStock: boolean
  stockCount: number
  rating: number
  reviews: Review[]
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id?: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface User {
  _id?: string
  email: string
  password: string
  name: string
  address?: Address
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Order {
  _id?: string
  userId: string
  items: OrderItem[]

  // ✅ MUST MATCH DB
  totalPrice: number

  // ✅ MUST MATCH DB
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  paymentStatus: "pending" | "completed" | "failed"
  orderStatus: "pending" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  updatedAt: Date
}


export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  size?: string
  color?: string
}

export interface CartItem {
  cartKey: string
  productId: string
  quantity: number
  size?: string
  color?: string
}
