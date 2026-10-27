const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /products - List all products
router.get('/', async (req, res) => {
  try {
    const products = await db.getAllProducts();
    const { search } = req.query;

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const filtered = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.model && p.model.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
      return res.json(filtered);
    }

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า' });
  }
});

// GET /products/:id - Get product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'ไม่พบสินค้าที่ระบุ' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า' });
  }
});

// POST /products - Add new product
router.post('/', async (req, res) => {
  try {
    const { name, brand, model, price, color, size, stock, category, description, image_url } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อสินค้า' });
    }
    if (!brand || !brand.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกแบรนด์สินค้า' });
    }
    if (!model || !model.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรุ่นรองเท้า' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'ราคาต้องเป็นตัวเลขที่มากกว่า 0' });
    }
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ success: false, message: 'จำนวนสต็อกต้องเป็นตัวเลข 0 ขึ้นไป' });
    }
    if (!size || !size.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุไซส์รองเท้า' });
    }
    if (!color || !color.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุสีรองเท้า' });
    }

    const created = await db.createProduct({
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      price: Number(price),
      color: color.trim(),
      size: size.trim(),
      stock: Number(stock),
      category: category ? category.trim() : 'FG Football Boots',
      description: description ? description.trim() : '',
      image_url: image_url ? image_url.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'เพิ่มสินค้าสำเร็จเรียบร้อย',
      data: created
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า' });
  }
});

// PUT /products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, brand, model, price, color, size, stock, category, description, image_url } = req.body;

    // Check existing
    const existing = await db.getProductById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
    }

    // Validation
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, message: 'ชื่อสินค้าต้องไม่เป็นค่าว่าง' });
    }
    if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({ success: false, message: 'ราคาต้องเป็นตัวเลขที่มากกว่า 0' });
    }
    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ success: false, message: 'จำนวนสต็อกต้องเป็นตัวเลข 0 ขึ้นไป' });
    }

    const updated = await db.updateProduct(req.params.id, {
      name: name !== undefined ? name.trim() : existing.name,
      brand: brand !== undefined ? brand.trim() : existing.brand,
      model: model !== undefined ? model.trim() : existing.model,
      price: price !== undefined ? Number(price) : existing.price,
      color: color !== undefined ? color.trim() : existing.color,
      size: size !== undefined ? size.trim() : existing.size,
      stock: stock !== undefined ? Number(stock) : existing.stock,
      category: category !== undefined ? category.trim() : existing.category,
      description: description !== undefined ? description.trim() : existing.description,
      image_url: image_url !== undefined ? image_url.trim() : existing.image_url
    });

    res.json({
      success: true,
      message: 'แก้ไขข้อมูลสินค้าสำเร็จ',
      data: updated
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
});

// DELETE /products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'ไม่พบสินค้าที่ต้องการลบ หรือลบไม่สำเร็จ' });
    }

    res.json({
      success: true,
      message: 'ลบสินค้าสำเร็จเรียบร้อย'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบสินค้า' });
  }
});

module.exports = router;
