const fs = require('fs');
const path = require('path');
const remotePma = require('./remotePma');

// =========================================================================
// ⚽ 1. INITIAL SAMPLE DATA
// =========================================================================
const initialProducts = [
  {
    id: '1',
    name: 'Nike Air Zoom Mercurial Vapor 16 Elite',
    brand: 'Nike',
    model: 'Vapor 16 Elite FG',
    price: 8900,
    color: 'Volt / Black',
    size: '42 EU / 8.5 US',
    stock: 15,
    category: 'FG Football Boots',
    description: 'รองเท้าสตั๊ดสายความเร็วระดับท็อป น้ำหนักเบาพร้อมเทคโนโลยี Air Zoom 3/4 ตอบสนองการสปีดและเปลี่ยนทิศทางอย่างรวดเร็ว',
    image_url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Adidas Predator Elite FT',
    brand: 'Adidas',
    model: 'Predator Elite FT FG',
    price: 9500,
    color: 'Core Black / Solar Red',
    size: '41.5 EU / 8 US',
    stock: 10,
    category: 'FG Football Boots',
    description: 'รองเท้าสายคอนโทรลระดับตำนาน ลิ้นพับสุดคลาสสิก พร้อมยาง Strikeskin ยิงลูกฟุตบอลได้แม่นยำและปั่นโค้งได้อย่างใจ',
    image_url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Mizuno Morelia Neo IV Beta Japan',
    brand: 'Mizuno',
    model: 'Neo IV Beta FG',
    price: 9200,
    color: 'White / Gold',
    size: '42 EU / 8.5 US',
    stock: 8,
    category: 'FG Football Boots',
    description: 'ผลิตในประเทศญี่ปุ่น หนังจิงโจ้เกรดพรีเมียม สัมผัสนุ่มสบายเท้า ทนทาน และน้ำหนักเบาเป็นพิเศษ',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Puma Future 7 Ultimate',
    brand: 'Puma',
    model: 'Future 7 Ultimate AG',
    price: 7800,
    color: 'Pink / Black',
    size: '42.5 EU / 9 US',
    stock: 12,
    category: 'AG Football Boots',
    description: 'รองเท้าสายคล่องตัว สวมใส่สบายด้วยเทคโนโลยีผ้าถัก FUZIONFIT360 และแถบ PWRTAPE กระชับเท้า สำหรับสนามหญ้าเทียม',
    image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Nike Phantom GX II Pro TF',
    brand: 'Nike',
    model: 'Phantom GX II Pro TF',
    price: 4600,
    color: 'Black / Chrome',
    size: '41 EU / 7.5 US',
    stock: 20,
    category: 'TF Football Boots',
    description: 'รองเท้าฟุตบอลร้อยปุ่มสำหรับสนามหญ้าเทียม พื้นยางยึดเกาะดีเยี่ยม อัปเปอร์ NikeSkin นุ่มเท้า คล่องตัว',
    image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  }
];

const initialUsers = [
  {
    id: 'u1',
    full_name: 'Store Manager',
    username: 'admin',
    email: 'admin@bootzone.com',
    password: '1234',
    phone: '0812345678',
    role: 'admin',
    address: '123 BootZone HQ, Arena Road, Bangkok 10110',
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'u2',
    full_name: 'Thanapat Footballer',
    username: 'customer1',
    email: 'customer1@gmail.com',
    password: '123456',
    phone: '0898765432',
    role: 'customer',
    address: '456 Sukhumvit Soi 55, Khlong Tan, Watthana, Bangkok 10110',
    created_at: '2026-01-02T00:00:00.000Z'
  }
];

const initialOrders = [
  {
    id: '#BZ20260001',
    userId: 'u2',
    customerName: 'Thanapat Footballer',
    customerEmail: 'customer1@gmail.com',
    customerPhone: '0898765432',
    items: [
      {
        id: 'c1',
        productId: '1',
        name: 'Nike Air Zoom Mercurial Vapor 16 Elite',
        brand: 'Nike',
        model: 'Vapor 16 Elite FG',
        size: '42',
        price: 8900,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 8900,
    shipping: 50,
    total: 8950,
    shippingAddress: {
      fullName: 'Thanapat Footballer',
      phone: '0898765432',
      address: '456 Sukhumvit Soi 55',
      district: 'Watthana',
      province: 'Bangkok',
      postalCode: '10110'
    },
    paymentMethod: 'PromptPay',
    paymentSlip: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    rejectReason: '',
    createdAt: '2026-09-17T10:30:00.000Z'
  }
];

// File Paths for local JSON stores
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const CARTS_FILE = path.join(__dirname, 'carts.json');
const PAYMENTS_FILE = path.join(__dirname, 'payments.json');

// Helper to read JSON file safely
function readJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

// Helper to write JSON file safely
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

// SQL Escape helper
function escapeSql(val) {
  if (val === null || val === undefined) return "NULL";
  return `'${String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0": return "\\0";
      case "\x08": return "\\b";
      case "\x09": return "\\t";
      case "\x1a": return "\\z";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  })}'`;
}

let lastSyncTime = 0;

async function syncWithRemoteDatabase() {
  try {
    const remoteProducts = await remotePma.fetchRemoteProducts();
    if (!remoteProducts) return;

    lastSyncTime = Date.now();
    const localProducts = readJson(PRODUCTS_FILE, initialProducts);
    const remoteIdSet = new Set(remoteProducts.map(p => String(p.id)));

    // 1. Remove products that were deleted in phpMyAdmin
    const beforeCount = localProducts.length;
    let updatedLocal = localProducts.filter(p => remoteIdSet.has(String(p.id)));

    // 2. Update existing products or add new ones from phpMyAdmin
    for (const remote of remoteProducts) {
      const existingIndex = updatedLocal.findIndex(p => String(p.id) === String(remote.id));
      if (existingIndex !== -1) {
        updatedLocal[existingIndex] = {
          ...updatedLocal[existingIndex],
          name: remote.name,
          brand: remote.brand,
          model: remote.model,
          price: remote.price,
          color: remote.color,
          size: remote.size,
          stock: remote.stock,
          category: remote.category,
        };
      } else {
        updatedLocal.unshift({
          id: String(remote.id),
          name: remote.name,
          brand: remote.brand,
          model: remote.model,
          price: remote.price,
          color: remote.color,
          size: remote.size,
          stock: remote.stock,
          category: remote.category,
          description: '',
          image_url: '',
          created_at: new Date().toISOString()
        });
      }
    }

    writeJson(PRODUCTS_FILE, updatedLocal);
    if (beforeCount !== updatedLocal.length) {
      console.log(`🔄 Synced with phpMyAdmin: Product count changed from ${beforeCount} to ${updatedLocal.length} (Deleted items removed!)`);
    }
  } catch (err) {
    console.error('Error syncing with phpMyAdmin:', err.message);
  }
}

async function initDB() {
  readJson(PRODUCTS_FILE, initialProducts);
  readJson(USERS_FILE, initialUsers);
  readJson(ORDERS_FILE, initialOrders);
  readJson(CARTS_FILE, {});
  readJson(PAYMENTS_FILE, []);
  
  // Pre-authenticate and perform initial sync
  remotePma.login().then(() => {
    syncWithRemoteDatabase();
  }).catch(e => console.log('Remote PMA init error:', e.message));

  // Background auto-sync every 3 seconds so deletions in phpMyAdmin reflect automatically
  setInterval(() => {
    syncWithRemoteDatabase();
  }, 3000);
}

// =========================================================================
// ⚽ DATA ACCESS METHODS
// =========================================================================
const db = {
  initDB,
  syncWithRemoteDatabase,

  // -------------------------------------------------------------
  // 1. PRODUCTS
  // -------------------------------------------------------------
  async getAllProducts() {
    // If not synced within 2 seconds, sync now to reflect phpMyAdmin changes
    if (Date.now() - lastSyncTime > 2000) {
      await syncWithRemoteDatabase();
    }
    const products = readJson(PRODUCTS_FILE, initialProducts);
    return [...products].sort((a, b) => Number(b.id) - Number(a.id));
  },

  async getProductById(id) {
    const products = readJson(PRODUCTS_FILE, initialProducts);
    return products.find(p => String(p.id) === String(id)) || null;
  },

  async createProduct(productData) {
    const products = readJson(PRODUCTS_FILE, initialProducts);
    const newId = products.length > 0 ? String(Math.max(...products.map(p => Number(p.id) || 0)) + 1) : '1';
    const newProduct = {
      id: newId,
      name: productData.name,
      brand: productData.brand,
      model: productData.model,
      price: Number(productData.price),
      color: productData.color,
      size: productData.size,
      stock: Number(productData.stock),
      category: productData.category,
      description: productData.description || '',
      image_url: productData.image_url || '',
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    writeJson(PRODUCTS_FILE, products);

    // Sync to phpMyAdmin
    try {
      const sql = `
        INSERT INTO products (id, name, brand, model, price, color, size, stock, category, description, image_url)
        VALUES (
          ${escapeSql(newProduct.id)},
          ${escapeSql(newProduct.name)},
          ${escapeSql(newProduct.brand)},
          ${escapeSql(newProduct.model)},
          ${Number(newProduct.price)},
          ${escapeSql(newProduct.color)},
          ${escapeSql(newProduct.size)},
          ${Number(newProduct.stock)},
          ${escapeSql(newProduct.category)},
          ${escapeSql(newProduct.description)},
          ${escapeSql(newProduct.image_url)}
        );
      `;
      remotePma.executeQuery(sql).catch(err => console.error('Error syncing to PMA:', err.message));
    } catch (err) {
      console.error('PMA sync error:', err);
    }

    return newProduct;
  },

  async updateProduct(id, productData) {
    const products = readJson(PRODUCTS_FILE, initialProducts);
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      name: productData.name !== undefined ? productData.name : products[index].name,
      brand: productData.brand !== undefined ? productData.brand : products[index].brand,
      model: productData.model !== undefined ? productData.model : products[index].model,
      price: productData.price !== undefined ? Number(productData.price) : products[index].price,
      color: productData.color !== undefined ? productData.color : products[index].color,
      size: productData.size !== undefined ? productData.size : products[index].size,
      stock: productData.stock !== undefined ? Number(productData.stock) : products[index].stock,
      category: productData.category !== undefined ? productData.category : products[index].category,
      description: productData.description !== undefined ? productData.description : products[index].description,
      image_url: productData.image_url !== undefined ? productData.image_url : products[index].image_url
    };
    writeJson(PRODUCTS_FILE, products);

    // Sync to phpMyAdmin
    try {
      const p = products[index];
      const sql = `
        UPDATE products
        SET
          name = ${escapeSql(p.name)},
          brand = ${escapeSql(p.brand)},
          model = ${escapeSql(p.model)},
          price = ${Number(p.price)},
          color = ${escapeSql(p.color)},
          size = ${escapeSql(p.size)},
          stock = ${Number(p.stock)},
          category = ${escapeSql(p.category)},
          description = ${escapeSql(p.description)},
          image_url = ${escapeSql(p.image_url)}
        WHERE id = ${escapeSql(id)};
      `;
      remotePma.executeQuery(sql).catch(err => console.error('Error syncing update to PMA:', err.message));
    } catch (err) {
      console.error('PMA update sync error:', err);
    }

    return products[index];
  },

  async deleteProduct(id) {
    const products = readJson(PRODUCTS_FILE, initialProducts);
    const initialLen = products.length;
    const filtered = products.filter(p => String(p.id) !== String(id));
    if (filtered.length !== initialLen) {
      writeJson(PRODUCTS_FILE, filtered);

      // Sync delete to PMA
      try {
        const sql = `DELETE FROM products WHERE id = ${escapeSql(id)};`;
        remotePma.executeQuery(sql).catch(err => console.error('Error syncing delete to PMA:', err.message));
      } catch (err) {
        console.error('PMA delete sync error:', err);
      }

      return true;
    }
    return false;
  },

  // -------------------------------------------------------------
  // 2. USERS & AUTH
  // -------------------------------------------------------------
  async getAllUsers() {
    const users = readJson(USERS_FILE, initialUsers);
    return users.map(({ password, ...rest }) => rest);
  },

  async getUserById(id) {
    const users = readJson(USERS_FILE, initialUsers);
    const user = users.find(u => String(u.id) === String(id));
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },

  async getUserByUsername(username) {
    const users = readJson(USERS_FILE, initialUsers);
    return users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()) || null;
  },

  async getUserByEmail(email) {
    const users = readJson(USERS_FILE, initialUsers);
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  async createUser(userData) {
    const users = readJson(USERS_FILE, initialUsers);
    const newId = 'u' + (users.length + 1);
    const newUser = {
      id: newId,
      full_name: userData.full_name.trim(),
      username: userData.username.trim(),
      email: userData.email.trim(),
      password: userData.password,
      phone: userData.phone ? userData.phone.trim() : '',
      role: 'customer', // Always customer on registration
      address: userData.address ? userData.address.trim() : '',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeJson(USERS_FILE, users);

    const { password, ...safeUser } = newUser;
    return safeUser;
  },

  async updateUser(id, userData) {
    const users = readJson(USERS_FILE, initialUsers);
    const index = users.findIndex(u => String(u.id) === String(id));
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      full_name: userData.full_name !== undefined ? userData.full_name : users[index].full_name,
      phone: userData.phone !== undefined ? userData.phone : users[index].phone,
      address: userData.address !== undefined ? userData.address : users[index].address,
      email: userData.email !== undefined ? userData.email : users[index].email
    };

    writeJson(USERS_FILE, users);
    const { password, ...safeUser } = users[index];
    return safeUser;
  },

  // -------------------------------------------------------------
  // 3. CART SYSTEM
  // -------------------------------------------------------------
  async getUserCart(userId) {
    const carts = readJson(CARTS_FILE, {});
    return carts[userId] || [];
  },

  async saveUserCart(userId, items) {
    const carts = readJson(CARTS_FILE, {});
    carts[userId] = items;
    writeJson(CARTS_FILE, carts);
    return items;
  },

  async clearUserCart(userId) {
    const carts = readJson(CARTS_FILE, {});
    carts[userId] = [];
    writeJson(CARTS_FILE, carts);
    return true;
  },

  // -------------------------------------------------------------
  // 4. ORDERS & STOCK
  // -------------------------------------------------------------
  async getAllOrders() {
    const orders = readJson(ORDERS_FILE, initialOrders);
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrdersByUserId(userId) {
    const orders = readJson(ORDERS_FILE, initialOrders);
    return orders
      .filter(o => String(o.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrderById(id) {
    const orders = readJson(ORDERS_FILE, initialOrders);
    return orders.find(o => String(o.id) === String(id)) || null;
  },

  async createOrder(orderData) {
    const orders = readJson(ORDERS_FILE, initialOrders);
    const products = readJson(PRODUCTS_FILE, initialProducts);

    // Validate Stock and deduct
    for (const item of orderData.items) {
      const p = products.find(prod => String(prod.id) === String(item.productId));
      if (!p) {
        throw new Error(`ไม่พบสินค้ารหัส ${item.productId}`);
      }
      if (p.stock < item.quantity) {
        throw new Error(`สินค้า "${p.name}" สต็อกไม่เพียงพอ (คงเหลือ ${p.stock} คู่)`);
      }
    }

    // Deduct stock
    for (const item of orderData.items) {
      const p = products.find(prod => String(prod.id) === String(item.productId));
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }
    writeJson(PRODUCTS_FILE, products);

    // Generate Order ID: #BZ2026xxxx
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    const orderId = `#BZ${year}${String(count).padStart(4, '0')}`;

    const newOrder = {
      id: orderId,
      userId: orderData.userId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      items: orderData.items,
      subtotal: Number(orderData.subtotal),
      shipping: Number(orderData.shipping || 50),
      total: Number(orderData.total),
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod, // 'Bank Transfer' | 'PromptPay' | 'Cash on Delivery'
      paymentSlip: orderData.paymentSlip || '',
      paymentStatus: orderData.paymentMethod === 'Cash on Delivery' ? 'Pending' : (orderData.paymentSlip ? 'Waiting for Verification' : 'Pending'),
      orderStatus: orderData.paymentMethod === 'Cash on Delivery' ? 'Processing' : 'Pending',
      rejectReason: '',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    writeJson(ORDERS_FILE, orders);

    // Record Payment
    const payments = readJson(PAYMENTS_FILE, []);
    payments.unshift({
      id: 'pay_' + Date.now(),
      orderId: newOrder.id,
      userId: newOrder.userId,
      amount: newOrder.total,
      paymentMethod: newOrder.paymentMethod,
      paymentSlipUrl: newOrder.paymentSlip,
      status: newOrder.paymentStatus,
      rejectReason: '',
      createdAt: newOrder.createdAt
    });
    writeJson(PAYMENTS_FILE, payments);

    return newOrder;
  },

  async updateOrderStatus(orderId, status) {
    const orders = readJson(ORDERS_FILE, initialOrders);
    const index = orders.findIndex(o => String(o.id) === String(orderId));
    if (index === -1) return null;

    orders[index].orderStatus = status;
    writeJson(ORDERS_FILE, orders);
    return orders[index];
  },

  async uploadPaymentSlip(orderId, slipUrl) {
    const orders = readJson(ORDERS_FILE, initialOrders);
    const index = orders.findIndex(o => String(o.id) === String(orderId));
    if (index === -1) return null;

    orders[index].paymentSlip = slipUrl;
    orders[index].paymentStatus = 'Waiting for Verification';
    writeJson(ORDERS_FILE, orders);

    // Update payments
    const payments = readJson(PAYMENTS_FILE, []);
    const pIdx = payments.findIndex(p => p.orderId === orderId);
    if (pIdx !== -1) {
      payments[pIdx].paymentSlipUrl = slipUrl;
      payments[pIdx].status = 'Waiting for Verification';
      writeJson(PAYMENTS_FILE, payments);
    }

    return orders[index];
  },

  async approvePayment(orderId) {
    const orders = readJson(ORDERS_FILE, initialOrders);
    const index = orders.findIndex(o => String(o.id) === String(orderId));
    if (index === -1) return null;

    orders[index].paymentStatus = 'Paid';
    orders[index].orderStatus = 'Processing';
    orders[index].rejectReason = '';
    writeJson(ORDERS_FILE, orders);

    const payments = readJson(PAYMENTS_FILE, []);
    const pIdx = payments.findIndex(p => p.orderId === orderId);
    if (pIdx !== -1) {
      payments[pIdx].status = 'Paid';
      payments[pIdx].rejectReason = '';
      payments[pIdx].verifiedAt = new Date().toISOString();
      writeJson(PAYMENTS_FILE, payments);
    }

    return orders[index];
  },

  async rejectPayment(orderId, reason) {
    const orders = readJson(ORDERS_FILE, initialOrders);
    const index = orders.findIndex(o => String(o.id) === String(orderId));
    if (index === -1) return null;

    orders[index].paymentStatus = 'Rejected';
    orders[index].rejectReason = reason || 'Payment slip is invalid.';
    orders[index].orderStatus = 'Pending';
    writeJson(ORDERS_FILE, orders);

    const payments = readJson(PAYMENTS_FILE, []);
    const pIdx = payments.findIndex(p => p.orderId === orderId);
    if (pIdx !== -1) {
      payments[pIdx].status = 'Rejected';
      payments[pIdx].rejectReason = reason || 'Payment slip is invalid.';
      writeJson(PAYMENTS_FILE, payments);
    }

    return orders[index];
  }
};

module.exports = db;
