'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import toast from "react-hot-toast";
import { Paths } from "../lib/constants";

export function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        console.log({event})
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");

        try {
            const response = await fetch("/api/auth/password-reset", {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const data = await response.json();
            toast.success(data.message || "Password reset email sent");
            router.push(Paths.SIGN_IN)
            router.refresh();
        } catch (error) {
            console.log({error})
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Forgot Password?</CardTitle>
                <CardDescription>Password reset link will be sent to your email.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
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
                                Sending...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>

                    <div className="flex flex-wrap justify-between">

                        <span className="text-center text-sm text-muted-foreground">
                            Not signed up?{" "}
                            <Link href="/sign-up" className="text-primary hover:underline">
                                Sign up now.
                            </Link>
                        </span>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}