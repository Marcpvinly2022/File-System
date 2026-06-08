// =========================================================================
// server.js (Enterprise Express Architecture)
// =========================================================================
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {loginLimiter} from './src/midddlewares/rate-limit.middleware.js';
import { loginIdempotency } from './src/midddlewares/idempotency.middleware.js';

// Component Registrations
import { registerUser } from './src/controllers/signUp.controller.js';
import { loginUser } from './src/controllers/signIn.controller.js';
import { logoutUser } from './src/controllers/logout.controller.js';
import { refreshUser } from './src/controllers/refreshToken.controller.js';
import { forgetPassword, resetPassword } from './src/controllers/passwordRest.controller.js';
import { adminOnly, userOrAdmin } from './src/midddlewares/roleHandler.middleware.js';
import { authenticate } from './src/midddlewares/auth.middleware.js';
import { authorize } from './src/midddlewares/role.middleware.js';

dotenv.config();

const app = express();

//  Global Infrastructure Protections
app.use(cookieParser()); // Parses cookies for refresh token handling
app.use(helmet()); // Layer 2026 security headers automatically
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' })); // Replaces your getBody function with DoS stream protection

// Public Authentication Operations
app.post('/api/register', registerUser);
app.post('/api/login', loginLimiter, loginIdempotency, loginUser);
app.post('/api/logout', logoutUser);
app.post('/api/refresh', refreshUser);
app.post('/api/forgot-password', forgetPassword);
app.post('/api/reset-password', resetPassword);

// Protected Enterprise Routes via Pipeline Chaining
// Replaces complex wrapper trees with flat, execution-safe declarative arrays
app.get('/api/admin', authenticate, authorize('admin'), adminOnly);
app.get('/api/protected', authenticate, authorize('admin', 'user'), userOrAdmin);

//  Structural Fallback Route (404 Error Matrix)
app.use((req, res) => {
    res.status(404).json({ error: 'Requested Route Endpoint Not Found' });
});

// Centralized Global Failure Boundary Middleware Interceptor
app.use((err, req, res, next) => {
    console.error('[Fatal Engine App Interception Error]:', err.stack);
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Processing Error' 
            : err.message
    });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`🚀 Industrial Express Engine active on port ${PORT}`));
