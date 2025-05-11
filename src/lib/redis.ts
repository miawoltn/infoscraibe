import Redis from 'ioredis';
import { createClient } from "redis";

// export const redis = new Redis(process.env.REDIS_URL||'');

// redis.on('error', (error: any) => {
//     console.error('Redis connection error:', error);
// });

// redis.on('connect', () => {
//     console.log('Successfully connected to Redis');
// });

// export default redis;

let redis: any | null

export const getRedisClient = async () => {
    if (!redis) {
        console.log(process.env.REDIS_URL)
        if(process.env.REDIS_URL) {
            // redis = new Redis(process.env.REDIS_URL)
            redis = createClient({url: process.env.REDIS_URL})
            await redis.connect()
            redis.on('error', (error: any) => {
                console.error('Redis connection error:', error);
            });
            redis.on('connect', () => {
                console.log('Successfully connected to Redis');
            });
        } else {
          redis = createClient()
        }
        
    }

    return redis;
};
