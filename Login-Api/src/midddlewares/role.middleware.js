export const authorize = (...allowedRoles) => {
  return (handler) => {
    return async (req, res) => {
      const userRole = req.user?.role;

      if (!userRole) {
        res.statusCode = 401;
        return res.end(JSON.stringify({
          error: "Not authenticated"
        }));
      }

      if (!allowedRoles.includes(userRole)) {
        res.statusCode = 403;
        return res.end(JSON.stringify({
          error: "Forbidden: Role insufficient"
        }));
      }

      return await handler(req, res);
    };
  };
};