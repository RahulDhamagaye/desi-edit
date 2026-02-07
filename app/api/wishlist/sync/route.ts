export const runtime = "nodejs"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const userEmail = session.user.email
  const { slugs } = await req.json()
  

  if (!Array.isArray(slugs)) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    )
  }

  const db = await getDb()

  if (slugs.length === 0) {
    return NextResponse.json({ success: true })
  }

  await db.collection("wishlist").bulkWrite(
    slugs.map((productId: string) => ({
      updateOne: {
        filter: {
          userId: userEmail,
          productId,
        },
        update: {
          $setOnInsert: {
            userId: userEmail,
            productId,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }))
  )

  return NextResponse.json({ success: true })
}
