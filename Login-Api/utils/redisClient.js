import Redis from "ioredis";
import path from "path";
import dotenv from "dotenv";

const result = dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
});

// console.log("DOTENV RESULT:", result);
// console.log("ENV CHECK:", {
//   REDIS_HOST: process.env.REDIS_HOST,
//   REDIS_PORT: process.env.REDIS_PORT,
//   PORT: process.env.PORT
// });

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT);

// console.log("ENV DEBUG:", {
//   REDIS_HOST,
//   REDIS_PORT,
// });

if (!REDIS_HOST) {
  throw new Error("REDIS_HOST is missing");
}

if (!process.env.REDIS_PORT) {
  throw new Error("REDIS_PORT is missing");
}

if (Number.isNaN(REDIS_PORT)) {
  throw new Error("REDIS_PORT is invalid");
}

const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(redisConfig);
export const bullconnect = new Redis(redisConfig);

redisClient.on("error", (err) => console.error("redisclient error", err));
bullconnect.on("error", (err) => console.error("bullconnect error", err));