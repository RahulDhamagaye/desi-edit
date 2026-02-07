export const runtime = "nodejs"

import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // ✅ USE SAME DB CONNECTION AS ORDERS
    const db = await getDb()

    const existingUser = await db
      .collection("users")
      .findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("SIGNUP ERROR:", error)

    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    )
  }
}
