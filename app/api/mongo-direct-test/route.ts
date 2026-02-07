import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()

    const db = client.db("desiedit")
    const collections = await db.listCollections().toArray()

    return NextResponse.json({
      connected: true,
      db: db.databaseName,
      collections: collections.map(c => c.name),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
