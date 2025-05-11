import { redirect } from "next/navigation";
import { VerifyEmail } from "../../../components/VerifyEmail";
import { getCurrentUser } from "../../../lib/auth/utils";
import { Paths } from "../../../lib/constants";

export default async function VerifyEmailPage() {
    const user = await getCurrentUser();
    console.log({user})
    if (!user) redirect(Paths.SIGN_IN);
    if (user.emailVerified) redirect(Paths.DASHBOARD);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 px-4 py-8">
                <VerifyEmail email={user?.email} />
            </div>
        </div>
    );
}