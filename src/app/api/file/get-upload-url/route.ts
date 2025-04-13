export const dynamic = 'force-dynamic'
import { getUploadUrl } from "@/lib/s3";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextRequest, NextResponse } from "next/server";
import { protectRouteWithContext } from "../../../../lib/auth/utils";

export const GET = protectRouteWithContext(async (req, context: { params: Params }) => {
    try {
        const searchParams = (req as NextRequest).nextUrl.searchParams;
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
})