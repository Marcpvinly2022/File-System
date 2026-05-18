// =========================================================================
// src/controllers/roleHandler.controller.js (Cleaned Up Endpoint Drivers)
// =========================================================================

/**
 * High-Security Administrative Payload Controller Endpoint.
 * Securely shielded upstream by: authorize('admin')
 */
export const adminOnly = (req, res, next) => {
    try {
        // No redundant inner if/else checks required. Upstream guards handled validation entirely.
        return res.status(200).json({
            message: "Successfully accessed secure administrative platform resources.",
            user: {
                id: req.user.id,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Shared Multi-Tier Profile Resource Controller Endpoint.
 * Securely shielded upstream by: authorize('admin', 'user')
 */
export const userOrAdmin = (req, res, next) => {
    try {
        return res.status(200).json({
            message: "Successfully accessed global member resource layer.",
            user: {
                id: req.user.id,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error);
    }
};
