import { validateAuthInput } from "@/lib/auth/utils/validation";
import { NextResponse } from "next/server";
import { PasswordResetManager } from "../../../../lib/auth/utils/password-reset-manager";

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();
        
        // const { isValid, errors } = validateAuthInput({ password });
        // if (!isValid) {
        //     return NextResponse.json({ errors }, { status: 400 });
        // }

        await PasswordResetManager.resetPassword(token, password);

        return NextResponse.json(
            { message: "Password successfully reset" }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to reset password";
        return NextResponse.json(
            { error: message },
            { status: 400 }
        );
    }
}