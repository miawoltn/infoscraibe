import { AuthRequest } from "../types";

export const validateAuthInput = (input: Partial<AuthRequest>) => {
    const errors: Record<string, string> = {};

    if (!input.email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
        errors.email = "Invalid email format";
    }

    if (!input.password) {
        errors.password = "Password is required";
    } else if (input.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};