export const adminOnly = (req, res) => {
    if (req.user.role !== 'admin') {
        res.statusCode = 403;
        return res.end(JSON.stringify({ error: "Access denied: Admins only",  user: req.user }));
    }else{
        res.statusCode =200;
        return res.end(JSON.stringify({
            message: "Admin resource", user: req.user,
        }))
    }
}
export const userOrAdmin = (req, res)  => {
    res.statusCode= 200;
    return res.end(JSON.stringify({
        message: "User or Admin resource", user: req.user,
    }));
}

// export default {userOrAdmin, adminOnly}