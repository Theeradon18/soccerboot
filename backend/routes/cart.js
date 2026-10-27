const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /cart/:userId
router.get('/:userId', async (req, res) => {
  try {
    const items = await db.getUserCart(req.params.userId);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading cart' });
  }
});

// POST /cart - Save entire cart or add item
router.post('/', async (req, res) => {
  try {
    const { userId, items, item } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    let updatedCart = [];
    if (items) {
      updatedCart = await db.saveUserCart(userId, items);
    } else if (item) {
      const current = await db.getUserCart(userId);
      // Check if same product + size exists
      const existingIdx = current.findIndex(
        i => String(i.productId) === String(item.productId) && String(i.size) === String(item.size)
      );

      if (existingIdx !== -1) {
        current[existingIdx].quantity += (item.quantity || 1);
      } else {
        current.push({
          id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          ...item
        });
      }
      updatedCart = await db.saveUserCart(userId, current);
    }

    return res.json({ success: true, cart: updatedCart });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating cart' });
  }
});

// DELETE /cart/clear/:userId
router.delete('/clear/:userId', async (req, res) => {
  try {
    await db.clearUserCart(req.params.userId);
    return res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error clearing cart' });
  }
});

// DELETE /cart/:id
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const current = await db.getUserCart(userId);
      const filtered = current.filter(i => String(i.id) !== String(req.params.id));
      await db.saveUserCart(userId, filtered);
      return res.json({ success: true, cart: filtered });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error removing item' });
  }
});

module.exports = router;
