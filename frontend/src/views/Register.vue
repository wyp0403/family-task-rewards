<template>
  <div class="register-page">
    <div class="card register-card">
      <h2 class="card-title">{{ $t('auth.register') }}</h2>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
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
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? $t('common.loading') : $t('auth.register') }}
          </button>
        </div>
      </form>
      
      <div class="login-link">
        <p>{{ $t('auth.login') }}? <router-link to="/login">{{ $t('auth.login') }}</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

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
      validationError: null
    }
  },
  
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  
  methods: {
    ...mapActions('auth', ['register', 'clearError']),
    
    validateForm() {
      if (this.formData.password !== this.formData.confirmPassword) {
        this.validationError = this.$t('auth.passwordMismatch')
        return false
      }
      
      this.validationError = null
      return true
    },
    
    async handleRegister() {
      // 验证表单
      if (!this.validateForm()) return
      
      try {
        // 提取confirmPassword，不发送到API
        const { confirmPassword, ...userData } = this.formData
        
        await this.register(userData)
        
        // 注册成功，跳转到仪表板
        this.$router.push('/dashboard')
      } catch (error) {
        // 错误已经在store中处理
        console.error('注册失败:', error)
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
</style>