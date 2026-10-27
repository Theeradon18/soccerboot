const express = require('express');
const cors = require('cors');
const db = require('./database/db');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support high-res slip & image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '⚽ BOOTZONE Football Boots Store API is running',
    version: '2.0.0',
    endpoints: {
      auth: 'POST /login, POST /register, GET /users',
      products: 'GET, POST /products, GET, PUT, DELETE /products/:id',
      cart: 'GET /cart/:userId, POST /cart, DELETE /cart/:id, DELETE /cart/clear/:userId',
      orders: 'POST /orders, GET /orders/:userId, GET /orders/detail/:id, GET /orders/admin/all',
      payments: 'POST /payments/slip, GET /payments/admin, PUT /payments/:id/approve, PUT /payments/:id/reject'
    }
  });
});

// Mount Routes
app.use('/', authRoutes);
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/payments', paymentsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
async function start() {
  await db.initDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`⚽ BOOTZONE Full E-Commerce Server is LIVE!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔑 Demo Admin: admin / 1234`);
    console.log(`👤 Demo Customer: customer1 / 123456`);
    console.log(`📦 Active Routes: /login, /register, /products, /cart, /orders, /payments, /users`);
    console.log('====================================================');
  });
}

start();
