// import { authMiddleware } from "@clerk/nextjs";
 
// // This example protects all routes including api/trpc routes
// // Please edit this to allow other routes to be public as needed.
// // See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
// export default authMiddleware({
//     publicRoutes: ["/", '/api/webhook', '/api/webhook/paystack', '/pricing', '/share/:id', '/api/chat/share/:id'],
// });
 
// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };

import { createMiddlewareClient } from "@/lib/auth/lucia";
import { verifyRequestOrigin } from "lucia";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  '/api/webhook/paystack',
  '/api/webhook',
  // Add other webhook routes here
];

export async function middleware(request: NextRequest) {
    // const session = await createMiddlewareClient().validateSession();

    // const publicPaths = ["/", "/sign-in", "/sign-up", '/api/webhook', '/api/webhook/paystack', '/pricing', '/share/:id', '/api/chat/share/:id'];
    // const isPublicPath = publicPaths.some(path => {
    //     if (path.includes(':id')) {
    //         return request.nextUrl.pathname.startsWith(path.split(':')[0]);
    //     }
    //     return request.nextUrl.pathname === path;
    // });

    // if (!session && !isPublicPath) {
    //     return NextResponse.redirect(new URL("/sign-in", request.url));
    // }

    // if (session && (request.nextUrl.pathname === "/sign-in" || request.nextUrl.pathname === "/sign-up")) {
    //     return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    // return NextResponse.next();
    if (request.method === "GET" ||
      PUBLIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))
    ) {
      return NextResponse.next();
    }
    const originHeader = request.headers.get("Origin");
    const hostHeader = request.headers.get("Host");
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new NextResponse(null, {
        status: 403,
      });
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};