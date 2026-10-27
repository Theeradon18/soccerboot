const express = require('express');
const router = express.Router();
const db = require('../database/db');

// =========================================================================
// 1. POST /orders - สร้างคำสั่งซื้อใหม่ (Place Order & Reduce Stock)
// =========================================================================
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      paymentSlip
    } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลคำสั่งซื้อไม่สมบูรณ์ หรือไม่มีสินค้าในตะกร้า'
      });
    }

    if (!shippingAddress || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุที่อยู่จัดส่งให้ครบถ้วน'
      });
    }

    // Require payment slip for Bank Transfer and PromptPay
    if ((paymentMethod === 'Bank Transfer' || paymentMethod === 'PromptPay') && !paymentSlip) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาแนบสลิปหลักฐานการชำระเงิน'
      });
    }

    const newOrder = await db.createOrder({
      userId,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      items,
      subtotal,
      shipping: shipping || 50,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentSlip: paymentSlip || ''
    });

    // Clear user cart upon successful order placement
    await db.clearUserCart(userId);

    return res.status(201).json({
      success: true,
      message: 'สร้างคำสั่งซื้อสำเร็จเรียบร้อย',
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ'
    });
  }
});

// =========================================================================
// 2. GET /orders/detail/:id - ดูรายละเอียดคำสั่งซื้อรายชิ้น
// =========================================================================
router.get('/detail/:id', async (req, res) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading order detail' });
  }
});

// =========================================================================
// 3. GET /orders/:userId - ดูรายการคำสั่งซื้อของลูกค้า
// =========================================================================
router.get('/:userId', async (req, res) => {
  try {
    const orders = await db.getOrdersByUserId(req.params.userId);
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading user orders' });
  }
});

// =========================================================================
// 4. GET /admin/orders - ดูคำสั่งซื้อทั้งหมด (สำหรับแอดมิน)
// =========================================================================
router.get('/admin/all', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading all orders' });
  }
});

// =========================================================================
// 5. PUT /admin/orders/:id/status - อัปเดตสถานะคำสั่งซื้อ (สำหรับแอดมิน)
// =========================================================================
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const updated = await db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      message: `อัปเดตสถานะคำสั่งซื้อเป็น "${status}" เรียบร้อย`,
      order: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating order status' });
  }
});

module.exports = router;
