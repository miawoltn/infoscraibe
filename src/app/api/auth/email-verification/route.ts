import { protectRoute } from "@/lib/auth/utils/protect-route";
import { NextResponse } from "next/server";
import { EmailVerificationManager } from "../../../../lib/auth/utils/email-verification-manager";

export const POST = protectRoute(async (req, user) => {
    try {
        const token = await EmailVerificationManager.createVerificationToken(user?.email!);
        
        // TODO: Send verification email
        console.log('Verification token:', token);

        return NextResponse.json({ 
            message: "Verification email sent" 
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }
});