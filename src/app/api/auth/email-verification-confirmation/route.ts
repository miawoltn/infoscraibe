import { NextResponse } from "next/server";
import { EmailVerificationManager } from "../../../../lib/auth/utils/email-verification-manager";
import { getCurrentUser } from "../../../../lib/auth/utils";
import { EmailTemplate, sendEmail } from "../../../../lib/email";
import { initializeUserCredits } from "../../../../lib/db";

export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        await EmailVerificationManager.verifyEmail(token);

        // Get user info to send welcome email
        const user = await getCurrentUser();
        if (user) {
            // Initialize user credits
            await initializeUserCredits(user.id);

            await sendEmail(user.email, EmailTemplate.Welcome, {
                name: user.name || 'there'
            });

            // Send getting started email after a short delay
            setTimeout(async () => {
                await sendEmail(user.email, EmailTemplate.GettingStarted, {
                    name: user.name || 'there'
                });
            }, 2 * 60 * 1000); // Send after 2 minutes
        }

        return NextResponse.json({
            message: "Email verified successfully"
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to verify email";
        return NextResponse.json(
            { error: message },
            { status: 400 }
        );
    }
}