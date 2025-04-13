import { redirect } from 'next/navigation';
import { getCurrentUser, requireVerifiedUser } from './session';

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    return async function AuthenticatedComponent(props: P) {
        const user = await getCurrentUser();
        
        if (!user) {
            redirect('/sign-in');
        }

        await requireVerifiedUser();
        
        return <WrappedComponent {...props} user={user} />;
    };
}