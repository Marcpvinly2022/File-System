import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../utils/redisClient.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../utils/emailQueue.js';

export const registerUser = async (req, res, data) => {
    
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            // res.statusCode = 400;
            // return res.end(JSON.stringify({ message: "All fields required" }));
            return res.status(400).json({ message: "All fields required" });
        }

        // 2. Advanced Sanitization (Defense against Blind SQLi/Probing)
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();

        // 3. Check for existence (Parameterized)
        const userExist = await pool.query(
            'SELECT 1 FROM users WHERE email = $1 OR username = $2 LIMIT 1', 
            [cleanEmail, cleanUsername]
        );

        
        if (userExist.rows.length > 0) {
            return res.status(409).json({ error: "Email or Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );
        // Offload execution instantly to Background Thread Core
        await sendWelcomeEmail({ email: email, name: username })

        return res.status(201).json({ message: "User Registered", id: result.rows[0].id });
        // res.end(JSON.stringify({ message: "User Registered", id: result.rows[0].id }));
    } catch (err) {
        console.error("Registration Error", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}