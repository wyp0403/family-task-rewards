import PointService from '../../services/point.service'

export default {
  namespaced: true,
  
  state: {
    userPoints: null,
    pointHistory: [],
    leaderboard: [],
    loading: false,
    error: null
  },
  
  getters: {
    currentPoints: (state) => state.userPoints ? state.userPoints.balance : 0,
    pointHistory: (state) => state.pointHistory,
    leaderboard: (state) => state.leaderboard,
    loading: (state) => state.loading,
    error: (state) => state.error
  },
  
  mutations: {
    SET_USER_POINTS(state, points) {
      state.userPoints = points
    },
    SET_POINT_HISTORY(state, history) {
      state.pointHistory = history
    },
    SET_LEADERBOARD(state, leaderboard) {
      state.leaderboard = leaderboard
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
    // 获取用户积分
    async getUserPoints({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const userId = rootGetters['auth/currentUser'].id
        const points = await PointService.getUserPoints(userId)
        
        commit('SET_USER_POINTS', points)
        return points
      } catch (error) {
        commit('SET_ERROR', error.message || 'ポイントの取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取用户积分历史
    async getPointHistory({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const userId = rootGetters['auth/currentUser'].id
        const history = await PointService.getPointHistory(userId)
        
        commit('SET_POINT_HISTORY', history)
        return history
      } catch (error) {
        commit('SET_ERROR', error.message || 'ポイント履歴の取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取家庭积分排行榜
    async getFamilyLeaderboard({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const familyId = rootGetters['auth/familyId']
        const leaderboard = await PointService.getFamilyLeaderboard(familyId)
        
        commit('SET_LEADERBOARD', leaderboard)
        return leaderboard
      } catch (error) {
        commit('SET_ERROR', error.message || 'ランキングの取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 添加积分（仅限父母）
    async addPoints({ commit, dispatch }, { userId, amount, reason }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        await PointService.addPoints(userId, amount, reason)
        
        // 刷新数据
        if (userId === rootGetters['auth/currentUser'].id) {
          await dispatch('getUserPoints')
        }
        await dispatch('getFamilyLeaderboard')
        
        return true
      } catch (error) {
        commit('SET_ERROR', error.message || 'ポイントの追加に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 扣除积分（仅限父母）
    async deductPoints({ commit, dispatch, rootGetters }, { userId, amount, reason }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        await PointService.deductPoints(userId, amount, reason)
        
        // 刷新数据
        if (userId === rootGetters['auth/currentUser'].id) {
          await dispatch('getUserPoints')
        }
        await dispatch('getFamilyLeaderboard')
        
        return true
      } catch (error) {
        commit('SET_ERROR', error.message || 'ポイントの差し引きに失敗しました')
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