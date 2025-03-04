const RewardModel = require('../models/reward.model');
const PointModel = require('../models/point.model');

/**
 * 奖品控制器
 */
const RewardController = {
  /**
   * 创建奖品
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async createReward(req, res) {
    try {
      // 检查权限 - 只有父母可以创建奖品
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { name, description, points, stock, imageUrl, familyId } = req.body;
      
      // 创建新奖品
      const newReward = await RewardModel.create({
        name,
        description,
        points: Number(points),
        stock: stock !== undefined ? Number(stock) : null,
        imageUrl,
        familyId,
        createdBy: req.user.id
      });
      
      res.status(201).json({
        success: true,
        message: '報酬が作成されました', // 奖品已创建
        data: newReward
      });
    } catch (error) {
      console.error('创建奖品错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取家庭的所有奖品
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getFamilyRewards(req, res) {
    try {
      const { familyId } = req.params;
      
      // 获取家庭的所有奖品
      const rewards = await RewardModel.findByFamilyId(familyId);
      
      res.status(200).json({
        success: true,
        data: rewards
      });
    } catch (error) {
      console.error('获取奖品错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 更新奖品
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async updateReward(req, res) {
    try {
      // 检查权限 - 只有父母可以更新奖品
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { rewardId } = req.params;
      const { name, description, points, stock, imageUrl } = req.body;
      
      // 更新奖品
      const updatedReward = await RewardModel.update(rewardId, {
        name,
        description,
        points: points !== undefined ? Number(points) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        imageUrl
      });
      
      res.status(200).json({
        success: true,
        message: '報酬が更新されました', // 奖品已更新
        data: updatedReward
      });
    } catch (error) {
      console.error('更新奖品错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 删除奖品
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async deleteReward(req, res) {
    try {
      // 检查权限 - 只有父母可以删除奖品
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { rewardId } = req.params;
      
      // 删除奖品
      await RewardModel.delete(rewardId);
      
      res.status(200).json({
        success: true,
        message: '報酬が削除されました' // 奖品已删除
      });
    } catch (error) {
      console.error('删除奖品错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 兑换奖品
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async redeemReward(req, res) {
    try {
      const { rewardId } = req.params;
      const userId = req.user.id;
      
      // 获取奖品信息
      const reward = await RewardModel.findById(rewardId);
      if (!reward) {
        return res.status(404).json({
          success: false,
          message: '報酬が見つかりません' // 奖品不存在
        });
      }
      
      // 检查库存
      if (reward.stock !== null && reward.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: '在庫がありません' // 没有库存
        });
      }
      
      // 检查用户积分
      const userPoints = await PointModel.getUserPoints(userId);
      if (userPoints.balance < reward.points) {
        return res.status(400).json({
          success: false,
          message: 'ポイントが不足しています' // 积分不足
        });
      }
      
      // 扣除积分
      await PointModel.deductPoints(
        userId,
        reward.points,
        `報酬交換: ${reward.name}`, // 奖品兑换
        rewardId
      );
      
      // 记录兑换
      const redeemRecord = await RewardModel.redeemReward(rewardId, userId);
      
      res.status(200).json({
        success: true,
        message: '報酬が正常に交換されました', // 奖品已成功兑换
        data: redeemRecord
      });
    } catch (error) {
      console.error('兑换奖品错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 更新兑换状态（仅限父母）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async updateRedeemStatus(req, res) {
    try {
      // 检查权限 - 只有父母可以更新兑换状态
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { historyId } = req.params;
      const { status } = req.body;
      
      // 更新兑换状态
      const updatedHistory = await RewardModel.updateRedeemStatus(historyId, status);
      
      res.status(200).json({
        success: true,
        message: '交換ステータスが更新されました', // 兑换状态已更新
        data: updatedHistory
      });
    } catch (error) {
      console.error('更新兑换状态错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取用户的兑换历史
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getUserRedeemHistory(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // 检查权限 - 父母可以查看任何人的兑换历史，孩子只能查看自己的
      if (req.user.role === 'child' && userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      // 获取兑换历史
      const history = await RewardModel.getUserRedeemHistory(userId);
      
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('获取兑换历史错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取家庭的兑换历史（仅限父母）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getFamilyRedeemHistory(req, res) {
    try {
      // 检查权限 - 只有父母可以查看家庭兑换历史
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { familyId } = req.params;
      
      // 获取家庭兑换历史
      const history = await RewardModel.getFamilyRedeemHistory(familyId);
      
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('获取家庭兑换历史错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  }
};

module.exports = RewardController;