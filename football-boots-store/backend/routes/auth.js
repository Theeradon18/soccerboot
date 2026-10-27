const express = require('express');
const router = express.Router();

// Mock Auth endpoint
// Username: admin
// Password: 1234
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอก Username และ Password'
    });
  }

  // Check credentials
  if (username.trim() === 'admin' && password === '1234') {
    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token: 'football-boots-jwt-token-admin',
      user: {
        username: 'admin',
        role: 'Admin',
        name: 'Store Manager'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Username หรือ Password ไม่ถูกต้อง'
  });
});

module.exports = router;
