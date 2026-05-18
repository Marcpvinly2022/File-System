import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT);

const redisConfig = {
    host: REDIS_HOST,
    port: REDIS_PORT,   
    maxRetriesPerRequest: null, // Disable retries to prevent hanging
}

export const redisClient = new Redis(redisConfig);
// 2. Export a duplicated connection dedicated to BullMQ with required options
export const bullconnect = new Redis(redisConfig);

redisClient.on('error', (err) => console.error("redisclient error", err) )
// console.log(redisClient)
bullconnect.on('error', (err) => console.error("bullconnect error", err) )
// console.log(redisClient)



