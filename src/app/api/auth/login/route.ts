import { lucia } from "@/lib/auth/lucia";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import { Session } from "inspector";
import { SessionManager } from "../../../../lib/auth/utils";

export async function POST(request: Request) {
    const { email, password } = await request.json();

    try {
        const existingUser = await db.query.authUser.findFirst({
            where: eq(authUser.email, email)
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 400 }
            );
        }

        const isValidPassword = await bcrypt.compare(
            password,
            existingUser.hashedPassword!
        );

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 400 }
            );
        }

       await SessionManager.createSession(existingUser.id);

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during sign-in:", error);
        return NextResponse.json(
            { error: "An error occurred during sign in" },
            { status: 500 }
        );
    }
}