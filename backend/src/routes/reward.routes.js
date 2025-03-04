const express = require('express');
const RewardController = require('../controllers/reward.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 所有奖品路由都需要身份验证
router.use(authMiddleware);

// 创建奖品（仅限父母）
router.post('/', roleMiddleware(['parent']), RewardController.createReward);

// 获取家庭的所有奖品
router.get('/family/:familyId', RewardController.getFamilyRewards);

// 更新奖品（仅限父母）
router.put('/:rewardId', roleMiddleware(['parent']), RewardController.updateReward);

// 删除奖品（仅限父母）
router.delete('/:rewardId', roleMiddleware(['parent']), RewardController.deleteReward);

// 兑换奖品
router.post('/:rewardId/redeem', RewardController.redeemReward);

// 更新兑换状态（仅限父母）
router.put('/redeem/:historyId/status', roleMiddleware(['parent']), RewardController.updateRedeemStatus);

// 获取用户的兑换历史
router.get('/redeem/user/:userId?', RewardController.getUserRedeemHistory);

// 获取家庭的兑换历史（仅限父母）
router.get('/redeem/family/:familyId', roleMiddleware(['parent']), RewardController.getFamilyRedeemHistory);

module.exports = router;