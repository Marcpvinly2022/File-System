import {rateLimit} from 'express-rate-limit';
import {RedisStore} from 'rate-limit-redis';
import { redisClient } from '../../utils/redisClient.js';


// Strategy: Prevent brute-force while remaining vague to attackers.
export const loginLimiter = rateLimit({
    // 1. Use Redis as the "Source of Truth" for all Docker containers
    store: new RedisStore ({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:login', //distinct namespace in Redis

    }),

    windowMs: 15 * 60 * 1000, //15 minute window 
    max: 5, //limit each Ip to 5 attempts per window

     //TRICKY RESPONSE (Obscurity)
    // We avoid "Too many requests". We make it look like a system-level throttle.
    handler: (req, res) => {
        console.warn(`[SECURITY] Rate limit triggered for IP: ${req.ip}`);
        
        res.status(403).json({ // 403 Forbidden is more intimidating than 429
            status: "denied",
            message: "Security validation in progress. Access temporarily restricted.",
            code: "SEC-THR-01" // A fake error code to confuse automated tools
        });
    },

    // Standard headers to help honest clients, but can be disabled to hide from hackers
    standardHeaders: true,
    legacyHeaders: false,

    // In some high-security apps, we count EVERY hit, even successes, 
    // to stop "Account Takeover" scripts that already have valid passwords.
    skipSuccessfulRequests: false, 
})