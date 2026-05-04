import pool from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Logic for User Registration
export const registerUser = async (req, res, data) => {
    const { username, email, password } = data;

    if (!username || !email || !password) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "All fields required" }));
    }

    // Check if user exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExist.rows.length > 0) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: "Email or Username already exists" }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
        [username, email, hashedPassword]
    );

    res.statusCode = 201;
    res.end(JSON.stringify({ message: "User Registered", id: result.rows[0].id }));
};

// Logic for User Login
export const loginUser = async (req, res, data) => {
    const { email, password } = data;

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.statusCode = 200;
        return res.end(JSON.stringify({ message: "Login Successful", token }));
    }

    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Invalid credentials" }));
};
