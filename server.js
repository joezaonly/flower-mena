const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ORDERS_FILE = path.join(__dirname, 'pending-orders.json');

// Telegram Bot Config
const TELEGRAM_BOT_TOKEN = '7755880343:AAFAfz8YuSMNL1c3phnFCrpsNk7IGSDFMYY';
const TELEGRAM_CHAT_ID = '-5228386276';

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

// Group items by name and count quantities
const groupItems = (items) => {
    const grouped = {};
    if (!Array.isArray(items)) return [];
    items.forEach(item => {
        if (grouped[item.name]) {
            grouped[item.name].qty += 1;
            grouped[item.name].totalPrice += (item.price || 0);
        } else {
            grouped[item.name] = {
                name: item.name,
                price: item.price || 0,
                qty: 1,
                totalPrice: item.price || 0
            };
        }
    });
    return Object.values(grouped);
};

// Send Telegram notification
const sendTelegramNotification = (order) => {
    try {
        const groupedItems = groupItems(order.items);
        const itemsList = groupedItems.map(i => {
            if (i.qty > 1) {
                return `• ${i.name} x${i.qty} - ฿${i.totalPrice.toLocaleString()}`;
            }
            return `• ${i.name} - ฿${i.price.toLocaleString()}`;
        }).join('\n');

        const message = `🌸 *คำสั่งซื้อใหม่จาก Mena Flower!* 🌸\n\n` +
            `📦 *Order #${order.orderId}*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `👤 *ลูกค้า:* ${order.customer.name}\n` +
            `📱 *เบอร์:* ${order.customer.phone}\n` +
            `📍 *ที่อยู่:* ${order.customer.address}\n` +
            `${order.customer.note ? `📝 *หมายเหตุ:* ${order.customer.note}\n` : ''}` +
            `\n🌹 *รายการสินค้า:*\n${itemsList}\n\n` +
            `💰 *รวมทั้งสิ้น: ฿${(order.total || 0).toLocaleString()}*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `✅ ชำระเงินแล้ว | 🦞 Mena Flower`;

        const postData = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            console.log(`📢 Telegram notification sent! Status: ${res.statusCode}`);
        });

        req.on('error', (e) => {
            console.error(`❌ Telegram error: ${e.message}`);
        });

        req.write(postData);
        req.end();
    } catch (err) {
        console.error('Failed to send notification:', err);
    }
};

// Serve static files
const serveStatic = (req, res) => {
    let urlPath = req.url === '/' ? '/index.html' : req.url;
    let filePath = path.join(__dirname, urlPath);
    
    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

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
            
            // Save to pending orders file
            let orders = [];
            try {
                if (fs.existsSync(ORDERS_FILE)) {
                    orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
                }
            } catch (readErr) {
                console.error('Error reading orders file:', readErr);
            }
            
            orders.push({
                ...order,
                notified: true,
                createdAt: new Date().toISOString()
            });
            
            try {
                fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
            } catch (writeErr) {
                console.error('Error writing orders file:', writeErr);
            }

            console.log('📦 New order received:', order.orderId);
            
            // Send Telegram notification immediately!
            sendTelegramNotification(order);
            
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
    // Global Error Handling
    req.on('error', err => console.error('Request error:', err));
    res.on('error', err => console.error('Response error:', err));

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

process.on('uncaughtException', (err) => {
    console.error('🚨 UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 UNHANDLED REJECTION:', reason);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🦞 Mena Flower Server running at http://0.0.0.0:${PORT}`);
    console.log(`📦 Orders will be saved to ${ORDERS_FILE}`);
    console.log(`📢 Telegram notifications enabled!`);
});
