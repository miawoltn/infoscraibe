import { useState } from "react";
import { Button } from "./ui/button";
import { logout } from "../lib/auth/utils/logout";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2 } from "lucide-react";

interface SignoutConfirmationProps {
    onCancel: (state: boolean) => void
}
const SignoutConfirmation = ({onCancel}: SignoutConfirmationProps) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignout = async () => {
        setIsLoading(true);
        try {
            await logout();
            // toast("Signed out successfully");
        } catch (error) {
            if (error instanceof Error) {
                toast(error.message, {
                    icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
                });
            }
        } finally {
            setOpen(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={() => onCancel(false)}>
                Cancel
            </Button>
            <Button onClick={handleSignout}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing out...
                    </>
                ) : (
                    "Yes, sign me out"
                )}
            </Button>
        </div>
    );
};

export default SignoutConfirmation;
