import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

// import { parseCookie } from '../../utils/refreshToken_helper.js';
import { redisClient } from '../../utils/redisClient.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../utils/emailQueue.js';



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