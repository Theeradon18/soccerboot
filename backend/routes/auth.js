const express = require('express');
const router = express.Router();
const db = require('../database/db');

// =========================================================================
// 1. POST /login - เข้าสู่ระบบ (Admin & Customer)
// =========================================================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอก Username หรือ Email และ Password'
      });
    }

    // Lookup user by username or email
    let user = await db.getUserByUsername(username);
    if (!user) {
      user = await db.getUserByEmail(username);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username หรือ Password ไม่ถูกต้อง'
      });
    }

    // Match password
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Username หรือ Password ไม่ถูกต้อง'
      });
    }

    const { password: _, ...safeUser } = user;
    const token = `bootzone-token-${user.role}-${user.id}-${Date.now()}`;

    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// =========================================================================
// 2. POST /register - สมัครสมาชิกใหม่ (บังคับ Role: Customer)
// =========================================================================
router.post('/register', async (req, res) => {
  try {
    const { full_name, username, email, password, phone, address } = req.body;

    // Validation
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อ-นามสกุล (Full Name)' });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้ (Username)' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมล (Email)' });
    }
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    // Check duplicate username
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว กรุณาเลือกชื่ออื่น' });
    }

    // Check duplicate email
    const existingEmail = await db.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกลงทะเบียนแล้ว' });
    }

    // Create user (role is guaranteed to be 'customer' inside db.createUser)
    const newUser = await db.createUser({
      full_name,
      username,
      email,
      password,
      phone: phone || '',
      address: address || ''
    });

    const token = `bootzone-token-customer-${newUser.id}-${Date.now()}`;

    return res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ BOOTZONE!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// =========================================================================
// 3. GET /users - ดูรายชื่อสมาชิกทั้งหมด (Admin User Management)
// =========================================================================
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading users' });
  }
});

// =========================================================================
// 4. GET /users/:id - ข้อมูลผู้ใช้รายบุคคล
// =========================================================================
router.get('/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error loading user' });
  }
});

// =========================================================================
// 5. PUT /users/:id - แก้ไขข้อมูลส่วนตัว
// =========================================================================
router.put('/users/:id', async (req, res) => {
  try {
    const updated = await db.updateUser(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'บันทึกข้อมูลเรียบร้อย', user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

module.exports = router;
