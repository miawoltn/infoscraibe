// export interface AuthUser {
//     id: string;
//     email: string;
//     name: string | null;
//     imageUrl: string | null;
//     emailVerified: boolean | null;
// }

export interface Session {
    id: string;
    userId: string;
    expiresAt: Date;
}

export type AuthRequest = {
    email: string;
    password: string;
    name?: string;
}

export interface PasswordReset {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
}

export type PasswordResetRequest = {
    email: string;
    token?: string;
    password?: string;
}