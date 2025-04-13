import { NextResponse } from "next/server";
import { PasswordResetManager } from "../../../../lib/auth/utils/password-reset-manager";
import { EmailTemplate, sendEmail } from "../../../../lib/email";
import { EmailVerificationManager } from "../../../../lib/auth/utils/email-verification-manager";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if(!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const token = await EmailVerificationManager.recreateVerificationToken(email);
        console.log('Reset token:', token);

        await sendEmail(email, EmailTemplate.EmailVerification, { code: token! });

        return NextResponse.json(
            { message: "If an account exists, a password reset email has been sent" }
        );
    } catch (error) {
        console.log({error})
        if(error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: `${error}"Failed to process request"` },
            { status: 500 }
        );
    }
}