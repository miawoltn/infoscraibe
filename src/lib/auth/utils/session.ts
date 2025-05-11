import { lucia } from "../lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { AuthUser } from "../../db";

// type AuthUser = {
//     email: string;
//     name: string | null;
//     imageUrl: string | null;
//     emailVerified: boolean | null;
// }

export const getCurrentUser = cache(async () => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value;
    if (!sessionId) return null;

    try {
        const { user } = await lucia.validateSession(sessionId);
        return user as AuthUser;
    } catch {
        return null;
    }
});

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");
    return user;
}

export async function requireVerifiedUser() {
    const user = await requireUser();
    
    if (!user.emailVerified) {
        redirect("/verify-email");
    }
    
    return user;
}