import apiClient from './http.service'

const RewardService = {
  /**
   * 获取家庭的所有奖品
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 奖品列表
   */
  async getFamilyRewards(familyId) {
    try {
      return await apiClient.get(`/rewards/family/${familyId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取奖品详情
   * @param {string} rewardId - 奖品ID
   * @returns {Promise<Object>} - 奖品详情
   */
  async getRewardById(rewardId) {
    try {
      // 注意：这个API端点在后端可能需要添加
      return await apiClient.get(`/rewards/${rewardId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * 创建奖品
   * @param {Object} rewardData - 奖品数据
   * @returns {Promise<Object>} - 创建的奖品
   */
  async createReward(rewardData) {
    try {
      return await apiClient.post('/rewards', rewardData)
    } catch (error) {
      throw error
    }
  },

  /**
   * 更新奖品
   * @param {string} rewardId - 奖品ID
   * @param {Object} rewardData - 奖品数据
   * @returns {Promise<Object>} - 更新后的奖品
   */
  async updateReward(rewardId, rewardData) {
    try {
      return await apiClient.put(`/rewards/${rewardId}`, rewardData)
    } catch (error) {
      throw error
    }
  },

  /**
   * 删除奖品
   * @param {string} rewardId - 奖品ID
   * @returns {Promise<boolean>} - 是否成功
   */
  async deleteReward(rewardId) {
    try {
      await apiClient.delete(`/rewards/${rewardId}`)
      return true
    } catch (error) {
      throw error
    }
  },

  /**
   * 兑换奖品
   * @param {string} rewardId - 奖品ID
   * @returns {Promise<Object>} - 兑换记录
   */
  async redeemReward(rewardId) {
    try {
      return await apiClient.post(`/rewards/${rewardId}/redeem`)
    } catch (error) {
      throw error
    }
  },

  /**
   * 更新兑换状态（仅限父母）
   * @param {string} historyId - 兑换历史ID
   * @param {string} status - 新状态
   * @returns {Promise<Object>} - 更新后的兑换记录
   */
  async updateRedeemStatus(historyId, status) {
    try {
      return await apiClient.put(`/rewards/redeem/${historyId}/status`, { status })
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取用户的兑换历史
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 兑换历史列表
   */
  async getUserRedeemHistory(userId) {
    try {
      return await apiClient.get(`/rewards/redeem/user/${userId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取家庭的兑换历史（仅限父母）
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 兑换历史列表
   */
  async getFamilyRedeemHistory(familyId) {
    try {
      return await apiClient.get(`/rewards/redeem/family/${familyId}`)
    } catch (error) {
      throw error
    }
  }
}

export default RewardService