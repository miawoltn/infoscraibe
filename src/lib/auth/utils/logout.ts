'use server'

import { cookies } from "next/headers";
import { lucia } from "../lucia";
import { redirect } from "next/navigation";
import { validateRequest } from "./validate-request";

export async function logout(): Promise<{ error: string } | void> {
    const { session } = await validateRequest();
    if (!session) {
      return {
        error: "No session found",
      };
    }
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/");
  }