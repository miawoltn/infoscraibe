import { lucia } from "@/lib/auth/lucia";
import { db, isEmailAvailable } from "@/lib/db";
import { authUser } from "@/lib/db/schema";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import { SessionManager, validateAuthInput } from "../../../../lib/auth/utils";
import { EmailVerificationManager } from "../../../../lib/auth/utils/email-verification-manager";
import { EmailTemplate, sendEmail } from "../../../../lib/email";

export async function POST(request: Request) {
    const { email, password, name } = await request.json();
    console.log(name, email);

    try {
        const { isValid, errors } = validateAuthInput({ email, password });
        if (!isValid) {
            return NextResponse.json({ errors }, { status: 400 });
        }

        // Check email availability
        const emailCheck = await isEmailAvailable(email);
        if (!emailCheck.available) {
            return NextResponse.json(
                { error: emailCheck.message },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = generateId(15);

        await db.insert(authUser).values({
            id: userId,
            email,
            name,
            hashedPassword
        });

        const verificationCode = await EmailVerificationManager.createVerificationToken(email);
        await sendEmail(email, EmailTemplate.EmailVerification, { code: verificationCode });

        await SessionManager.createSession(userId);

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: "An error occurred while creating your account" },
            { status: 500 }
        );
    }
}