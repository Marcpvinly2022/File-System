import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

// import { parseCookie } from '../../utils/refreshToken_helper.js';
import { redisClient } from '../../utils/redisClient.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../utils/emailQueue.js';

// Logic for User Registration
export const registerUser = async (req, res, data) => {
    console.log("Incoming Payload Data:", req.body);
    console.log("Incoming Payload Data:", req.data);
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            // res.statusCode = 400;
            // return res.end(JSON.stringify({ message: "All fields required" }));
            return res.status(400).json({ message: "All fields required" });
        }

        if (!email.includes('@') || !email.includes('.com')) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if user exists
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
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

// Logic for User Login
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
        if (!email.includes('@') || !email.includes('.com')) {
            return res.status(400).json({
                error: "Invalid email address format structure"
            });
        }



        // Clean up string trailing/leading whitespaces safely
        const cleanEmail = email.trim().toLowerCase();
        const result = await pool.query('SELECT * FROM users WHERE email=$1', [cleanEmail]);
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



//refresh token logic
export const refreshUser = async (req, res, data) => {
    const cookies = parseCookie(req);
    // console.log("Cookies received by server:", cookies);
    const refreshToken = cookies.refreshToken

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
    }
    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
        // Generate a fresh access token
        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '2m' })

        return res.status(200).json({
            accessToken: newAccessToken
        });
    }
    catch (error) {
        // This tells the browser: "The token you sent is bad, DELETE IT NOW."
        res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0');

        // res.statusCode = 401;
        // res.end(JSON.stringify({ error: "Session expired, please login again" }));
        return res.status(401).json({ error: "Session expired, please login again" });
    }
}


/*--------------forgetPassword-----------------*/
export const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: " email input required"
            });
        }

        if (!email.includes('@') || !email.includes('.com')) {
            return res.status(400).json({
                message: "invalid email format"
            });
        }

        const rawResetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

        // 3. Define token expiration window (Strictly 15 minutes from now)
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);
        const result = await pool.query(
            `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3 RETURNING username`,
            [hashedToken, tokenExpires, email]
        );
        if (result.rows.length === 0) {
            console.log(`[Security Alert]: Reset requested for non-existent email: ${email}`);
            return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent" });
        }

        const resetLink = `https://vercel.app{rawResetToken}`;

        // 7. Offload email dispatch operation to the background BullMQ thread cluster
        await sendPasswordResetEmail(email, resetLink);
        return res.status(200).json({
            message: "If that email exists in our system, a password reset link has been sent.",
            hrawResetToken: rawResetToken
        });


    } catch (error) {
        console.error("Forget Password Error", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token string and newPassword fields are required" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        // Hash the incoming raw token to cross-reference it with the database record hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Query for a user with a matching token that hasn't expired yet
        const result = await pool.query(
            `SELECT * FROM users 
             WHERE reset_password_token = $1 AND reset_password_expires > NOW()`,
            [hashedToken]
        );

        const user = result.rows[0];

        // Fail securely if token is invalid or expired
        if (!user) {
            return res.status(400).json({ error: "Password reset token is invalid or has expired" });
        }

        // Securely hash the new user password string
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 5. Commit changes to storage and immediately NULL out the token fields so they can't be reused (Replay attack protection)
        await pool.query(
            `UPDATE users 
             SET password = $1, reset_password_token = NULL, reset_password_expires = NULL 
             WHERE id = $2`,
            [hashedNewPassword, user.id]
        );

        return res.status(200).json({ message: "Password updated successfully. Please log in with your new credentials." });

    } catch (error) {
        next(error);
    }
};