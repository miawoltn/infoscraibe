import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { getCurrentUser } from "./session";
import { NextRequest, NextResponse } from "next/server";

export function protectRoute(
    handler: (req: Request, user: Awaited<ReturnType<typeof getCurrentUser>>) => Promise<Response>
) {
    return async (req: Request) => {
        const user = await getCurrentUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return handler(req, user);
    }
}

export function protectRouteWithContext(
    handler: (req: Request, context: { params: Params }, user: Awaited<ReturnType<typeof getCurrentUser>>) => Promise<Response>
) {
    return async (req: Request, context: { params: Params }) => {
        const user = await getCurrentUser();
        
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return handler(req, context, user);
    }
}