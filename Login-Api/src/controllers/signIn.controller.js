import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../utils/redisClient.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../utils/emailQueue.js';

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check for missing fields entirely
        if (!email || !password) {
            return res.status(400).json({
                error: "Both email and password fields are strictly required"
            });
        }

        // 2. Client-side format sanity check (Fast failure before hitting DB)
          // Only allow standard email characters. Block anything suspicious early.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }



        // Clean up string trailing/leading whitespaces safely
        const cleanEmail = email.trim().toLowerCase();
        const result = await pool.query(
            'SELECT id, password FROM users WHERE email = $1 LIMIT 1', 
            [cleanEmail]
            );
        const user = result.rows[0];
       
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2m' });
        const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: '1d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,                                // Safeguards against XSS extraction
            secure: process.env.NODE_ENV === 'production',   // Enforces SSL transmission only
            sameSite: 'strict',                            // Mitigates CSRF vulnerabilities
            maxAge: 24 * 60 * 60 * 1000,                   // Strict 1-day lifespan alignment
            path: '/'
        });
        return res.status(200).json({ message: "Login Successful", accessToken });

    } catch (err) {
        console.error("Login Error", err);
    }
};
