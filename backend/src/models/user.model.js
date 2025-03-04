const { db } = require('../utils/firebase');

const usersCollection = db.collection('users');

/**
 * 用户模型
 */
const UserModel = {
  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} - 创建的用户对象
   */
  async create(userData) {
    const userRef = await usersCollection.add({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const user = await userRef.get();
    return { id: user.id, ...user.data() };
  },

  /**
   * 通过ID获取用户
   * @param {string} id - 用户ID
   * @returns {Promise<Object|null>} - 用户对象或null
   */
  async findById(id) {
    const user = await usersCollection.doc(id).get();
    if (!user.exists) return null;
    return { id: user.id, ...user.data() };
  },

  /**
   * 通过用户名获取用户
   * @param {string} username - 用户名
   * @returns {Promise<Object|null>} - 用户对象或null
   */
  async findByUsername(username) {
    const snapshot = await usersCollection.where('username', '==', username).get();
    if (snapshot.empty) return null;
    
    const user = snapshot.docs[0];
    return { id: user.id, ...user.data() };
  },

  /**
   * 更新用户信息
   * @param {string} id - 用户ID
   * @param {Object} userData - 要更新的用户数据
   * @returns {Promise<Object>} - 更新后的用户对象
   */
  async update(id, userData) {
    await usersCollection.doc(id).update({
      ...userData,
      updatedAt: new Date()
    });
    
    return this.findById(id);
  },

  /**
   * 获取家庭成员列表
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 家庭成员列表
   */
  async getFamilyMembers(familyId) {
    const snapshot = await usersCollection.where('familyId', '==', familyId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = UserModel;