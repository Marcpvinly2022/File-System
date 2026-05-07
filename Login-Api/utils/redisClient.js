import { createClient} from 'redis';
const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;
export const redisClient = new createClient({
    url: `redis://${redisHost}:${redisPort}`
});

redisClient.on('error', (err) => console.error("redisclient error", err) )
console.log(redisClient)
await redisClient.connect();


