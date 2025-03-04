<template>
  <div class="dashboard">
    <h1 class="page-title">{{ $t('dashboard.welcome', { name: currentUser ? currentUser.fullName : '' }) }}</h1>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>{{ $t('dashboard.currentPoints') }}</h3>
        <div class="stat-value">{{ currentPoints }}</div>
      </div>
    </div>
    
    <!-- 父母角色特定内容 -->
    <div v-if="isParent" class="parent-dashboard">
      <div class="dashboard-section">
        <h2>{{ $t('tasks.allTasks') }}</h2>
        <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else-if="tasks.length === 0" class="empty-state">
          {{ $t('tasks.noTasks') }}
        </div>
        <div v-else class="task-list">
          <div v-for="task in pendingApprovalTasks" :key="task.id" class="task-card">
            <div class="task-header">
              <h3>{{ task.title }}</h3>
              <span class="task-status status-completed">{{ $t('tasks.completed') }}</span>
            </div>
            <p>{{ task.description }}</p>
            <div class="task-footer">
              <span class="task-points">{{ task.points }} {{ $t('dashboard.points') }}</span>
              <div class="task-actions">
                <button @click="approveTask(task.id)" class="btn btn-sm btn-primary">
                  {{ $t('tasks.approve') }}
                </button>
                <button @click="rejectTask(task.id)" class="btn btn-sm btn-danger">
                  {{ $t('tasks.reject') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link to="/tasks" class="btn btn-primary">
            {{ $t('tasks.allTasks') }}
          </router-link>
          <router-link to="/tasks/new" class="btn btn-secondary">
            {{ $t('tasks.newTask') }}
          </router-link>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>{{ $t('rewards.redeemHistory') }}</h2>
        <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else-if="redeemHistory.length === 0" class="empty-state">
          {{ $t('rewards.noRewards') }}
        </div>
        <div v-else class="redeem-list">
          <div v-for="redeem in pendingRedeemRequests" :key="redeem.id" class="redeem-card">
            <div class="redeem-header">
              <h3>{{ redeem.rewardName }}</h3>
              <span class="redeem-status status-pending">{{ $t('rewards.pending') }}</span>
            </div>
            <div class="redeem-footer">
              <span class="redeem-points">{{ redeem.pointsCost }} {{ $t('dashboard.points') }}</span>
              <div class="redeem-actions">
                <button @click="approveRedeem(redeem.id)" class="btn btn-sm btn-primary">
                  {{ $t('tasks.approve') }}
                </button>
                <button @click="rejectRedeem(redeem.id)" class="btn btn-sm btn-danger">
                  {{ $t('tasks.reject') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link to="/rewards" class="btn btn-primary">
            {{ $t('rewards.allRewards') }}
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 孩子角色特定内容 -->
    <div v-else class="child-dashboard">
      <div class="dashboard-section">
        <h2>{{ $t('tasks.myTasks') }}</h2>
        <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else-if="myPendingTasks.length === 0" class="empty-state">
          {{ $t('tasks.noTasks') }}
        </div>
        <div v-else class="task-list">
          <div v-for="task in myPendingTasks" :key="task.id" class="task-card">
            <div class="task-header">
              <h3>{{ task.title }}</h3>
              <span class="task-status status-pending">{{ $t('tasks.pending') }}</span>
            </div>
            <p>{{ task.description }}</p>
            <div class="task-footer">
              <span class="task-points">{{ task.points }} {{ $t('dashboard.points') }}</span>
              <button @click="completeTask(task.id)" class="btn btn-sm btn-primary">
                {{ $t('tasks.markAsCompleted') }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link to="/tasks" class="btn btn-primary">
            {{ $t('tasks.allTasks') }}
          </router-link>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>{{ $t('rewards.myRewards') }}</h2>
        <div v-if="loading" class="loading">{{ $t('common.loading') }}</div>
        <div v-else-if="rewards.length === 0" class="empty-state">
          {{ $t('rewards.noRewards') }}
        </div>
        <div v-else class="reward-list">
          <div v-for="reward in topRewards" :key="reward.id" class="reward-card">
            <div class="reward-header">
              <h3>{{ reward.name }}</h3>
            </div>
            <p>{{ reward.description }}</p>
            <div class="reward-footer">
              <span class="reward-points">{{ reward.points }} {{ $t('dashboard.points') }}</span>
              <button 
                @click="redeemReward(reward.id)" 
                class="btn btn-sm btn-primary"
                :disabled="currentPoints < reward.points || (reward.stock !== null && reward.stock <= 0)"
              >
                {{ $t('rewards.redeem') }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link to="/rewards" class="btn btn-primary">
            {{ $t('rewards.allRewards') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Dashboard',
  
  data() {
    return {
      // 本地状态
    }
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isParent', 'isChild']),
    ...mapGetters('task', ['allTasks', 'loading']),
    ...mapGetters('reward', ['allRewards', 'redeemHistory']),
    ...mapGetters('point', ['currentPoints']),
    
    // 待审批的任务（已完成但未审批）
    pendingApprovalTasks() {
      return this.allTasks.filter(task => task.status === 'completed')
    },
    
    // 待处理的兑换请求
    pendingRedeemRequests() {
      return this.redeemHistory.filter(record => record.status === 'pending')
    },
    
    // 我的待完成任务
    myPendingTasks() {
      return this.allTasks.filter(task => 
        task.assignedTo === this.currentUser?.id && 
        task.status === 'pending'
      )
    },
    
    // 前3个可兑换奖品
    topRewards() {
      return this.allRewards
        .filter(reward => reward.stock === null || reward.stock > 0)
        .slice(0, 3)
    },
    
    // 所有任务
    tasks() {
      return this.allTasks
    },
    
    // 所有奖品
    rewards() {
      return this.allRewards
    }
  },
  
  methods: {
    ...mapActions('task', ['getFamilyTasks', 'getUserTasks', 'updateTaskStatus']),
    ...mapActions('reward', [
      'getFamilyRewards', 
      'redeemReward', 
      'getUserRedeemHistory',
      'getFamilyRedeemHistory',
      'updateRedeemStatus'
    ]),
    ...mapActions('point', ['getUserPoints']),
    
    // 完成任务
    async completeTask(taskId) {
      try {
        await this.updateTaskStatus({
          taskId,
          status: 'completed'
        })
        // 刷新任务列表
        if (this.isChild) {
          await this.getUserTasks()
        }
      } catch (error) {
        console.error('完成任务失败:', error)
      }
    },
    
    // 批准任务
    async approveTask(taskId) {
      try {
        await this.updateTaskStatus({
          taskId,
          status: 'approved'
        })
        // 刷新任务列表和积分
        await this.getFamilyTasks()
        await this.getUserPoints()
      } catch (error) {
        console.error('批准任务失败:', error)
      }
    },
    
    // 拒绝任务
    async rejectTask(taskId) {
      try {
        await this.updateTaskStatus({
          taskId,
          status: 'rejected'
        })
        // 刷新任务列表
        await this.getFamilyTasks()
      } catch (error) {
        console.error('拒绝任务失败:', error)
      }
    },
    
    // 兑换奖品
    async redeemReward(rewardId) {
      try {
        await this.redeemReward(rewardId)
        // 刷新积分和奖品列表
        await this.getUserPoints()
        await this.getFamilyRewards()
        if (this.isChild) {
          await this.getUserRedeemHistory()
        }
      } catch (error) {
        console.error('兑换奖品失败:', error)
      }
    },
    
    // 批准兑换
    async approveRedeem(historyId) {
      try {
        await this.updateRedeemStatus({
          historyId,
          status: 'approved'
        })
        // 刷新兑换历史
        await this.getFamilyRedeemHistory()
      } catch (error) {
        console.error('批准兑换失败:', error)
      }
    },
    
    // 拒绝兑换
    async rejectRedeem(historyId) {
      try {
        await this.updateRedeemStatus({
          historyId,
          status: 'rejected'
        })
        // 刷新兑换历史
        await this.getFamilyRedeemHistory()
      } catch (error) {
        console.error('拒绝兑换失败:', error)
      }
    }
  },
  
  async created() {
    try {
      // 获取用户积分
      await this.getUserPoints()
      
      // 根据角色获取不同数据
      if (this.isParent) {
        await this.getFamilyTasks()
        await this.getFamilyRedeemHistory()
      } else {
        await this.getUserTasks()
        await this.getUserRedeemHistory()
      }
      
      // 获取所有奖品
      await this.getFamilyRewards()
    } catch (error) {
      console.error('加载仪表板数据失败:', error)
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem 0;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}

.dashboard-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: #4CAF50;
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  flex: 1;
  text-align: center;
}

.stat-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
}

.dashboard-section {
  margin-bottom: 3rem;
}

.dashboard-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #333;
}

.task-list, .reward-list, .redeem-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.task-card, .reward-card, .redeem-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.task-header, .reward-header, .redeem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-header h3, .reward-header h3, .redeem-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.task-status, .redeem-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.task-footer, .reward-footer, .redeem-footer {
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-points, .reward-points, .redeem-points {
  font-weight: 700;
  color: #4CAF50;
}

.task-actions, .redeem-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}

@media (max-width: 768px) {
  .task-list, .reward-list, .redeem-list {
    grid-template-columns: 1fr;
  }
  
  .dashboard-stats {
    flex-direction: column;
  }
}
</style>