import { deleteChatByFileKey, getChatByUserIdAndChecksum } from "@/lib/db";
import { getFileUrl } from "@/lib/s3";
import { currentUser } from "@clerk/nextjs";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Params }) {
    try {
        const user = await currentUser();
        if (!user?.id) {
            return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
        }

        const checksum = context.params.fileKey;
        if (!checksum) {
            return NextResponse.json({ error: 'mising identifier' }, { status: 400 });
        }
        const currentChat = await getChatByUserIdAndChecksum(user.id, checksum);
        if(!currentChat) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

       const fileUrl = await getFileUrl(currentChat?.fileKey);
        return NextResponse.json({ ...currentChat, fileUrl }, { status: 200 })
    } catch (err) {
        console.log({err})
        return NextResponse.json({ error: 'Something went wrong. Try again' }, { status: 500 })
    }
}

export async function DELETE(request: Request, context: { params: Params }) {
    const user = await currentUser()
    const userId = user?.id;
    if (!userId) {
        return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
    }
    
    try {
        const fileKey = context.params.fileKey

        if(!fileKey) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
       
        await deleteChatByFileKey(fileKey);
       
        return NextResponse.json(
            { message: 'File scheduled for deletion' },
            { status: 200 }
        )
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}