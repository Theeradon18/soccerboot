const express = require('express');
const cors = require('cors');
const db = require('./database/db');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' })); // Support base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '⚽ Football Boots Store API is running',
    version: '1.0.0',
    endpoints: {
      auth: 'POST /login',
      products: 'GET, POST /products',
      productDetail: 'GET, PUT, DELETE /products/:id'
    }
  });
});

// Routes
app.use('/', authRoutes); // POST /login
app.use('/products', productsRoutes); // CRUD /products

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
    console.log(`⚽ Football Boots Backend Server is LIVE!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔑 Test Account: admin / 1234`);
    console.log(`📦 Available Endpoints:`);
    console.log(`   - POST   http://localhost:${PORT}/login`);
    console.log(`   - GET    http://localhost:${PORT}/products`);
    console.log(`   - POST   http://localhost:${PORT}/products`);
    console.log(`   - GET    http://localhost:${PORT}/products/:id`);
    console.log(`   - PUT    http://localhost:${PORT}/products/:id`);
    console.log(`   - DELETE http://localhost:${PORT}/products/:id`);
    console.log('====================================================');
  });
}

start();
