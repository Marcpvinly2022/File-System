// =========================================================================
// src/middlewares/auth.middleware.js (Express Production Implementation)
// =========================================================================
import jwt from 'jsonwebtoken';
import { redisClient } from '../../utils/redisClient.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Defensive Guard: Handle missing or non-Bearer authorization structures instantly
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: "Access denied: Missing or malformed authorization token string" 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Access denied: Token payload empty" });
        }

        // Infrastructure Layer Check: Intercept revoked sessions within Redis
        const isRevoked = await redisClient.get(token);
        if (isRevoked) {
            return res.status(401).json({ 
                error: "Token has been revoked, please login again" 
            });
        }

        // Crypto Verification Layer
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Populate request pipeline context state safely
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            // Advance down the line to authorization blocks or core endpoint handlers
            return next();

        } catch (jwtError) { // FIXED: Variable parameter name matches evaluation block below
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Authentication token has expired" });
            }
            return res.status(401).json({ error: "Invalid authentication token signature" });
        }

    } catch (err) {
        // Bubble infrastructure anomalies safely up to your centralized Express error handling middleware
        next(err);
    }
};
