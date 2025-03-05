import apiClient from './http.service'

const AuthService = {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 包含token和用户信息的对象
   */
  async login(username, password) {
    try {
      console.log('发送登录请求...');
      const response = await apiClient.post('/auth/login', { username, password }); // 移除了'/api'
      console.log('登录响应:', response);
      return response;
    } catch (error) {
      console.error('登录错误详情:', error);
      throw error;
    }
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} - 包含token和用户信息的对象
   */
  async register(userData) {
    try {
      console.log('发送注册请求...');
      const response = await apiClient.post('/auth/register', userData); // 移除了'/api'
      console.log('注册响应:', response);
      return response;
    } catch (error) {
      console.error('注册错误详情:', error);
      throw error;
    }
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async getCurrentUser() {
    try {
      console.log('获取当前用户信息');
      const response = await apiClient.get('/auth/me'); // 移除了'/api'
      console.log('用户信息响应:', response);
      return response;
    } catch (error) {
      console.error('获取用户信息错误:', error);
      throw error;
    }
  }
}

export default AuthService