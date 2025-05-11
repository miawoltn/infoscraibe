import { Lucia } from "lucia";
import { PostgresJsAdapter } from "@lucia-auth/adapter-postgresql";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db, pg } from "../db";
import { getCurrentUser } from "./utils/session";
import { Google } from "arctic";
import { authSession, authUser } from "../db/schema";

// const adapter = new PostgresJsAdapter(pg, {
//     user: 'auth_user',
//     session: 'user_session',
// });
const adapter = new DrizzlePostgreSQLAdapter(db, authSession, authUser);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production"
        }
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            name: attributes.name,
            emailVerified: attributes.emailVerified,
            imageUrl: attributes.imageUrl,
            createdAt: attributes.createdAt,
        };
    }
});

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID || '',
	process.env.GOOGLE_CLIENT_SECRET || '',
	`${process.env.NEXT_PUBLIC_APP_URL}/sign-in/google/callback`
);



// For TypeScript support
declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            email: string;
            name: string | null;
            imageUrl: string | null;
            emailVerified: boolean | null;
            createdAt: Date | null;
        };
    }
}

// Helper for middleware
export function createMiddlewareClient() {
    return {
        validateSession: getCurrentUser,
        handleRequest: ({ request }: { request: Request }) => {
            return {
                validateSession: getCurrentUser
            };
        }
    };
}