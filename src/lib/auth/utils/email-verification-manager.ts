import { db, getUserByEmail } from "@/lib/db";
import { authUser, emailVerification } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { createHash, randomBytes } from "crypto";
import { RateLimiter } from "./rate-limiter";

export class EmailVerificationManager {
    static async createVerificationToken(email: string) {
        // const rateLimitKey = `email_verification:${email}`;
        // const canSend = await RateLimiter.checkLimit(rateLimitKey, 3, 3600); // 3 attempts per hour
        
        // if (!canSend) {
        //     throw new Error("Too many verification attempts. Please try again later.");
        // }
        
        const token = randomBytes(3).toString('hex');
        const hashedToken = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        await db.delete(emailVerification).where(eq(emailVerification.userId, email));
        await db.insert(emailVerification).values({
            id: generateId(15),
            userId: user.id,
            token: hashedToken,
            expiresAt
        });

        return token;
    }

    static async verifyEmail(token: string) {
        const hashedToken = createHash('sha256').update(token).digest('hex');
        
        const verificationRequest = await db.query.emailVerification.findFirst({
            where: eq(emailVerification.token, hashedToken)
        });

        if (!verificationRequest || verificationRequest.expiresAt < new Date()) {
            throw new Error("Invalid or expired verification token");
        }

        await db.update(authUser)
            .set({ emailVerified: true })
            .where(eq(authUser.id, verificationRequest.userId));

        await db.delete(emailVerification)
            .where(eq(emailVerification.id, verificationRequest.id));
    }

    static async recreateVerificationToken(email: string) {
        // const rateLimitKey = `email_verification:resend`;
        // const canSend = await RateLimiter.checkLimit(rateLimitKey, 3, 3600); // 3 attempts per hour
        
        // if (!canSend) {
        //     throw new Error("Too many verification attempts. Please try again later.");
        // }

        const user = await getUserByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }

        const lastSent = await db.query.emailVerification.findFirst({
            where: (table, { eq }) => eq(table.userId, user.id),
            columns: { expiresAt: true },
          });
        
          if (lastSent && lastSent.expiresAt > new Date()) {
            const timeLeft = lastSent.expiresAt.getTime() - Date.now();
            const minutesLeft = Math.ceil(timeLeft / 1000 / 60);
            throw new Error(`Please wait ${minutesLeft} min(s) before resending`);
          }

          return await EmailVerificationManager.createVerificationToken(email);
    }
}