export const runtime = "nodejs"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // ✅ IMPORTANT: await params (this was the missing piece)
  const { orderId } = await params

  if (!orderId || !ObjectId.isValid(orderId)) {
    return NextResponse.json(
      { error: "Invalid order id" },
      { status: 400 }
    )
  }

  const db = await getDb()

  const order = await db.collection("orders").findOne({
    _id: new ObjectId(orderId),
    userId: session.user.email,
  })

  if (!order) {
    return NextResponse.json(
      { error: "Order not found or access denied" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    ...order,
    _id: order._id.toString(),
  })
}
