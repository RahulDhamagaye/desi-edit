import { MongoClient, Db } from "mongodb"
import type { Order } from "@/lib/models/models"

const uri = process.env.MONGODB_URI as string

if (!uri) {
  throw new Error("❌ MONGODB_URI not found")
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db("desiedit") // ✅ MUST match Atlas DB name

  cachedClient = client
  cachedDb = db

  return { client, db }
}

/* -------------------------------------------------
   Existing helper (DO NOT BREAK CALLERS)
-------------------------------------------------- */
export const db = {
  async orders() {
    const { db } = await connectToDatabase()
    return db.collection<Order>("orders")
  },
}

/* -------------------------------------------------
   API helper
-------------------------------------------------- */
export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}
