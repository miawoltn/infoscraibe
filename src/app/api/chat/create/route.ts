import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { loadS3IntoPinecone } from "@/lib/pinecone"
import { getS3Url } from "@/lib/s3"
import { NextResponse } from "next/server"
import { protectRoute } from "../../../../lib/auth/utils"

export const POST = protectRoute(async (req: Request, user) => {
    try {
        const body = await req.json()
        const { fileKey, fileName, fileType, checksum } = body

        if(!fileType || !fileName || !fileKey || !checksum) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        const pages = await loadS3IntoPinecone(fileKey, fileType);
        console.log("pages", pages.length);
        const [id] = await db.insert(chats).values({
            fileKey,
            fileName,
            fileUrl: getS3Url(fileKey),
            checksum,
            userId: user?.id!,
        }).returning({
            insertedId: chats.id
        })
        return NextResponse.json(
            { message: 'Chat created sucessfully', id: id.insertedId, checksum },
            { status: 200 }
        )
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
})