const { db } = require('../utils/firebase');

const pointsCollection = db.collection('points');
const pointHistoryCollection = db.collection('pointHistory');

/**
 * 积分模型
 */
const PointModel = {
  /**
   * 获取用户积分
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} - 用户积分记录
   */
  async getUserPoints(userId) {
    const pointDoc = await pointsCollection.doc(userId).get();
    
    if (!pointDoc.exists) {
      // 如果用户没有积分记录，创建一个新的
      await pointsCollection.doc(userId).set({
        userId,
        balance: 0,
        updatedAt: new Date()
      });
      return { userId, balance: 0 };
    }
    
    return pointDoc.data();
  },

  /**
   * 添加积分
   * @param {string} userId - 用户ID
   * @param {number} amount - 积分数量
   * @param {string} reason - 添加原因
   * @param {string} taskId - 相关任务ID（可选）
   * @returns {Promise<Object>} - 更新后的用户积分
   */
  async addPoints(userId, amount, reason, taskId = null) {
    const pointRef = pointsCollection.doc(userId);
    const pointDoc = await pointRef.get();
    
    let currentBalance = 0;
    if (pointDoc.exists) {
      currentBalance = pointDoc.data().balance;
    }
    
    const newBalance = currentBalance + amount;
    
    // 更新积分余额
    await pointRef.set({
      userId,
      balance: newBalance,
      updatedAt: new Date()
    }, { merge: true });
    
    // 记录积分历史
    await pointHistoryCollection.add({
      userId,
      amount,
      type: 'add',
      reason,
      taskId,
      balance: newBalance,
      createdAt: new Date()
    });
    
    return { userId, balance: newBalance };
  },

  /**
   * 扣除积分
   * @param {string} userId - 用户ID
   * @param {number} amount - 积分数量
   * @param {string} reason - 扣除原因
   * @param {string} rewardId - 相关奖品ID（可选）
   * @returns {Promise<Object>} - 更新后的用户积分
   */
  async deductPoints(userId, amount, reason, rewardId = null) {
    const pointRef = pointsCollection.doc(userId);
    const pointDoc = await pointRef.get();
    
    if (!pointDoc.exists) {
      throw new Error('用户积分记录不存在');
    }
    
    const currentBalance = pointDoc.data().balance;
    if (currentBalance < amount) {
      throw new Error('积分不足');
    }
    
    const newBalance = currentBalance - amount;
    
    // 更新积分余额
    await pointRef.set({
      userId,
      balance: newBalance,
      updatedAt: new Date()
    }, { merge: true });
    
    // 记录积分历史
    await pointHistoryCollection.add({
      userId,
      amount,
      type: 'deduct',
      reason,
      rewardId,
      balance: newBalance,
      createdAt: new Date()
    });
    
    return { userId, balance: newBalance };
  },

  /**
   * 获取用户积分历史
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 积分历史记录
   */
  async getPointHistory(userId) {
    const snapshot = await pointHistoryCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = PointModel;