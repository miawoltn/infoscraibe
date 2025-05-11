import { NextResponse } from "next/server";
import { PasswordResetManager } from "../../../../lib/auth/utils/password-reset-manager";
import { EmailTemplate, sendEmail } from "../../../../lib/email";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if(!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const {token, name} = await PasswordResetManager.createResetToken(email);
        console.log('Reset token:', token);

        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
        await sendEmail(email, EmailTemplate.PasswordReset, { link: verificationLink, name: name! });

        return NextResponse.json(
            { message: "If an account exists, a password reset email has been sent" }
        );
    } catch (error) {
        console.log({error})
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}