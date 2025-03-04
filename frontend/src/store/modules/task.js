import TaskService from '../../services/task.service'

export default {
  namespaced: true,
  
  state: {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null
  },
  
  getters: {
    allTasks: (state) => state.tasks,
    pendingTasks: (state) => state.tasks.filter(task => task.status === 'pending'),
    completedTasks: (state) => state.tasks.filter(task => task.status === 'completed'),
    approvedTasks: (state) => state.tasks.filter(task => task.status === 'approved'),
    rejectedTasks: (state) => state.tasks.filter(task => task.status === 'rejected'),
    currentTask: (state) => state.currentTask,
    loading: (state) => state.loading,
    error: (state) => state.error
  },
  
  mutations: {
    SET_TASKS(state, tasks) {
      state.tasks = tasks
    },
    SET_CURRENT_TASK(state, task) {
      state.currentTask = task
    },
    ADD_TASK(state, task) {
      state.tasks.push(task)
    },
    UPDATE_TASK(state, updatedTask) {
      const index = state.tasks.findIndex(task => task.id === updatedTask.id)
      if (index !== -1) {
        state.tasks.splice(index, 1, updatedTask)
      }
      if (state.currentTask && state.currentTask.id === updatedTask.id) {
        state.currentTask = updatedTask
      }
    },
    REMOVE_TASK(state, taskId) {
      state.tasks = state.tasks.filter(task => task.id !== taskId)
      if (state.currentTask && state.currentTask.id === taskId) {
        state.currentTask = null
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
    // 获取家庭的所有任务
    async getFamilyTasks({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const familyId = rootGetters['auth/familyId']
        const tasks = await TaskService.getFamilyTasks(familyId)
        
        commit('SET_TASKS', tasks)
        return tasks
      } catch (error) {
        commit('SET_ERROR', error.message || 'タスクの取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取用户的任务
    async getUserTasks({ commit, rootGetters }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const userId = rootGetters['auth/currentUser'].id
        const tasks = await TaskService.getUserTasks(userId)
        
        commit('SET_TASKS', tasks)
        return tasks
      } catch (error) {
        commit('SET_ERROR', error.message || 'タスクの取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 获取任务详情
    async getTaskById({ commit }, taskId) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const task = await TaskService.getTaskById(taskId)
        
        commit('SET_CURRENT_TASK', task)
        return task
      } catch (error) {
        commit('SET_ERROR', error.message || 'タスクの取得に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 创建任务
    async createTask({ commit, rootGetters }, taskData) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        // 添加家庭ID
        const familyId = rootGetters['auth/familyId']
        const newTask = await TaskService.createTask({ ...taskData, familyId })
        
        commit('ADD_TASK', newTask)
        return newTask
      } catch (error) {
        commit('SET_ERROR', error.message || 'タスクの作成に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 更新任务状态
    async updateTaskStatus({ commit }, { taskId, status, comment }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        const updatedTask = await TaskService.updateTaskStatus(taskId, status, comment)
        
        commit('UPDATE_TASK', updatedTask)
        return updatedTask
      } catch (error) {
        commit('SET_ERROR', error.message || 'ステータスの更新に失敗しました')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 删除任务
    async deleteTask({ commit }, taskId) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        await TaskService.deleteTask(taskId)
        
        commit('REMOVE_TASK', taskId)
        return true
      } catch (error) {
        commit('SET_ERROR', error.message || 'タスクの削除に失敗しました')
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