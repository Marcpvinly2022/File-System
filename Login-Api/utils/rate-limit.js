import rateLimit from 'express-rate-limit';

// Define the rate limiter configuration
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                   // 5 attempts max
    message: { error: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true, 
    legacyHeaders: false, 
});