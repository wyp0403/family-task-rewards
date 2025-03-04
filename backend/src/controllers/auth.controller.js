const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

/**
 * 身份验证控制器
 */
const AuthController = {
  /**
   * 用户注册
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async register(req, res) {
    try {
      const { username, password, fullName, role, familyId } = req.body;
      
      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'ユーザー名は既に使用されています' // 用户名已被使用
        });
      }
      
      // 密码加密
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 创建新用户
      const newUser = await UserModel.create({
        username,
        password: hashedPassword,
        fullName,
        role, // 'parent' 或 'child'
        familyId,
        points: 0
      });
      
      // 生成JWT令牌
      const token = jwt.sign(
        { id: newUser.id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        success: true,
        message: '登録成功', // 注册成功
        data: {
          token,
          user: userWithoutPassword
        }
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 用户登录
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'ユーザー名またはパスワードが正しくありません' // 用户名或密码不正确
        });
      }
      
      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'ユーザー名またはパスワードが正しくありません' // 用户名或密码不正确
        });
      }
      
      // 生成JWT令牌
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        message: 'ログイン成功', // 登录成功
        data: {
          token,
          user: userWithoutPassword
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取当前用户信息
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      
      // 查找用户
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ユーザーが見つかりません' // 用户不存在
        });
      }
      
      // 返回用户信息（不包含密码）
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  }
};

module.exports = AuthController;