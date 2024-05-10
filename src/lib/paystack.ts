import axios from "axios"

const BASE_URL = process.env.PAYSTACK_URL
const SECRET_KEY = process.env.PAYSTACK_SECRET
const PLAN_ID = process.env.PAYSTACK_PLAN_ID
const return_url = process.env.NEXT_BASE_URL + '/';
const baseUrl = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Authorization": `Bearer ${SECRET_KEY}`,
        "Content-Type": "application/json"
    }
})

export const initialiseSubscription = async ({ userId, email }: { userId: string, email: string }) => {
    try {
        const { data } = await baseUrl.post(`/transaction/initialize`, {
            email, 
            plan: PLAN_ID,
            callback_url: return_url,
            amount: 500000,
            metadata: {
                userId
            }
        });

        return data.data.authorization_url;
    } catch (err:any) {
        console.log(err);
        throw new Error(err.message);
    }
}

export const getSubscriptionLink = async ({ subscriptionCode }: { subscriptionCode: string }) => {
    try {
        const response = await baseUrl.get(`/subscription/${subscriptionCode}/manage/link`);
        return response.data.data.link;
    } catch (err: any) {
        console.log(err);
        throw new Error(err);
    }
}

export const getSubscription = async ({ subscriptionCode }: { subscriptionCode: string }) => {
    try {
        const response = await baseUrl.get(`/subscription/${subscriptionCode}`);
        return response.data.data;
    } catch (err: any) {
        console.log(err);
        throw new Error(err.message);
    }
}



