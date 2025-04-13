import { cookies } from "next/headers";
import { decodeIdToken } from "arctic";

import type { OAuth2Tokens } from "arctic";
import { google } from "../../../../../lib/auth/lucia";
import { createUser, getUserByGoogleIdOrEmail, initializeUserCredits, updateUser } from "../../../../../lib/db";
import { SessionManager } from "../../../../../lib/auth/utils";
import { generateId } from "lucia";
import { EmailTemplate, sendEmail } from "../../../../../lib/email";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const error = url.searchParams.get("error");
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const cookieStore = cookies();
	const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
	const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;
	console.dir({ cookieStore, code, state, codeVerifier, storedState }, { depth: null })
	if (!code || !state || !storedState || !codeVerifier) {
		return redirectToError(error || "Missing authentication parameters");
	}
	if (state !== storedState) {
		return redirectToError(error || "Invalid authentication state");
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);


		const claims = decodeIdToken(tokens.idToken()) as {
			sub: string;
			email: string,
			email_verified: boolean,
			name: string,
			picture: string
		};
		console.log({ claims })
		const googleId = claims.sub;
		const name = claims.name;
		const email = claims.email;
		const picture = claims.picture;
		const emailVerified = claims.email_verified;
		console.log({ googleId, name, email, picture, emailVerified })

		if (emailVerified == false) {
			return redirectToError("Email not verified with Google");
		}

		let user = await getUserByGoogleIdOrEmail(googleId, email);
		console.log({ user })

		if (!user) {
			console.log('creating new user...')
			const userId = generateId(15);
			user = (await createUser({ id: userId, email, name, imageUrl: picture, googleId, emailVerified: true }))[0];
			// Initialize user credits
			await initializeUserCredits(user.id);

			await sendEmail(user.email, EmailTemplate.Welcome, {
				name: user.name || 'there'
			});

			// Send getting started email after a short delay
			setTimeout(async () => {
				await sendEmail(user?.email!, EmailTemplate.GettingStarted, {
					name: user?.name! || 'there'
				});
			}, 2 * 60 * 1000); // Send after 2 minutes

		} else if (user.googleId !== googleId || user.imageUrl !== picture) {
			console.log('updating user....')
			await updateUser(user.id, {
				name,
				email,
				googleId,
				imageUrl: picture,
				emailVerified
			})
		}

		console.log('creating session...')
		await SessionManager.createSession(user?.id);

		console.log('redirecting...')
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});

	} catch (error) {
		console.error("Google authentication error:", error);
        return redirectToError(
            error instanceof Error ? error.message : "Authentication failed"
        );
	}
}

function redirectToError(error: string): Response {
	const params = new URLSearchParams({ error });
	return new Response(null, {
		status: 302,
		headers: {
			Location: `/error?${params.toString()}`
		}
	});
}