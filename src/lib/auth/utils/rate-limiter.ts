import { getRedisClient} from "@/lib/redis";


export class RateLimiter {
    static async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
        const redis = await getRedisClient();
        const current = await redis.incr(key);
        
        if (current === 1) {
            await redis.expire(key, window);
        }
        
        return current <= limit;
    }
    static async clearLimit(key: string): Promise<void> {
        const redis = await getRedisClient();
        await redis.del(key);
    }
}