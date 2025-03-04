<template>
  <div class="rewards-page">
    <div class="page-header">
      <h1 class="page-title">{{ $t('rewards.allRewards') }}</h1>
      <div class="page-actions" v-if="isParent">
        <router-link to="/rewards/new" class="btn btn-primary">
          {{ $t('rewards.newReward') }}
        </router-link>
      </div>
    </div>
    
    <!-- 奖品列表 -->
    <div v-if="loading" class="loading-container">
      <p>{{ $t('common.loading') }}</p>
    </div>
    <div v-else-if="allRewards.length === 0" class="empty-state">
      <p>{{ $t('rewards.noRewards') }}</p>
    </div>
    <div v-else class="rewards-grid">
      <div v-for="reward in allRewards" :key="reward.id" class="reward-card">
        <div class="reward-header">
          <h3 class="reward-title">{{ reward.name }}</h3>
          <span v-if="reward.stock !== null" class="reward-stock" :class="{ 'out-of-stock': reward.stock <= 0 }">
            {{ reward.stock > 0 ? reward.stock : $t('rewards.outOfStock') }}
          </span>
        </div>
        
        <div class="reward-body">
          <p class="reward-description">{{ reward.description }}</p>
          <div class="reward-points">
            <strong>{{ $t('rewards.points') }}:</strong> {{ reward.points }}
          </div>
        </div>
        
        <div class="reward-footer">
          <!-- 兑换按钮 -->
          <button 
            v-if="isChild" 
            @click="redeemReward(reward.id)" 
            class="btn btn-primary btn-sm"
            :disabled="currentPoints < reward.points || (reward.stock !== null && reward.stock <= 0)"
          >
            {{ $t('rewards.redeem') }}
          </button>
          
          <!-- 父母可以编辑和删除奖品 -->
          <div v-if="isParent" class="reward-actions">
            <router-link :to="`/rewards/${reward.id}`" class="btn btn-secondary btn-sm">
              {{ $t('common.edit') }}
            </router-link>
            <button @click="confirmDeleteReward(reward)" class="btn btn-danger btn-sm">
              {{ $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 兑换历史部分 -->
    <div class="redeem-history-section">
      <h2>{{ $t('rewards.redeemHistory') }}</h2>
      
      <div v-if="loading" class="loading-container">
        <p>{{ $t('common.loading') }}</p>
      </div>
      <div v-else-if="redeemHistory.length === 0" class="empty-state">
        <p>{{ $t('rewards.noRewards') }}</p>
      </div>
      <div v-else class="history-list">
        <div v-for="item in redeemHistory" :key="item.id" class="history-item">
          <div class="history-item-header">
            <h3>{{ item.rewardName }}</h3>
            <span class="history-status" :class="getStatusClass(item.status)">
              {{ $t(`rewards.${item.status}`) }}
            </span>
          </div>
          <div class="history-item-body">
            <div class="history-points">{{ item.pointsCost }} {{ $t('dashboard.points') }}</div>
            <div class="history-date">{{ formatDate(item.createdAt) }}</div>
          </div>
          <!-- 父母可以批准或拒绝兑换请求 -->
          <div v-if="isParent && item.status === 'pending'" class="history-actions">
            <button @click="approveRedeem(item.id)" class="btn btn-primary btn-sm">
              {{ $t('tasks.approve') }}
            </button>
            <button @click="rejectRedeem(item.id)" class="btn btn-danger btn-sm">
              {{ $t('tasks.reject') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 确认删除对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('common.confirm') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ $t('rewards.confirmDelete') }}</p>
          <p><strong>{{ rewardToDelete?.name }}</strong></p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn btn-secondary">
            {{ $t('common.cancel') }}
          </button>
          <button @click="deleteReward" class="btn btn-danger">
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 兑换确认对话框 -->
    <div v-if="showRedeemConfirm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('rewards.redeem') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ $t('common.confirm') }}</p>
          <p>{{ rewardToRedeem?.name }} - {{ rewardToRedeem?.points }} {{ $t('dashboard.points') }}</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelRedeem" class="btn btn-secondary">
            {{ $t('common.cancel') }}
          </button>
          <button @click="confirmRedeem" class="btn btn-primary">
            {{ $t('rewards.redeem') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Rewards',
  
  data() {
    return {
      showDeleteConfirm: false,
      rewardToDelete: null,
      showRedeemConfirm: false,
      rewardToRedeem: null
    }
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isParent', 'isChild', 'familyId']),
    ...mapGetters('reward', ['allRewards', 'redeemHistory', 'loading', 'error']),
    ...mapGetters('point', ['currentPoints'])
  },
  
  methods: {
    ...mapActions('reward', [
      'getFamilyRewards', 
      'deleteReward', 
      'redeemReward',
      'getUserRedeemHistory',
      'getFamilyRedeemHistory',
      'updateRedeemStatus'
    ]),
    ...mapActions('point', ['getUserPoints']),
    
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'status-pending'
        case 'approved':
          return 'status-approved'
        case 'rejected':
          return 'status-rejected'
        default:
          return ''
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ja-JP').format(date)
    },
    
    confirmDeleteReward(reward) {
      this.rewardToDelete = reward
      this.showDeleteConfirm = true
    },
    
    cancelDelete() {
      this.showDeleteConfirm = false
      this.rewardToDelete = null
    },
    
    async deleteReward() {
      if (!this.rewardToDelete) return
      
      try {
        await this.deleteReward(this.rewardToDelete.id)
        
        // 关闭确认对话框
        this.showDeleteConfirm = false
        this.rewardToDelete = null
        
        // 刷新奖品列表
        this.loadRewards()
      } catch (error) {
        console.error('删除奖品失败:', error)
      }
    },
    
    redeemReward(rewardId) {
      const reward = this.allRewards.find(r => r.id === rewardId)
      if (!reward) return
      
      this.rewardToRedeem = reward
      this.showRedeemConfirm = true
    },
    
    cancelRedeem() {
      this.showRedeemConfirm = false
      this.rewardToRedeem = null
    },
    
    async confirmRedeem() {
      if (!this.rewardToRedeem) return
      
      try {
        await this.redeemReward(this.rewardToRedeem.id)
        
        // 关闭确认对话框
        this.showRedeemConfirm = false
        this.rewardToRedeem = null
        
        // 刷新数据
        await this.getUserPoints()
        await this.loadRewards()
        await this.loadRedeemHistory()
      } catch (error) {
        console.error('兑换奖品失败:', error)
      }
    },
    
    async approveRedeem(historyId) {
      try {
        await this.updateRedeemStatus({
          historyId,
          status: 'approved'
        })
        
        // 刷新兑换历史
        await this.loadRedeemHistory()
      } catch (error) {
        console.error('批准兑换失败:', error)
      }
    },
    
    async rejectRedeem(historyId) {
      try {
        await this.updateRedeemStatus({
          historyId,
          status: 'rejected'
        })
        
        // 刷新兑换历史
        await this.loadRedeemHistory()
      } catch (error) {
        console.error('拒绝兑换失败:', error)
      }
    },
    
    async loadRewards() {
      try {
        await this.getFamilyRewards()
      } catch (error) {
        console.error('加载奖品失败:', error)
      }
    },
    
    async loadRedeemHistory() {
      try {
        if (this.isParent) {
          await this.getFamilyRedeemHistory()
        } else {
          await this.getUserRedeemHistory()
        }
      } catch (error) {
        console.error('加载兑换历史失败:', error)
      }
    }
  },
  
  async created() {
    await this.getUserPoints()
    await this.loadRewards()
    await this.loadRedeemHistory()
  }
}
</script>

<style scoped>
.rewards-page {
  padding: 1rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.reward-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reward-title {
  margin: 0;
  font-size: 1.2rem;
}

.reward-stock {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.reward-stock.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

.reward-body {
  flex: 1;
  margin-bottom: 1.5rem;
}

.reward-description {
  margin-bottom: 1rem;
  color: #555;
}

.reward-points {
  font-size: 1rem;
  color: #4CAF50;
  font-weight: 500;
}

.reward-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.reward-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.redeem-history-section {
  margin-top: 3rem;
}

.redeem-history-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.history-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-item {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-item-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.history-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-approved {
  background-color: #d4edda;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.history-item-body {
  display: flex;
  justify-content: space-between;
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.history-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.loading-container {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}

/* 模态对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .rewards-grid {
    grid-template-columns: 1fr;
  }
}
</style>