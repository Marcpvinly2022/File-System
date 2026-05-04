import http from 'http';
import { registerUser, loginUser } from './src/authController.js';

const getBody = (request) => new Promise((resolve) => {
    let body = '';
    request.on('data', chunk => body += chunk.toString());
    request.on('end', () => resolve(JSON.parse(body || '{}')));
});

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const body = (req.method === 'POST') ? await getBody(req) : null;

        if (req.url === '/register' && req.method === 'POST') {
            await registerUser(req, res, body);
        } 
        else if (req.url === '/login' && req.method === 'POST') {
            await loginUser(req, res, body);
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
