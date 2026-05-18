
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../utils/redisClient.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../utils/emailQueue.js';

export const tokenBlacklist = new Set();
export const logoutUser = async (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {

        try {
            // Decode to find the expiration time
            const decoded = jwt.decode(token)
            const timeLeft = decoded.exp - Math.floor(Date.now() / 1000); // Time left in seconds

            if (timeLeft > 0) {
                // Store in Redis with the exact remaining lifespan
                // Key: token, Value: 'revoked'
                await redisClient.setEx(token, timeLeft, 'Revoked')

            }
            //tokenBlacklist.add(token);
        } catch (err) {
            console.error("BlackList Error", err)

        }
        // // Add the current access token to the blacklist
        // tokenBlacklist.add(token);
    }

    // res.writeHead(200, {
    //     'Content-Type': 'application/json',
    //     'Set-Cookie': 'refreshToken=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
    // });

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/' });

    // return res.end(JSON.stringify({ message: "Logged out successfully" }));
    return res.status(200).json({ message: "Logged out successfully" });
};

