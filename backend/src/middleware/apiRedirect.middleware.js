/**
 * 中间件用于处理双重 /api 前缀的请求
 * 这是一个临时解决方案，用于处理前端发送的带有双重 /api 前缀的请求
 */
const apiRedirectMiddleware = (req, res, next) => {
  // 检查是否有双重 /api 前缀
  if (req.path.startsWith('/api/api/')) {
    // 修改请求路径，移除一个 /api 前缀
    req.url = req.url.replace('/api/api/', '/api/');
    console.log(`重定向请求: ${req.originalUrl} -> ${req.url}`);
  }
  next();
};

module.exports = apiRedirectMiddleware;