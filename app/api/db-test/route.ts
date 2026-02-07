import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const db = await getDb()
    const collections = await db.listCollections().toArray()

    return NextResponse.json({
      status: "connected",
      database: db.databaseName,
      collections: collections.map(c => c.name),
    })
  } catch (error: any) {
    console.error("DB test failed:", error)
    return NextResponse.json(
      { error: "DB connection failed", details: error.message },
      { status: 500 }
    )
  }
}
