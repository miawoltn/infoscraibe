import { ResetPassword } from "../../../../components/ResetPassword";

export const metadata = {
    title: "Reset Password",
    description: "Reset Password Page",
};

export default async function ResetPasswordPage({ params }: {
    params: { token: string };
  }) {

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 px-4 py-8">
                <ResetPassword token={params.token}/>
            </div>
        </div>
    );
}