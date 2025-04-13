export const APP_TITLE = 'InfoScraibe';
export const EMAIL_SENDER = 'InfoScraibe <infoscraibe@no-reply.infoscraibe.com>';
export const Paths = {
    SIGN_UP: '/sign-up',
    SIGN_IN: '/sign-in',
    VERIFY_EMAIL: '/verify_email',
    RESET_PASSWORD: 'reset-password',
    DASHBOARD: '/dashboard'
}
export const PRICING = {
    // OpenAI costs (in USD)
    GPT4_INPUT: 0.01, // per 1K tokens
    GPT4_OUTPUT: 0.03, // per 1K tokens
    GPT35_INPUT: 0.001, // per 1K tokens
    GPT35_OUTPUT: 0.002, // per 1K tokens

    // CHAT_TOKEN_RATE: 0.001, // Cost per token
    // STORAGE_RATE: 0.05, // Cost per MB per month
    // MINIMUM_TOPUP: 5.00, // Minimum amount for topup
    
    // Pinecone costs (in USD)
    STORAGE_PER_VECTOR_PER_MONTH: 0.0001, // approximate for pod-free tier
    
    // Our pricing (in Naira)
    CREDIT_TO_NAIRA: 1, // 1 credit = 1 Naira
    MIN_TOPUP_AMOUNT: 1000, // Minimum topup in Naira
    
    // Credit conversions
    TOKEN_TO_CREDITS: 0.5, // 1 token = 0.5 credits
    STORAGE_MB_TO_CREDITS: 5, // 1MB storage = 5 credits per month
    
    // Default settings
    DEFAULT_REMINDER_THRESHOLD: 100, // credits
};

export const CREDIT_PACKAGES = [
    {
        name: 'Starter',
        credits: 1000,
        price: 1000, // in Naira
        description: 'Perfect for getting started'
    },
    {
        name: 'Pro',
        credits: 5000,
        price: 4500,
        description: 'Most popular choice'
    },
    {
        name: 'Enterprise',
        credits: 20000,
        price: 16000,
        description: 'Best value for heavy usage'
    }
];