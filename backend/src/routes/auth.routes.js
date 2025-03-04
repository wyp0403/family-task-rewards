const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 注册新用户
router.post('/register', AuthController.register);

// 用户登录
router.post('/login', AuthController.login);

// 获取当前用户信息（需要身份验证）
router.get('/me', authMiddleware, AuthController.getCurrentUser);

module.exports = router;