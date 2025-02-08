export const dynamic = 'force-dynamic'
import { getUploadUrl } from "@/lib/s3";
import { currentUser } from "@clerk/nextjs";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Params }) {
    try {
        const user = await currentUser();
        if (!user?.id) {
            return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const fileName = searchParams.get('fileName');
        if (!fileName) {
            return NextResponse.json({ error: 'filename is required' }, { status: 400 });
        }
        const url = await getUploadUrl(fileName);
        console.log({ url })
        return NextResponse.json({ url }, { status: 200 })
    } catch (err) {
        console.log({err})
        return NextResponse.json({ error: 'Something went wrong. Try again' }, { status: 500 })
    }
}