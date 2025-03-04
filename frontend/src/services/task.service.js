import apiClient from './http.service'

const TaskService = {
  /**
   * 获取家庭的所有任务
   * @param {string} familyId - 家庭ID
   * @returns {Promise<Array>} - 任务列表
   */
  async getFamilyTasks(familyId) {
    try {
      return await apiClient.get(`/tasks/family/${familyId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取用户的任务
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} - 任务列表
   */
  async getUserTasks(userId) {
    try {
      return await apiClient.get(`/tasks/user/${userId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取任务详情
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} - 任务详情
   */
  async getTaskById(taskId) {
    try {
      // 注意：这个API端点在后端可能需要添加
      return await apiClient.get(`/tasks/${taskId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * 创建任务
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>} - 创建的任务
   */
  async createTask(taskData) {
    try {
      return await apiClient.post('/tasks', taskData)
    } catch (error) {
      throw error
    }
  },

  /**
   * 更新任务状态
   * @param {string} taskId - 任务ID
   * @param {string} status - 新状态
   * @param {string} comment - 评论（可选）
   * @returns {Promise<Object>} - 更新后的任务
   */
  async updateTaskStatus(taskId, status, comment) {
    try {
      return await apiClient.put(`/tasks/${taskId}/status`, { status, comment })
    } catch (error) {
      throw error
    }
  },

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<boolean>} - 是否成功
   */
  async deleteTask(taskId) {
    try {
      await apiClient.delete(`/tasks/${taskId}`)
      return true
    } catch (error) {
      throw error
    }
  }
}

export default TaskService