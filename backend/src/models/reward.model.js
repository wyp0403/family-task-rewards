const { db } = require('../utils/firebase');

const rewardsCollection = db.collection('rewards');
const rewardHistoryCollection = db.collection('rewardHistory');

/**
 * 奖品模型
 */
const RewardModel = {
  /**
   * 创建新奖品
   * @param {Object} rewardData - 奖品数据
   * @returns {Promise<Object>} - 创建的奖品对象
   */
  async create(rewardData) {
    const rewardRef = await rewardsCollection.add({
      ...rewardData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const reward = await rewardRef.get();
    return { id: reward.id, ...reward.data() };
  },

  /**
   * 通过ID获取奖品
   * @param {string} id - 奖品ID
   * @returns {Promise<Object|null>} - 奖品对象或null
   */
  async findById(id) {
    const reward = await rewardsCollection.doc(id).get();
    if (!reward.exists) return null;
    return { id: reward.id, ...reward.data() };
  },

  /**
   * 获取家庭的所有奖品
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 奖品列表
   */
  async findByFamilyId(familyId) {
    const snapshot = await rewardsCollection.where('familyId', '==', familyId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * 更新奖品信息
   * @param {string} id - 奖品ID
   * @param {Object} rewardData - 要更新的奖品数据
   * @returns {Promise<Object>} - 更新后的奖品对象
   */
  async update(id, rewardData) {
    await rewardsCollection.doc(id).update({
      ...rewardData,
      updatedAt: new Date()
    });
    
    return this.findById(id);
  },

  /**
   * 删除奖品
   * @param {string} id - 奖品ID
   * @returns {Promise<boolean>} - 是否成功删除
   */
  async delete(id) {
    await rewardsCollection.doc(id).delete();
    return true;
  },

  /**
   * 兑换奖品
   * @param {string} rewardId - 奖品ID
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} - 兑换记录
   */
  async redeemReward(rewardId, userId) {
    // 获取奖品信息
    const reward = await this.findById(rewardId);
    if (!reward) {
      throw new Error('奖品不存在');
    }
    
    // 更新库存
    if (reward.stock !== undefined && reward.stock > 0) {
      await rewardsCollection.doc(rewardId).update({
        stock: reward.stock - 1,
        updatedAt: new Date()
      });
    }
    
    // 记录兑换历史
    const historyRef = await rewardHistoryCollection.add({
      rewardId,
      userId,
      rewardName: reward.name,
      pointsCost: reward.points,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const history = await historyRef.get();
    return { id: history.id, ...history.data() };
  },

  /**
   * 更新兑换状态
   * @param {string} historyId - 兑换历史ID
   * @param {string} status - 新状态
   * @returns {Promise<Object>} - 更新后的兑换记录
   */
  async updateRedeemStatus(historyId, status) {
    await rewardHistoryCollection.doc(historyId).update({
      status,
      updatedAt: new Date()
    });
    
    const history = await rewardHistoryCollection.doc(historyId).get();
    return { id: history.id, ...history.data() };
  },

  /**
   * 获取用户的兑换历史
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 兑换历史记录
   */
  async getUserRedeemHistory(userId) {
    const snapshot = await rewardHistoryCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * 获取家庭的兑换历史
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 兑换历史记录
   */
  async getFamilyRedeemHistory(familyId) {
    // 先获取该家庭的所有奖品ID
    const rewards = await this.findByFamilyId(familyId);
    const rewardIds = rewards.map(reward => reward.id);
    
    if (rewardIds.length === 0) {
      return [];
    }
    
    // 查询这些奖品的兑换记录
    const snapshot = await rewardHistoryCollection
      .where('rewardId', 'in', rewardIds)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = RewardModel;