const TaskModel = require('../models/task.model');
const PointModel = require('../models/point.model');

/**
 * 任务控制器
 */
const TaskController = {
  /**
   * 创建任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async createTask(req, res) {
    try {
      // 检查权限 - 只有父母可以创建任务
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { title, description, points, assignedTo, dueDate, familyId } = req.body;
      
      // 创建新任务
      const newTask = await TaskModel.create({
        title,
        description,
        points: Number(points),
        assignedTo,
        createdBy: req.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        familyId,
        status: 'pending'
      });
      
      res.status(201).json({
        success: true,
        message: 'タスクが作成されました', // 任务已创建
        data: newTask
      });
    } catch (error) {
      console.error('创建任务错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取家庭的所有任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getFamilyTasks(req, res) {
    try {
      const { familyId } = req.params;
      
      // 获取家庭的所有任务
      const tasks = await TaskModel.findByFamilyId(familyId);
      
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('获取任务错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取用户的任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getUserTasks(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // 获取用户的任务
      const tasks = await TaskModel.findByUserId(userId);
      
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('获取用户任务错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 更新任务状态
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async updateTaskStatus(req, res) {
    try {
      const { taskId } = req.params;
      const { status, comment } = req.body;
      
      // 获取任务信息
      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'タスクが見つかりません' // 任务不存在
        });
      }
      
      // 检查权限
      if (req.user.role === 'child') {
        // 孩子只能将任务标记为已完成
        if (status !== 'completed' || task.assignedTo !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: '権限がありません' // 没有权限
          });
        }
      }
      
      // 更新任务状态
      const updatedTask = await TaskModel.updateStatus(taskId, status, { comment });
      
      // 如果任务被标记为已批准，给孩子加积分
      if (status === 'approved' && req.user.role === 'parent') {
        await PointModel.addPoints(
          task.assignedTo,
          task.points,
          `タスク完了: ${task.title}`, // 任务完成
          taskId
        );
      }
      
      res.status(200).json({
        success: true,
        message: 'タスクのステータスが更新されました', // 任务状态已更新
        data: updatedTask
      });
    } catch (error) {
      console.error('更新任务状态错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 删除任务
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async deleteTask(req, res) {
    try {
      // 检查权限 - 只有父母可以删除任务
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { taskId } = req.params;
      
      // 删除任务
      await TaskModel.delete(taskId);
      
      res.status(200).json({
        success: true,
        message: 'タスクが削除されました' // 任务已删除
      });
    } catch (error) {
      console.error('删除任务错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  }
};

module.exports = TaskController;