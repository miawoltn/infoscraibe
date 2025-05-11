'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import toast from "react-hot-toast";
import { Paths } from "../lib/constants";
import { getCurrentUser } from "../lib/auth/utils";
import { logout } from "../lib/auth/utils/logout";

export function VerifyEmail({ email }: { email: string}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isSigningOut, setSigningOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        console.log({event})
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const token = formData.get("code");

        try {
            const response = await fetch("/api/auth/email-verification-confirmation", {
                method: "POST",
                body: JSON.stringify({ token }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const data = await response.json();
            toast.success(data.message || "Password reset email sent");
            router.push(Paths.DASHBOARD)
            router.refresh();
        } catch (error) {
            console.log({error})
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    async function onResend() {
        setIsResending(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/resend-email-verification", {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const data = await response.json();
            toast.success(data.message || "Verification code resent");
            // router.push(Paths.SIGN_IN)
            router.refresh();
        } catch (error) {
            console.log({error})
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsResending(false);
        }
    }

     const handleSignout = async () => {
            setSigningOut(true);
            try {
                await logout();
            } catch (error) {
                if (error instanceof Error) {
                    toast(error.message, {
                        icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
                    });
                }
            }finally {
                setSigningOut(false);
            }
        };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Verify Email</CardTitle>
                <CardDescription>Verification code was sent to <strong>{email}</strong>. Check
                your spam folder if you can&apos;t find the email.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            name="code"
                            type="code"
                            placeholder="Enter verification code"
                            autoComplete="off"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </Button>
                    {/* </form>
                    <form onSubmit={onResend} className="space-y-4"> */}
                    <Button variant="outline" className="w-full" onClick={onResend} disabled={isResending || isLoading || isSigningOut}>
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resending...
                            </>
                        ) : (
                            "Resend Code"
                        )}
                    </Button>
                    {/* <Button variant="outline" className="w-full" onClick={handleSignout} disabled={isSigningOut}>
                        {isSigningOut ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing out...
                            </>
                        ) : (
                            "Sign out"
                        )}
                    </Button> */}
                    <div className="flex flex-wrap justify-between">
                        <span className="text-center text-sm text-muted-foreground">
                        Want to use another email? {" "}
                            <Link href={''} onClick={handleSignout} className="text-primary hover:underline">
                                Sign up now.
                            </Link>
                        </span>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}