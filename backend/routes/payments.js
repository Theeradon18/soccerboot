const express = require('express');
const router = express.Router();
const db = require('../database/db');

// =========================================================================
// 1. POST /payments/slip - อัปโหลดสลิปชำระเงินใหม่
// =========================================================================
router.post('/slip', async (req, res) => {
  try {
    const { orderId, slipUrl } = req.body;

    if (!orderId || !slipUrl) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ orderId และแนบรูปภาพสลิป'
      });
    }

    const updatedOrder = await db.uploadPaymentSlip(orderId, slipUrl);
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำสั่งซื้อที่ระบุ' });
    }

    return res.json({
      success: true,
      message: 'แนบสลิปเรียบร้อย รอเจ้าหน้าที่ตรวจสอบยอดเงิน',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Slip upload error:', err);
    return res.status(500).json({ success: false, message: 'Error uploading payment slip' });
  }
});

// =========================================================================
// 2. GET /payments/admin - รายการตรวจสอบสลิปทั้งหมด
// =========================================================================
router.get('/admin', async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    // Filter orders that have payment slip or waiting for verification
    const paymentsList = orders.map(o => ({
      id: o.id,
      orderId: o.id,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      amount: o.total,
      paymentMethod: o.paymentMethod,
      paymentSlip: o.paymentSlip,
      paymentSlipUrl: o.paymentSlip,
      status: o.paymentStatus,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      rejectReason: o.rejectReason,
      createdAt: o.createdAt
    }));

    return res.json(paymentsList);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading payments' });
  }
});

// =========================================================================
// 3. PUT /payments/:id/approve - อนุมัติการชำระเงิน
// =========================================================================
router.put('/:id/approve', async (req, res) => {
  try {
    const updated = await db.approvePayment(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      message: 'อนุมัติยอดชำระเงินเรียบร้อย คำสั่งซื้อเปลี่ยนเป็น Processing',
      order: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error approving payment' });
  }
});

// =========================================================================
// 4. PUT /payments/:id/reject - ปฏิเสธสลิปชำระเงินพร้อมระบุเหตุผล
// =========================================================================
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const updated = await db.rejectPayment(req.params.id, reason || 'สลิปการโอนเงินไม่ถูกต้อง หรือยอดเงินไม่ตรง');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      message: 'ปฏิเสธสลิปเรียบร้อย ลูกค้าจะได้รับการแจ้งเตือนเพื่อแนบสลิปใหม่',
      order: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error rejecting payment' });
  }
});

module.exports = router;
