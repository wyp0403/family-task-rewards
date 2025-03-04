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
      const response = await apiClient.post('/auth/login', { username, password })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} - 包含token和用户信息的对象
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      return response
    } catch (error) {
      throw error
    }
  }
}

export default AuthService