import { cookies } from "next/headers";
import { lucia } from "../lucia";

export const getSessionId = () => {
    return cookies().get(lucia.sessionCookieName)?.value ?? null;
};

export const setSessionCookie = (sessionId: string) => {
    const sessionCookie = lucia.createSessionCookie(sessionId);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
};

export const clearSessionCookie = () => {
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
};