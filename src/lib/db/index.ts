import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { chats } from "./schema"
import { eq } from "drizzle-orm"


if(!process.env.DATABASE_URL) {
    throw new Error("databse url not found")
}

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql)

export const getChatById = async (chatId: number) => (await db.select().from(chats).where(eq(chats.id, chatId)))[0];