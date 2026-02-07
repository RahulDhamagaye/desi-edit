import { NextResponse } from "next/server"
import type { Order, OrderItem, Address } from "@/lib/models/models"
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from "@/lib/email"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    /* -----------------------------------------
       AUTH (ADDED – REQUIRED)
    ------------------------------------------ */
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* -----------------------------------------
       REQUEST BODY
    ------------------------------------------ */
    const { email, items, shippingAddress } = await req.json()

    if (!email || !items?.length) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      )
    }

    const totalPrice = items.reduce(
      (sum: number, item: OrderItem) =>
        sum + item.price * item.quantity,
      0
    )

    /* -----------------------------------------
       ORDER OBJECT (FIXED)
       userId = logged-in user
       email = checkout email
    ------------------------------------------ */
    const order: Order = {
      userId: session.user.email, // ✅ FIXED (ownership)
      items,
      totalPrice,
      shippingAddress,
      paymentStatus: "completed",
      orderStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const orders = await db.orders()
    const result = await orders.insertOne(order)
    const orderId = result.insertedId.toString()

    /* -----------------------------------------
       EMAIL (UNCHANGED BEHAVIOR)
    ------------------------------------------ */
    await sendOrderConfirmationEmail({
      to: email, // ✅ checkout email
      orderId,
      totalAmount: totalPrice,
      items,
    })

    sendAdminOrderAlertEmail({
      orderId,
      customerEmail: email,
      totalAmount: totalPrice,
      items,
    })

    return NextResponse.json({
      orderId: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Order error:", error)
    return NextResponse.json(
      { error: "Order failed" },
      { status: 500 }
    )
  }
}
