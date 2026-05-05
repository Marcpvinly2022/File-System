import pool from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { parseCookie } from './refreshToken_helper.js';

// Logic for User Registration
export const registerUser = async (req, res, data) => {
    const { username, email, password } = data;

    if (!username || !email || !password) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "All fields required" }));
    }

    if (!email.includes('@') || !email.includes('.com')) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "Invalid email format" }));
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

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '1d' });
        res.writeHead(200, {
            'Content-Type': "application/json",
            'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; sameSite=strict; max-age = ${7 * 24 * 60 * 60}`

        })
        res.statusCode = 200;
        return res.end(JSON.stringify({ message: "Login Successful", accessToken }));
    }

    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Invalid credentials" }));
};

//refresh token logic
export const refreshUser = async (req, res, data) => {
    const cookies = parseCookie(req);
    // console.log("Cookies received by server:", cookies);
    const refreshToken = cookies.refreshToken 

    if(!refreshToken){
        res.statusCode = 401;
        return res.end(JSON.stringify({
            error: "No refresh token provided"
        }));
    }
try{
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
 // Generate a fresh access token
 const newAccessToken = jwt.sign({id: decoded.id}, process.env.JWT_SECRET, {expiresIn: '2m'})

 res.statusCode = 200;
 res.end(JSON.stringify({
    accessToken: newAccessToken
 }))
}catch(error){
    res.statusCode =400;
    res.end(JSON.stringify({
   error: "Invalid refresh token"
}));
    
}
}