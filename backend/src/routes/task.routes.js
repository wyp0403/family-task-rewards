const express = require('express');
const TaskController = require('../controllers/task.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 所有任务路由都需要身份验证
router.use(authMiddleware);

// 创建任务（仅限父母）
router.post('/', roleMiddleware(['parent']), TaskController.createTask);

// 获取家庭的所有任务
router.get('/family/:familyId', TaskController.getFamilyTasks);

// 获取用户的任务
router.get('/user/:userId?', TaskController.getUserTasks);

// 更新任务状态
router.put('/:taskId/status', TaskController.updateTaskStatus);

// 删除任务（仅限父母）
router.delete('/:taskId', roleMiddleware(['parent']), TaskController.deleteTask);

module.exports = router;