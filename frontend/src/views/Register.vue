<template>
  <div class="register-page">
    <div class="card register-card">
      <h2 class="card-title">{{ $t('auth.register') }}</h2>
      
      <!-- 服务状态提示 -->
      <div v-if="serviceStatus === 'checking'" class="alert alert-info">
        正在检查服务状态，请稍候...
      </div>
      <div v-if="serviceStatus === 'offline'" class="alert alert-warning">
        后端服务可能正在启动中，请耐心等待或稍后再试。首次访问可能需要几分钟时间唤醒服务。
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error || validationError" class="alert alert-danger">
        {{ validationError || error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username" class="form-label">{{ $t('auth.username') }}</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="fullName" class="form-label">{{ $t('auth.fullName') }}</label>
          <input
            id="fullName"
            v-model="formData.fullName"
            type="text"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">{{ $t('auth.password') }}</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ $t('auth.role') }}</label>
          <div class="role-options">
            <label class="role-option">
              <input
                type="radio"
                v-model="formData.role"
                value="parent"
                name="role"
              />
              {{ $t('auth.parent') }}
            </label>
            <label class="role-option">
              <input
                type="radio"
                v-model="formData.role"
                value="child"
                name="role"
              />
              {{ $t('auth.child') }}
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label for="familyId" class="form-label">{{ $t('auth.familyId') }}</label>
          <input
            id="familyId"
            v-model="formData.familyId"
            type="text"
            class="form-input"
            required
            placeholder="例: family123"
          />
          <small class="form-text">※家族で共有するIDを入力してください</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading || serviceStatus === 'checking' || serviceStatus === 'offline'">
            {{ loading ? $t('common.loading') : $t('auth.register') }}
          </button>
        </div>
      </form>
      
      <div v-if="serviceStatus === 'offline'" class="retry-section">
        <button @click="checkServiceStatus" class="btn btn-secondary">
          重新检查服务状态
        </button>
      </div>
      
      <div class="login-link">
        <p>{{ $t('auth.login') }}? <router-link to="/login">{{ $t('auth.login') }}</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import apiClient from '../services/http.service'

export default {
  name: 'Register',
  
  data() {
    return {
      formData: {
        username: '',
        fullName: '',
        password: '',
        confirmPassword: '',
        role: 'child',
        familyId: ''
      },
      validationError: null,
      serviceStatus: 'checking' // 'checking', 'online', 'offline'
    }
  },
  
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  
  mounted() {
    // 组件加载时检查服务状态
    this.checkServiceStatus()
  },
  
  methods: {
    ...mapActions('auth', ['register', 'clearError']),
    
    // 检查后端服务状态
    async checkServiceStatus() {
      this.serviceStatus = 'checking'
      try {
        const isOnline = await apiClient.checkConnection()
        this.serviceStatus = isOnline ? 'online' : 'offline'
        console.log('服务状态:', this.serviceStatus)
      } catch (error) {
        console.error('检查服务状态出错:', error)
        this.serviceStatus = 'offline'
      }
    },
    
    validateForm() {
      if (this.formData.password !== this.formData.confirmPassword) {
        this.validationError = this.$t('auth.passwordMismatch') || '两次输入的密码不一致'
        return false
      }
      
      this.validationError = null
      return true
    },
    
    async handleRegister() {
      // 验证表单
      if (!this.validateForm()) return
      
      // 再次检查服务状态
      if (this.serviceStatus === 'offline') {
        await this.checkServiceStatus()
        if (this.serviceStatus === 'offline') {
          this.validationError = '后端服务暂时不可用，请稍后再试'
          return
        }
      }
      
      try {
        console.log('开始注册流程')
        // 提取confirmPassword，不发送到API
        const { confirmPassword, ...userData } = this.formData
        
        // 显示详细的注册数据（不包括密码）
        console.log('注册数据:', {
          ...userData,
          password: '******' // 隐藏密码
        })
        
        await this.register(userData)
        console.log('注册成功')
        
        // 注册成功，跳转到仪表板
        this.$router.push('/dashboard')
      } catch (error) {
        console.error('注册失败:', error)
        // 如果是服务不可用的错误，更新服务状态
        if (error.message && (
            error.message.includes('timeout') || 
            error.message.includes('Network Error') ||
            error.message.includes('服务器响应超时')
        )) {
          this.serviceStatus = 'offline'
        }
      }
    }
  },
  
  // 组件销毁时清除错误
  beforeUnmount() {
    this.clearError()
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem 0;
}

.register-card {
  width: 100%;
  max-width: 500px;
}

.card-title {
  text-align: center;
  margin-bottom: 2rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn {
  width: 100%;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  margin-top: 1rem;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.role-options {
  display: flex;
  gap: 2rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.retry-section {
  margin-top: 1rem;
}
</style>