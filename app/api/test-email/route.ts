import { NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function GET() {
  await sendOrderConfirmationEmail({
    to: "desieditcontact@gmail.com",
    orderId: "TEST123",
    totalAmount: 999,
  })

  return NextResponse.json({ ok: true })
}
