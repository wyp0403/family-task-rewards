const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

/**
 * 身份验证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です' // 需要身份验证
      });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ユーザーが見つかりません' // 用户不存在
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      familyId: user.familyId
    };
    
    next();
  } catch (error) {
    console.error('身份验证错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '無効なトークン' // 无效的令牌
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'トークンの有効期限が切れています' // 令牌已过期
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました' // 服务器发生错误
    });
  }
};

/**
 * 角色验证中间件 - 仅允许特定角色访问
 * @param {Array} roles - 允许的角色数组
 */
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です' // 需要身份验证
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '権限がありません' // 没有权限
      });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware
};