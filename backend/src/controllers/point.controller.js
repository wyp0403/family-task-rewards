const PointModel = require('../models/point.model');
const UserModel = require('../models/user.model');

/**
 * 积分控制器
 */
const PointController = {
  /**
   * 获取用户积分
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getUserPoints(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // 获取用户积分
      const points = await PointModel.getUserPoints(userId);
      
      res.status(200).json({
        success: true,
        data: points
      });
    } catch (error) {
      console.error('获取积分错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 添加积分（仅限父母）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async addPoints(req, res) {
    try {
      // 检查权限 - 只有父母可以手动添加积分
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { userId, amount, reason } = req.body;
      
      // 添加积分
      const updatedPoints = await PointModel.addPoints(
        userId,
        Number(amount),
        reason
      );
      
      res.status(200).json({
        success: true,
        message: 'ポイントが追加されました', // 积分已添加
        data: updatedPoints
      });
    } catch (error) {
      console.error('添加积分错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 扣除积分（仅限父母）
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async deductPoints(req, res) {
    try {
      // 检查权限 - 只有父母可以手动扣除积分
      if (req.user.role !== 'parent') {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      const { userId, amount, reason } = req.body;
      
      // 扣除积分
      const updatedPoints = await PointModel.deductPoints(
        userId,
        Number(amount),
        reason
      );
      
      res.status(200).json({
        success: true,
        message: 'ポイントが差し引かれました', // 积分已扣除
        data: updatedPoints
      });
    } catch (error) {
      console.error('扣除积分错误:', error);
      
      // 积分不足的特殊错误处理
      if (error.message === '积分不足') {
        return res.status(400).json({
          success: false,
          message: 'ポイントが不足しています' // 积分不足
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取用户积分历史
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getPointHistory(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // 检查权限 - 父母可以查看任何人的积分历史，孩子只能查看自己的
      if (req.user.role === 'child' && userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '権限がありません' // 没有权限
        });
      }
      
      // 获取积分历史
      const history = await PointModel.getPointHistory(userId);
      
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('获取积分历史错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  },
  
  /**
   * 获取家庭成员积分排行榜
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  async getFamilyLeaderboard(req, res) {
    try {
      const { familyId } = req.params;
      
      // 获取家庭成员
      const familyMembers = await UserModel.getFamilyMembers(familyId);
      
      // 获取每个成员的积分
      const leaderboard = await Promise.all(
        familyMembers.map(async (member) => {
          const points = await PointModel.getUserPoints(member.id);
          return {
            userId: member.id,
            username: member.username,
            fullName: member.fullName,
            role: member.role,
            points: points.balance || 0
          };
        })
      );
      
      // 按积分排序
      leaderboard.sort((a, b) => b.points - a.points);
      
      res.status(200).json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('获取排行榜错误:', error);
      res.status(500).json({
        success: false,
        message: 'サーバーエラーが発生しました' // 服务器发生错误
      });
    }
  }
};

module.exports = PointController;