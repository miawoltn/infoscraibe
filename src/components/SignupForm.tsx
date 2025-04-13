'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { APP_TITLE, Paths } from "../lib/constants";

export function SignUpForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");
        const name = formData.get("name");

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                body: JSON.stringify({ email, password, name }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            router.push(Paths.VERIFY_EMAIL);
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <CardTitle>{APP_TITLE} Sign up</CardTitle>
            <CardDescription>Signup to start</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/sign-in/google" prefetch={false}>
                    {/* <Ube className="mr-2 h-5 w-5" /> */}
                    Log in with Google
                </Link>
            </Button>
            <div className="my-2 flex items-center">
                <div className="flex-grow border-t border-muted" />
                <div className="mx-2 text-muted-foreground">or</div>
                <div className="flex-grow border-t border-muted" />
            </div>
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                />
            </div>
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
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
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
                        Creating account...
                    </>
                ) : (
                    "Sign up"
                )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href={Paths.SIGN_IN} className="text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </form>
        </CardContent>
        </Card>
    );
}