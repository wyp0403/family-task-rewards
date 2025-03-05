import apiClient from './http.service'

const PointService = {
  /**
   * 获取用户积分
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} - 用户积分信息
   */
  async getUserPoints(userId) {
    try {
      return await apiClient.get(`/points/user/${userId}`) // 移除了'/api'
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取用户积分历史
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 积分历史列表
   */
  async getPointHistory(userId) {
    try {
      return await apiClient.get(`/points/history/${userId}`) // 移除了'/api'
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取家庭积分排行榜
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 排行榜数据
   */
  async getFamilyLeaderboard(familyId) {
    try {
      return await apiClient.get(`/points/leaderboard/${familyId}`) // 移除了'/api'
    } catch (error) {
      throw error
    }
  },

  /**
   * 添加积分（仅限父母）
   * @param {string} userId - 用户ID
   * @param {number} amount - 积分数量
   * @param {string} reason - 添加原因
   * @returns {Promise<Object>} - 更新后的积分信息
   */
  async addPoints(userId, amount, reason) {
    try {
      return await apiClient.post('/points/add', { userId, amount, reason }) // 移除了'/api'
    } catch (error) {
      throw error
    }
  },

  /**
   * 扣除积分（仅限父母）
   * @param {string} userId - 用户ID
   * @param {number} amount - 积分数量
   * @param {string} reason - 扣除原因
   * @returns {Promise<Object>} - 更新后的积分信息
   */
  async deductPoints(userId, amount, reason) {
    try {
      return await apiClient.post('/points/deduct', { userId, amount, reason }) // 移除了'/api'
    } catch (error) {
      throw error
    }
  }
}

export default PointService