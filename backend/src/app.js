const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 检查必要的环境变量
console.log('检查环境变量:');
console.log('PORT:', process.env.PORT || '5000 (默认值)');
console.log('NODE_ENV:', process.env.NODE_ENV || '未设置');
console.log('FIREBASE_PROJECT_ID 是否存在:', !!process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL 是否存在:', !!process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY 是否存在:', !!process.env.FIREBASE_PRIVATE_KEY);
console.log('FIREBASE_SERVICE_ACCOUNT_JSON 是否存在:', !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// 初始化应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 根路由 - 即使 Firebase 初始化失败也能响应
app.get('/', (req, res) => {
  res.json({ 
    message: '家庭任务积分兑换小程序API服务',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'running'
  });
});

// 尝试初始化 Firebase
let firebaseInitialized = false;
try {
  console.log('尝试导入 Firebase 模块...');
  const { admin, db } = require('./utils/firebase');
  
  if (admin && db) {
    console.log('Firebase 初始化成功，加载路由...');
    firebaseInitialized = true;
    
    // 导入路由
    const authRoutes = require('./routes/auth.routes');
    const taskRoutes = require('./routes/task.routes');
    const pointRoutes = require('./routes/point.routes');
    const rewardRoutes = require('./routes/reward.routes');
    
    // API路由
    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/points', pointRoutes);
    app.use('/api/rewards', rewardRoutes);
    
    console.log('所有路由加载成功');
  } else {
    console.error('Firebase 对象为空，无法加载业务路由');
    
    // 为所有 API 路由返回服务不可用的响应
    app.use('/api/*', (req, res) => {
      res.status(503).json({
        success: false,
        message: '服务暂时不可用，Firebase 初始化失败',
        error: 'Firebase initialization failed'
      });
    });
  }
} catch (error) {
  console.error('加载 Firebase 或路由时出错:', error);
  
  // 为所有 API 路由返回服务不可用的响应
  app.use('/api/*', (req, res) => {
    res.status(503).json({
      success: false,
      message: '服务暂时不可用，请稍后再试',
      error: 'Service temporarily unavailable'
    });
  });
}

// 状态端点 - 显示 Firebase 初始化状态
app.get('/status', (req, res) => {
  res.json({
    status: firebaseInitialized ? 'fully_operational' : 'degraded',
    firebase_initialized: firebaseInitialized,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 捕获 404 错误
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '找不到请求的资源'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('应用错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 不要立即退出，让日志有时间写入
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`Firebase 初始化状态: ${firebaseInitialized ? '成功' : '失败'}`);
  if (!firebaseInitialized) {
    console.log('警告: 服务以降级模式运行，API 功能不可用');
  }
});

module.exports = app;