const express = require('express');
const PointController = require('../controllers/point.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 所有积分路由都需要身份验证
router.use(authMiddleware);

// 获取用户积分
router.get('/user/:userId?', PointController.getUserPoints);

// 添加积分（仅限父母）
router.post('/add', roleMiddleware(['parent']), PointController.addPoints);

// 扣除积分（仅限父母）
router.post('/deduct', roleMiddleware(['parent']), PointController.deductPoints);

// 获取用户积分历史
router.get('/history/:userId?', PointController.getPointHistory);

// 获取家庭积分排行榜
router.get('/leaderboard/:familyId', PointController.getFamilyLeaderboard);

module.exports = router;