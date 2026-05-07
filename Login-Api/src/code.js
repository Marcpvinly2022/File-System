// 1. The Blacklist Store (Use Redis in Production)
const tokenBlacklist = new Set();

// 2. The Logout Handler
export const logoutUser = (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        // Revoke access immediately
        tokenBlacklist.add(token);
    }

    // Kill the Refresh Token cookie
    res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0');
    res.end(JSON.stringify({ message: "Session terminated." }));
};

// 3. The Middleware Guard
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    // Check if token has been revoked
    if (tokenBlacklist.has(token)) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: "Token revoked. Please login again." }));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: "Invalid or expired token" }));
    }
};