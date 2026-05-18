// =========================================================================
// src/middlewares/role.middleware.js (Express Production Standard)
// =========================================================================

/**
 * Enterprise Role-Based Access Control (RBAC) Guard Middleware
 * Evaluates authenticated session properties against a defined validation matrix.
 */
export const authorize = (...allowedRoles) => {
    // Return a standard Express middleware signature directly to the route execution array
    return (req, res, next) => {
        try {
            // Read the user identity profile attached by your upstream 'authenticate' middleware
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(401).json({ 
                    error: "Access denied: Missing authentication context profile metadata" 
                });
            }

            // Cross-reference user identity against the explicit endpoint validation matrix array
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ 
                    error: "Forbidden: Your assigned permissions are insufficient to access this operational layer" 
                });
            }

            // CRITICAL FIX: The user passed validation checkpoints! Pass execution down the pipeline chain cleanly.
            return next();

        } catch (error) {
            // Escalate system processing bugs securely to the centralized error handler boundary
            next(error);
        }
    };
};
