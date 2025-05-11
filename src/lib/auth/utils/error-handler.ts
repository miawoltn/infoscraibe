export class AuthError extends Error {
    constructor(
        message: string,
        public code: string,
        public status: number = 400
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

export const handleAuthError = (error: unknown) => {
    if (error instanceof AuthError) {
        return {
            error: error.message,
            code: error.code,
            status: error.status
        };
    }

    console.error('Auth error:', error);
    return {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        status: 500
    };
};