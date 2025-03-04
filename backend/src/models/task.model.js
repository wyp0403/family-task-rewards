const { db } = require('../utils/firebase');

const tasksCollection = db.collection('tasks');

/**
 * 任务模型
 */
const TaskModel = {
  /**
   * 创建新任务
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>} - 创建的任务对象
   */
  async create(taskData) {
    const taskRef = await tasksCollection.add({
      ...taskData,
      status: 'pending', // pending, completed, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const task = await taskRef.get();
    return { id: task.id, ...task.data() };
  },

  /**
   * 通过ID获取任务
   * @param {string} id - 任务ID
   * @returns {Promise<Object|null>} - 任务对象或null
   */
  async findById(id) {
    const task = await tasksCollection.doc(id).get();
    if (!task.exists) return null;
    return { id: task.id, ...task.data() };
  },

  /**
   * 获取家庭的所有任务
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 任务列表
   */
  async findByFamilyId(familyId) {
    const snapshot = await tasksCollection.where('familyId', '==', familyId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * 获取指定用户的任务
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 任务列表
   */
  async findByUserId(userId) {
    const snapshot = await tasksCollection.where('assignedTo', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * 更新任务状态
   * @param {string} id - 任务ID
   * @param {string} status - 新状态
   * @param {Object} updateData - 其他要更新的数据
   * @returns {Promise<Object>} - 更新后的任务对象
   */
  async updateStatus(id, status, updateData = {}) {
    await tasksCollection.doc(id).update({
      status,
      ...updateData,
      updatedAt: new Date()
    });
    
    return this.findById(id);
  },

  /**
   * 更新任务信息
   * @param {string} id - 任务ID
   * @param {Object} taskData - 要更新的任务数据
   * @returns {Promise<Object>} - 更新后的任务对象
   */
  async update(id, taskData) {
    await tasksCollection.doc(id).update({
      ...taskData,
      updatedAt: new Date()
    });
    
    return this.findById(id);
  },

  /**
   * 删除任务
   * @param {string} id - 任务ID
   * @returns {Promise<boolean>} - 是否成功删除
   */
  async delete(id) {
    await tasksCollection.doc(id).delete();
    return true;
  }
};

module.exports = TaskModel;