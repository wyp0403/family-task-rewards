<template>
  <div class="reward-detail-page">
    <div class="page-header">
      <h1 class="page-title">{{ isNewReward ? $t('rewards.newReward') : $t('rewards.updateReward') }}</h1>
      <button @click="goBack" class="btn btn-secondary">
        {{ $t('common.back') }}
      </button>
    </div>
    
    <div class="card">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name" class="form-label">{{ $t('rewards.rewardName') }}</label>
          <input
            id="name"
            v-model="rewardForm.name"
            type="text"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description" class="form-label">{{ $t('rewards.description') }}</label>
          <textarea
            id="description"
            v-model="rewardForm.description"
            class="form-input"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="points" class="form-label">{{ $t('rewards.points') }}</label>
          <input
            id="points"
            v-model.number="rewardForm.points"
            type="number"
            class="form-input"
            min="1"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="stock" class="form-label">{{ $t('rewards.stock') }}</label>
          <div class="stock-input-group">
            <input
              id="stock"
              v-model.number="rewardForm.stock"
              type="number"
              class="form-input"
              min="0"
              :disabled="unlimitedStock"
            />
            <div class="stock-checkbox">
              <input 
                id="unlimited-stock" 
                type="checkbox" 
                v-model="unlimitedStock"
              />
              <label for="unlimited-stock">無制限</label>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="imageUrl" class="form-label">画像URL (オプション)</label>
          <input
            id="imageUrl"
            v-model="rewardForm.imageUrl"
            type="url"
            class="form-input"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'RewardDetail',
  
  data() {
    return {
      rewardForm: {
        name: '',
        description: '',
        points: 50,
        stock: 1,
        imageUrl: ''
      },
      unlimitedStock: false,
      isNewReward: true
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isParent', 'familyId']),
    ...mapGetters('reward', ['currentReward', 'loading', 'error']),
    
    rewardId() {
      return this.$route.params.id
    }
  },
  
  watch: {
    unlimitedStock(newVal) {
      if (newVal) {
        this.rewardForm.stock = null;
      } else {
        this.rewardForm.stock = 1;
      }
    }
  },
  
  methods: {
    ...mapActions('reward', ['createReward', 'getRewardById', 'updateReward']),
    
    async loadReward() {
      if (!this.rewardId || this.rewardId === 'new') {
        this.isNewReward = true
        return
      }
      
      this.isNewReward = false
      
      try {
        await this.getRewardById(this.rewardId)
        
        if (this.currentReward) {
          // 填充表单数据
          this.rewardForm = {
            name: this.currentReward.name,
            description: this.currentReward.description || '',
            points: this.currentReward.points,
            stock: this.currentReward.stock,
            imageUrl: this.currentReward.imageUrl || ''
          }
          
          // 如果库存为null，表示无限库存
          this.unlimitedStock = this.currentReward.stock === null
        }
      } catch (error) {
        console.error('加载奖品失败:', error)
      }
    },
    
    async handleSubmit() {
      try {
        // 准备奖品数据
        const rewardData = { ...this.rewardForm }
        
        if (this.isNewReward) {
          await this.createReward(rewardData)
        } else {
          await this.updateReward({
            rewardId: this.rewardId,
            rewardData
          })
        }
        
        // 返回奖品列表页面
        this.$router.push('/rewards')
      } catch (error) {
        console.error('保存奖品失败:', error)
      }
    },
    
    goBack() {
      this.$router.back()
    }
  },
  
  async created() {
    // 检查是否有权限访问此页面
    if (!this.isParent) {
      this.$router.push('/dashboard')
      return
    }
    
    await this.loadReward()
  }
}
</script>

<style scoped>
.reward-detail-page {
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

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.stock-input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stock-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>