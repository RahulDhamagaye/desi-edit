// User database operations
import { getDatabase } from "@/lib/mongodb"
import type { User } from "./models"
import { ObjectId } from "mongodb"

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase()
  const user = await db.collection<User>("users").findOne({ email })
  return user
}

export async function createUser(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
  const db = await getDatabase()
  const result = await db.collection<User>("users").insertOne({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return {
    ...userData,
    _id: result.insertedId.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = await getDatabase();
  const result = await db.collection<User>("users").findOneAndUpdate(
    { _id: new ObjectId(id) as any },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  // result is now either the User object or null
  return result; 
}
