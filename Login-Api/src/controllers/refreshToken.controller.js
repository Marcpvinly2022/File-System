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
        const refreshToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '2m' })

        return res.status(200).json({
            refreshToken: refreshToken
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