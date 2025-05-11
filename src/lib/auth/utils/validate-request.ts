import { cookies } from "next/headers";
import { cache } from "react";
import { lucia } from "../lucia";

// Validate request helper
export const validateRequest = cache(
    async () => {
        const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) return { user: null, session: null };
        return await lucia.validateSession(sessionId);
    }
);