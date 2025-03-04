import AuthService from '../../services/auth.service'

const initialState = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null
}

export default {
  namespaced: true,
  
  state: { ...initialState },
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    isParent: (state) => state.user && state.user.role === 'parent',
    isChild: (state) => state.user && state.user.role === 'child',
    familyId: (state) => state.user ? state.user.familyId : null,
    loading: (state) => state.loading,
    error: (state) => state.error
  },
  
  mutations: {
    LOGIN_REQUEST(state) {
      state.loading = true
      state.error = null
    },
    LOGIN_SUCCESS(state, { token, user }) {
      state.token = token
      state.user = user
      state.loading = false
      state.error = null
      
      // 保存到本地存储
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    LOGIN_FAILURE(state, error) {
      state.loading = false
      state.error = error
    },
    LOGOUT(state) {
      // 清除状态和本地存储
      Object.assign(state, initialState)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      state.token = null
      state.user = null
    },
    UPDATE_USER(state, user) {
      state.user = { ...state.user, ...user }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    // 登录
    async login({ commit }, { username, password }) {
      try {
        commit('LOGIN_REQUEST')
        const data = await AuthService.login(username, password)
        commit('LOGIN_SUCCESS', { token: data.token, user: data.user })
        return data
      } catch (error) {
        commit('LOGIN_FAILURE', error.message || 'ログインに失敗しました')
        throw error
      }
    },
    
    // 注册
    async register({ commit }, userData) {
      try {
        commit('LOGIN_REQUEST')
        const data = await AuthService.register(userData)
        commit('LOGIN_SUCCESS', { token: data.token, user: data.user })
        return data
      } catch (error) {
        commit('LOGIN_FAILURE', error.message || '登録に失敗しました')
        throw error
      }
    },
    
    // 获取当前用户信息
    async getCurrentUser({ commit, state }) {
      try {
        if (!state.token) return null
        
        const user = await AuthService.getCurrentUser()
        commit('UPDATE_USER', user)
        return user
      } catch (error) {
        // 如果获取用户信息失败（如令牌无效），则登出
        if (error.response && error.response.status === 401) {
          commit('LOGOUT')
        }
        throw error
      }
    },
    
    // 登出
    logout({ commit }) {
      commit('LOGOUT')
    },
    
    // 清除错误
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  }
}