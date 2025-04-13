import { db } from "@/lib/db";
import { authUser, passwordResets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { createHash, randomBytes } from "crypto";
import * as bcrypt from "bcrypt";
import { lucia } from "../lucia";

export class PasswordResetManager {
    static async createResetToken(email: string) {
        const user = await db.query.authUser.findFirst({
            where: eq(authUser.email, email)
        });

        if (!user || !user.emailVerified) throw new Error("Provided email is invalid.");

        const token = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await db.insert(passwordResets).values({
            id: generateId(15),
            userId: user.id,
            token: hashedToken,
            expiresAt
        });

        return {token, name: user.name};
    }

    static async resetPassword(token: string, newPassword: string) {
        const hashedToken = createHash('sha256').update(token).digest('hex');
        
        const resetRequest = await db.query.passwordResets.findFirst({
            where: eq(passwordResets.token, hashedToken)
        });

        if (!resetRequest || resetRequest.expiresAt < new Date()) {
            throw new Error("Invalid or expired reset token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.update(authUser)
            .set({ hashedPassword })
            .where(eq(authUser.id, resetRequest.userId));

        await db.delete(passwordResets)
            .where(eq(passwordResets.id, resetRequest.id));
    }
}