import http from 'http';
import { registerUser, loginUser, refreshUser, logoutUser } from './src/controllers/authController.js';
import {adminOnly, userOrAdmin} from './src/midddlewares/roleHandler.middleware.js';
import { authenticate } from './src/midddlewares/auth.middleware.js';
import {authorize} from './src/midddlewares/role.middleware.js';



const getBody = (request) => new Promise((resolve) => {
    let body = '';
    request.on('data', chunk => body += chunk.toString());
    request.on('end', () => resolve(JSON.parse(body || '{}')));
});

console.log("route hit");
console.log("inside authenticate");
console.log("inside authorize");
console.log("inside handler");

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
 
    try {
        const body = (req.method === 'POST') ? await getBody(req) : null;

        if (req.url === '/api/register' && req.method === 'POST') {
            await registerUser(req, res, body);
        } 
        else if (req.url === '/api/login' && req.method === 'POST') {
            await loginUser(req, res, body);
        } 
        else if (req.url === '/api/logout' && req.method === 'POST') {
            await logoutUser(req, res, body);
        } 
        else if (req.url === '/api/refresh' && req.method === 'POST') {
            await refreshUser(req, res);
        } 

        // New protected routes
    else if (req.url === '/api/admin' && req.method === 'GET') {
      await authenticate(
        authorize('admin')(adminOnly)
      )(req, res);
    }
    else if (req.url === '/api/protected' && req.method === 'GET') {
      await authenticate(
        authorize('admin', 'user')(userOrAdmin)
      )(req, res);
    }
        else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
    } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
});

server.listen(6000, () => console.log('Server running on port 6000'));
