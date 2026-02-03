const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ORDERS_FILE = path.join(__dirname, 'pending-orders.json');

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
};

// Serve static files
const serveStatic = (req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
};

// Handle order notification
const handleOrder = (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const order = JSON.parse(body);
            
            // Save to pending orders file for cron to pick up
            let orders = [];
            if (fs.existsSync(ORDERS_FILE)) {
                orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
            }
            orders.push({
                ...order,
                notified: false,
                createdAt: new Date().toISOString()
            });
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

            console.log('📦 New order received:', order.orderId);
            
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true }));
        } catch (e) {
            console.error('Order error:', e);
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid order data' }));
        }
    });
};

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/order') {
        handleOrder(req, res);
    } else {
        serveStatic(req, res);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🦞 Mena Flower Server running at http://0.0.0.0:${PORT}`);
    console.log(`📦 Orders will be saved to ${ORDERS_FILE}`);
});
