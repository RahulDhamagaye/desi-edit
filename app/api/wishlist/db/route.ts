export const runtime = "nodejs"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const db = await getDb()

  const items = await db
    .collection("wishlist")
    .find({ userId: session.user.email })
    .toArray()

  return NextResponse.json(
    items.map((i) => i.productId)
  )
}
