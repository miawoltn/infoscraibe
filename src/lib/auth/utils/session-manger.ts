import { lucia } from "../lucia";
import { cookies } from "next/headers";

export class SessionManager {
    static async createSession(userId: string, attibutes: {} = {}) {
        const session = await lucia.createSession(userId, attibutes);
        const sessionCookie = lucia.createSessionCookie(session.id);
        
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
        
        return session;
    }

    static async invalidateSession() {
        const sessionId = cookies().get(lucia.sessionCookieName)?.value;
        if (!sessionId) return;

        await lucia.invalidateSession(sessionId);
        const sessionCookie = lucia.createBlankSessionCookie();
        
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
    }

    static async validateSession() {
        const sessionId = cookies().get(lucia.sessionCookieName)?.value;
        if (!sessionId) return null;

        try {
            return await lucia.validateSession(sessionId);
        } catch {
            return null;
        }
    }
}