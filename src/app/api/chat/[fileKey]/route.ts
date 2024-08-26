import { deleteChatByFileKey } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextResponse } from "next/server";

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