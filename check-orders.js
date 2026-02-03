#!/usr/bin/env node
// Order checker script - runs periodically to check for new orders and notify Telegram

const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, 'pending-orders.json');
const NOTIFIED_FILE = path.join(__dirname, 'notified-orders.json');

async function checkOrders() {
    if (!fs.existsSync(ORDERS_FILE)) {
        return;
    }

    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    let notified = [];
    if (fs.existsSync(NOTIFIED_FILE)) {
        notified = JSON.parse(fs.readFileSync(NOTIFIED_FILE, 'utf8'));
    }

    const newOrders = orders.filter(o => !notified.includes(o.orderId));

    for (const order of newOrders) {
        console.log(`📦 New order found: #${order.orderId}`);
        console.log(`   Customer: ${order.customer.name}`);
        console.log(`   Phone: ${order.customer.phone}`);
        console.log(`   Items: ${order.itemNames}`);
        console.log(`   Total: ${order.total} THB`);
        
        // Mark as notified
        notified.push(order.orderId);
    }

    if (newOrders.length > 0) {
        fs.writeFileSync(NOTIFIED_FILE, JSON.stringify(notified, null, 2));
    }

    return newOrders;
}

checkOrders();
