import RewardService from '../../services/reward.service'

export default {
  namespaced: true,
  
  state: {
    rewards: [],
    currentReward: null,
    redeemHistory: [],
    loading: false,
    error: null
  },
  
  getters: {
    allRewards: (state) => state.rewards,
    currentReward: (state) => state.currentReward,
    redeemHistory: (state) => state.redeemHistory,
    loading: (state) => state.loading,
    error: (state) => state.error
  },
  
  mutations: {
    SET_REWARDS(state, rewards) {
      state.rewards = rewards
    },
    SET_CURRENT_REWARD(state, reward) {
      state.currentReward = reward
    },
    SET_REDEEM_HISTORY(state, history) {
      state.redeemHistory = history
    },
    ADD_REWARD(state, reward) {
      state.rewards.push(reward)
    },
    UPDATE_REWARD(state, updatedReward) {
      const index = state.rewards.findIndex(reward => reward.id === updatedReward.id)
      if (index !== -1) {
        state.rewards.splice(index, 1, updatedReward)
      }
      if (state.currentReward && state.currentReward.id === updatedReward.id) {
        state.currentReward = updatedReward
      }
    },
    REMOVE_REWARD(state, rewardId) {
      state.rewards = state.rewards.filter(reward => reward.id !== rewardId)
      if (state.currentReward && state.currentReward.id === rewardId) {
        state.currentReward = null
      }
    },
    ADD_TO_HISTORY(state, redeemRecord) {
      state.redeemHistory.unshift(redeemRecord)
    },
    UPDATE_HISTORY_ITEM(state, updatedRecord) {
      const index = state.redeemHistory.findIndex(record => record.id === updatedRecord.id)
      if (index !== -1) {
        state.redeemHistory.splice(index, 1, updatedRecord)
      }
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    // 获取家庭的所有奖品
    async getFamilyRewards({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const familyId = rootGetters['auth/familyId']
        const rewards = await RewardService.getFamilyRewards(familyId)
        
        commit('SET_REWARDS', rewards)
        return rewards
      } catch (error) {
        commit('SET_ERROR', error.message || '報酬の取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取奖品详情
    async getRewardById({ commit }, rewardId) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const reward = await RewardService.getRewardById(rewardId)
        
        commit('SET_CURRENT_REWARD', reward)
        return reward
      } catch (error) {
        commit('SET_ERROR', error.message || '報酬の取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 创建奖品
    async createReward({ commit, rootGetters }, rewardData) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        // 添加家庭ID
        const familyId = rootGetters['auth/familyId']
        const newReward = await RewardService.createReward({ ...rewardData, familyId })
        
        commit('ADD_REWARD', newReward)
        return newReward
      } catch (error) {
        commit('SET_ERROR', error.message || '報酬の作成に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 更新奖品
    async updateReward({ commit }, { rewardId, rewardData }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const updatedReward = await RewardService.updateReward(rewardId, rewardData)
        
        commit('UPDATE_REWARD', updatedReward)
        return updatedReward
      } catch (error) {
        commit('SET_ERROR', error.message || '報酬の更新に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 删除奖品
    async deleteReward({ commit }, rewardId) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        await RewardService.deleteReward(rewardId)
        
        commit('REMOVE_REWARD', rewardId)
        return true
      } catch (error) {
        commit('SET_ERROR', error.message || '報酬の削除に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 兑换奖品
    async redeemReward({ commit }, rewardId) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const redeemRecord = await RewardService.redeemReward(rewardId)
        
        // 更新兑换历史
        commit('ADD_TO_HISTORY', redeemRecord)
        
        // 如果奖品有库存限制，更新奖品信息
        const reward = await RewardService.getRewardById(rewardId)
        commit('UPDATE_REWARD', reward)
        
        return redeemRecord
      } catch (error) {
        commit('SET_ERROR', error.message || '報酬の交換に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取用户的兑换历史
    async getUserRedeemHistory({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const userId = rootGetters['auth/currentUser'].id
        const history = await RewardService.getUserRedeemHistory(userId)
        
        commit('SET_REDEEM_HISTORY', history)
        return history
      } catch (error) {
        commit('SET_ERROR', error.message || '交換履歴の取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取家庭的兑换历史（仅限父母）
    async getFamilyRedeemHistory({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const familyId = rootGetters['auth/familyId']
        const history = await RewardService.getFamilyRedeemHistory(familyId)
        
        commit('SET_REDEEM_HISTORY', history)
        return history
      } catch (error) {
        commit('SET_ERROR', error.message || '交換履歴の取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 更新兑换状态（仅限父母）
    async updateRedeemStatus({ commit }, { historyId, status }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const updatedRecord = await RewardService.updateRedeemStatus(historyId, status)
        
        commit('UPDATE_HISTORY_ITEM', updatedRecord)
        return updatedRecord
      } catch (error) {
        commit('SET_ERROR', error.message || '交換ステータスの更新に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 清除错误
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  }
}