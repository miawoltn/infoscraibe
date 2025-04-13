import { redirect } from "next/navigation";
import { ForgotPassword } from "../../../components/ForgotPassword";
import { getCurrentUser } from "../../../lib/auth/utils";

export default async function SignInPage() {
    const user = await getCurrentUser();
    if (user) redirect("/dashboard");

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 px-4 py-8">
                <ForgotPassword />
            </div>
        </div>
    );
}