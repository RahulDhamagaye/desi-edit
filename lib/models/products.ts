// Product database operations
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "./models"
import { ObjectId } from "mongodb"

export async function getAllProducts(
  limit?: number,
  skip?: number,
  filter?: Record<string, unknown>,
): Promise<Product[]> {
  const db = await getDatabase()
  const query = filter || {}
  const products = await db
    .collection<Product>("products")
    .find(query)
    .skip(skip || 0)
    .limit(limit || 50)
    .toArray()
  return products
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await getDatabase()
  const product = await db.collection<Product>("products").findOne({ slug })
  return product
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await getDatabase()
  const product = await db.collection<Product>("products").findOne({ _id: (new ObjectId(id) as any) })
  return product
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const db = await getDatabase()
  const products = await db.collection<Product>("products").find({ featured: true }).limit(6).toArray()
  return products
}

export async function searchProducts(query: string): Promise<Product[]> {
  const db = await getDatabase()
  const products = await db
    .collection<Product>("products")
    .find({
      $or: [{ name: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }],
    })
    .toArray()
  return products
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const db = await getDatabase()
  const products = await db.collection<Product>("products").find({ category }).toArray()
  return products
}
